import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from "https://esm.sh/stripe@11"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // SEC-FIX: Authenticate user session
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { planId, agencyId } = await req.json()

    if (!planId) {
      return new Response(JSON.stringify({ error: 'planId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // SEC-FIX: Enforce that the authenticated user matches the target agencyId (or use authenticated user's ID)
    const targetUserId = user.id
    if (agencyId && agencyId !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: Cannot create checkout sessions for other accounts' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // SEC-FIX: Sanitize origin URL to prevent open-redirect vulnerabilities
    const rawOrigin = req.headers.get('origin') || ''
    let safeOrigin = 'http://localhost:3000'
    try {
      if (rawOrigin) {
        const parsed = new URL(rawOrigin)
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          safeOrigin = `${parsed.protocol}//${parsed.host}`
        }
      }
    } catch (_) {
      // Use fallback
    }

    const priceEnvVar = `STRIPE_PRICE_${planId.toUpperCase()}`
    const priceId = Deno.env.get(priceEnvVar)
    if (!priceId) {
      return new Response(JSON.stringify({ error: `Price ID not configured for plan ${planId}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${safeOrigin}/billing?success=true`,
      cancel_url: `${safeOrigin}/billing?canceled=true`,
      metadata: { agencyId: targetUserId, planId },
      client_reference_id: targetUserId,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
