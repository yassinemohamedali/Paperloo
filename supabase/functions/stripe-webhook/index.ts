import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@11"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('No signature', { status: 400 })

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const agencyId = session.metadata.agencyId
      const planId = session.metadata.planId

      // Update profile plan
      await supabase
        .from('profiles')
        .update({ plan: planId })
        .eq('id', agencyId)

      // Upsert subscription
      await supabase
        .from('subscriptions')
        .upsert({
          agency_id: agencyId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan: planId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
        }, { onConflict: 'agency_id' })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
