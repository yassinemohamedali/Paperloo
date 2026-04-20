import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Groq from "npm:groq-sdk"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY')
})

const buildPrompt = (type: string, site: any, answers: any, jurisdictions: string[]) => {
  const baseInfo = `
    Company/Site name: ${site.name}
    Website URL: ${site.url}
    Jurisdictions: ${jurisdictions.join(', ')}
    Contact email: ${answers.contact_email ?? 'privacy@' + site.url.replace(/https?:\/\//, '')}
    Data collected: ${answers.data_collected?.join(', ') ?? 'email addresses, usage data'}
    Uses cookies: ${answers.uses_cookies ? 'yes' : 'no'}
    Cookie types: ${answers.cookie_types?.join(', ') ?? 'essential'}
    Third party services: ${answers.third_party_services?.join(', ') ?? 'none'}
    Sells data: ${answers.sells_data ? 'yes' : 'no'}
    Has users under 13: ${answers.has_minors ? 'yes' : 'no'}
    Effective date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  `

  const prompts: Record<string, string> = {
    privacy_policy: `Generate a complete, professional Privacy Policy in HTML format for the following website. Include all required sections for the specified jurisdictions (GDPR rights if EU, CCPA rights if California, COPPA section if minors, etc.). Make it thorough, legally sound, and readable.\n\n${baseInfo}`,
    
    terms_of_service: `Generate a complete, professional Terms of Service agreement in HTML format for the following website. Include sections on use of service, intellectual property, limitation of liability, governing law, and termination. Make it appropriate for the specified jurisdictions.\n\n${baseInfo}`,
    
    cookie_policy: `Generate a complete, professional Cookie Policy in HTML format for the following website. Include what cookies are, types used, how to manage them, and third-party cookies. Be specific about the cookie types listed.\n\n${baseInfo}`,
    
    eula: `Generate a complete End User License Agreement (EULA) in HTML format for the following website/application. Include license grant, restrictions, termination, and disclaimer sections.\n\n${baseInfo}`,
    
    acceptable_use: `Generate a complete Acceptable Use Policy in HTML format for the following platform. Include prohibited activities, enforcement, and reporting procedures.\n\n${baseInfo}`,
    
    disclaimer: `Generate a complete Disclaimer in HTML format for the following website. Include general disclaimer, professional advice disclaimer, and limitation of liability.\n\n${baseInfo}`,
    
    return_policy: `Generate a complete Return and Refund Policy in HTML format for the following e-commerce website. Include return window, conditions, process, and refund timeline.\n\n${baseInfo}`,
    
    accessibility_statement: `Generate a complete Accessibility Statement in HTML format for the following website. Include WCAG 2.1 compliance level, known issues, and contact information for accessibility concerns.\n\n${baseInfo}`
  }
  
  return prompts[type] ?? prompts.privacy_policy
}

const generateDocument = async (type: string, site: any, answers: any, jurisdictions: string[]) => {
  const prompt = buildPrompt(type, site, answers, jurisdictions)
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a legal document specialist. Generate professional, legally-structured compliance documents in HTML format. Use proper headings, sections, and paragraphs. Be thorough and jurisdiction-specific. Return ONLY the HTML content, no intro or outro text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 4000
  })
  
  return completion.choices[0]?.message?.content ?? ''
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

    const injectClauses = (type: string, position: string) => {
      return clauses
        ?.filter(c => c.document_type === type && c.position === position)
        .map(c => `<div class="custom-clause"><h2>${c.title}</h2><p>${c.content}</p></div>`)
        .join('') || '';
    }

    const docsToGenerate = [
      'privacy_policy',
      'terms_of_service',
      'cookie_policy',
      'eula',
      'acceptable_use',
      'disclaimer',
      'return_policy',
      'accessibility_statement'
    ]

    const results = []
    for (const type of docsToGenerate) {
      const aiContent = await generateDocument(type, site, answers, jurisdictions)
      
      const finalContent = `
        <div dir="${language === 'AR' ? 'rtl' : 'ltr'}">
          ${injectClauses(type, 'beginning')}
          ${aiContent}
          ${injectClauses(type, 'end')}
        </div>
      `

      const { data: existingDoc } = await supabase
        .from('documents')
        .select('*')
        .eq('site_id', site_id)
        .eq('type', type)
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
            changelog_note: `AI GENERATED UPDATE (${language}) VIA GROQ.`
          })

        const { data: updatedDoc, error: updateError } = await supabase
          .from('documents')
          .update({
            content: finalContent,
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
            type: type,
            content: finalContent,
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
