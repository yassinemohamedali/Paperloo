import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { site_id, language = 'EN' } = await req.json()
    if (!site_id) {
      return new Response(JSON.stringify({ error: 'site_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', site_id)
      .single()

    if (siteError || !site) {
      return new Response(JSON.stringify({ error: 'Site not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: response } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('site_id', site_id)
      .single()

    const { data: clauses } = await supabase
      .from('custom_clauses')
      .select('*')
      .eq('site_id', site_id)
      .order('order_index', { ascending: true });

    const answers = response?.answers || {}
    const jurisdictions = site.jurisdictions || []
    const effectiveDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const injectClauses = (type: string, position: string) => {
      return clauses
        ?.filter(c => c.document_type === type && c.position === position)
        .map(c => `<div class="custom-clause"><h2>${c.title}</h2><p>${c.content}</p></div>`)
        .join('') || '';
    }

    const generatePrivacyPolicy = () => {
      let html = `<div dir="${language === 'AR' ? 'rtl' : 'ltr'}">`
      html += injectClauses('privacy_policy', 'beginning');
      html += `
        <h1>Privacy Policy</h1>
        <p><strong>Effective Date:</strong> ${effectiveDate}</p>
        <p>This Privacy Policy describes how ${site.name} ("we", "us", or "our") collects, uses, and discloses your personal information when you visit ${site.url} (the "Site").</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, information collected automatically when you use our Site, and information from third-party sources.</p>
      `

      if (answers.third_party_services?.length > 0) {
        html += `<h3>Third-Party Services</h3><ul>`
        answers.third_party_services.forEach((service: any) => {
          html += `<li><strong>${service.name}:</strong> ${service.purpose}</li>`
        })
        html += `</ul>`
      }

      if (jurisdictions.includes('GDPR (EU)')) {
        html += `
          <h2>2. Lawful Basis for Processing (GDPR)</h2>
          <p>If you are in the European Economic Area (EEA), we process your personal data under the following lawful bases:</p>
          <ul>
            <li>Your consent;</li>
            <li>The performance of a contract between you and us;</li>
            <li>Compliance with our legal obligations;</li>
            <li>Our legitimate interests, provided they do not override your fundamental rights and freedoms.</li>
          </ul>
        `
      }

      html += `
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at paperloo.official@gmail.com.</p>
      `
      html += injectClauses('privacy_policy', 'end');
      html += `</div>`
      return html
    }

    const generateTermsOfService = () => {
      let html = `<div dir="${language === 'AR' ? 'rtl' : 'ltr'}">`
      html += injectClauses('terms_of_service', 'beginning');
      html += `
        <h1>Terms of Service</h1>
        <p><strong>Effective Date:</strong> ${effectiveDate}</p>
        <p>Welcome to ${site.name}. By accessing ${site.url}, you agree to be bound by these Terms of Service.</p>
        
        <h2>1. Use of the Site</h2>
        <p>You agree to use the Site only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the Site.</p>
        
        <h2>2. Intellectual Property</h2>
        <p>All content on this Site, including text, graphics, logos, and images, is the property of ${site.name} and is protected by intellectual property laws.</p>
        
        <h2>3. Contact</h2>
        <p>Questions about the Terms of Service should be sent to us at paperloo.official@gmail.com.</p>
      `
      html += injectClauses('terms_of_service', 'end');
      html += `</div>`
      return html
    }

    const generateCookiePolicy = () => {
      let html = `<div dir="${language === 'AR' ? 'rtl' : 'ltr'}">`
      html += injectClauses('cookie_policy', 'beginning');
      html += `
        <h1>Cookie Policy</h1>
        <p><strong>Effective Date:</strong> ${effectiveDate}</p>
        <p>This Cookie Policy explains how ${site.name} uses cookies and similar technologies on ${site.url}.</p>
      `
      html += `
        <h2>Contact Us</h2>
        <p>If you have questions about our use of cookies, please contact us at paperloo.official@gmail.com.</p>
      `
      html += injectClauses('cookie_policy', 'end');
      html += `</div>`
      return html
    }

    const docsToGenerate = [
      { type: 'privacy_policy', content: generatePrivacyPolicy() },
      { type: 'terms_of_service', content: generateTermsOfService() },
      { type: 'cookie_policy', content: generateCookiePolicy() },
    ]

    const results = []
    for (const doc of docsToGenerate) {
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('*')
        .eq('site_id', site_id)
        .eq('type', doc.type)
        .eq('language', language)
        .eq('is_active', true)
        .maybeSingle()

      if (existingDoc) {
        await supabase
          .from('document_versions')
          .insert({
            document_id: existingDoc.id,
            site_id: site_id,
            content: existingDoc.content,
            version: existingDoc.version,
            changelog_note: `AUTOMATED UPDATE FOR ${language} VERSION.`
          })

        const { data: updatedDoc, error: updateError } = await supabase
          .from('documents')
          .update({
            content: doc.content,
            version: existingDoc.version + 1,
            created_at: new Date().toISOString()
          })
          .eq('id', existingDoc.id)
          .select()
          .single()

        if (updateError) throw updateError
        results.push(updatedDoc)
      } else {
        const { data: newDoc, error: insertError } = await supabase
          .from('documents')
          .insert({
            site_id,
            type: doc.type,
            content: doc.content,
            version: 1,
            is_active: true,
            language: language
          })
          .select()
          .single()

        if (insertError) throw insertError
        results.push(newDoc)
      }
    }

    await supabase
      .from('sites')
      .update({ 
        status: 'active',
        last_reviewed_at: new Date().toISOString()
      })
      .eq('id', site_id)

    return new Response(JSON.stringify({ success: true, documents: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
