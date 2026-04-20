import Groq from "groq-sdk";
import { supabase } from "@/src/lib/supabase";

let groq: Groq | null = null;

export const getGroqClient = () => {
  if (!groq) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    console.log('Checking for VITE_GROQ_API_KEY...');
    if (!apiKey) {
      console.error("VITE_GROQ_API_KEY is missing!");
      throw new Error("GROQ API Key (VITE_GROQ_API_KEY) is missing. Please set it in your environment variables and restart the dev server.");
    }
    console.log('Groq client initializing...');
    groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  return groq;
};

export const generateDocuments = async (siteId: string, language: string = 'en') => {
  try {
    // 1. Try invoking the Supabase Edge Function first
    console.log('Attempting to invoke edge function for site:', siteId);
    const { data, error } = await supabase.functions.invoke('generate-documents', {
      body: { site_id: siteId, language }
    });

    if (!error && data?.success) {
      console.log('Edge function success:', data.documents?.length, 'docs');
      return data.documents;
    }

    if (error) {
       console.warn('Edge function error:', error.message || error);
    } else if (data && !data.success) {
       console.warn('Edge function returned failure:', data.error);
    }
    
    console.warn('Edge function not optimal, falling back to client-side generation.');
  } catch (err) {
    console.warn('Edge function invocation failed, falling back:', err);
  }

  // 2. Fallback to client-side generation if Edge Function is unavailable
  return fallbackClientSideGeneration(siteId, language);
};

const fallbackClientSideGeneration = async (siteId: string, language: string) => {
  console.log('Starting client-side fallback generation...');
  
  const { data: siteData, error: siteError } = await (supabase.from('sites').select('*').eq('id', siteId).single() as any);
  if (siteError) throw new Error(`Site missing: ${siteError.message}`);
  const site = siteData as any;

  const { data: responseData } = await (supabase.from('questionnaire_responses').select('*').eq('site_id', siteId).single() as any);
  const response = responseData as any;

  const { data: clausesData } = await (supabase.from('custom_clauses').select('*').eq('site_id', siteId) as any);
  const clauses = (clausesData || []) as any[];

  if (!site) throw new Error("Site not found in database");
  
  const answers = response?.answers || {};
  const jurisdictions = site.jurisdictions || [];
  
  const client = getGroqClient();

  const docTypes = [
    'privacy_policy',
    'terms_of_service',
    'cookie_policy',
    'eula',
    'acceptable_use',
    'disclaimer',
    'return_policy',
    'accessibility_statement'
  ];

  const results = [];

  for (const type of docTypes) {
    console.log(`Generating ${type}...`);
    const prompt = `Generate a professional ${type.replace(/_/g, ' ')} in HTML format for:
    Website Name: ${site.name}
    Website URL: ${site.url}
    Jurisdictions: ${jurisdictions.join(', ')}
    Company Context: ${JSON.stringify(answers)}
    Target Language: ${language}
    
    CRITICAL: Return ONLY the HTML content inside the body (excluding <html>, <head>, or <body> tags). Use standard HTML formatting.`;

    try {
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a legal specialist. Return ONLY HTML.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2
      });

      const aiContent = completion.choices[0]?.message?.content || '';
      
      // Inject custom clauses
      const beginningClauses = clauses?.filter(c => c.document_type === type && c.position === 'beginning')
        .map(c => `<h2>${c.title}</h2><p>${c.content}</p>`).join('') || '';
      const endClauses = clauses?.filter(c => c.document_type === type && c.position === 'end')
        .map(c => `<h2>${c.title}</h2><p>${c.content}</p>`).join('') || '';

      const finalContent = `<div dir="${language === 'ar' ? 'rtl' : 'ltr'}" class="legal-doc-content">${beginningClauses}${aiContent}${endClauses}</div>`;

      // Save to DB
      console.log(`Checking for existing ${type}...`);
      const { data: existingDocs, error: checkError } = await (supabase
        .from('documents')
        .select('*')
        .eq('site_id', siteId)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1) as any);
      
      if (checkError) console.error(`Error checking existing ${type}:`, checkError);
      const existingDoc = existingDocs?.[0];

      if (existingDoc) {
        console.log(`Updating existing ${type} (ID: ${existingDoc.id})...`);
        await (supabase.from('document_versions') as any).insert({
          document_id: existingDoc.id,
          site_id: siteId,
          content: existingDoc.content,
          version: existingDoc.version,
          changelog_note: 'Regenerated via UI'
        });

        const { data: updatedDoc, error: updateError } = await (supabase.from('documents') as any).update({
          content: finalContent,
          version: (existingDoc.version || 1) + 1,
          is_active: true,
          language: language
        }).eq('id', existingDoc.id).select().single() as any;
        
        if (updateError) {
          console.error(`Error updating ${type}:`, updateError);
        } else {
          console.log(`Successfully updated ${type}`);
          results.push(updatedDoc);
        }
      } else {
        console.log(`Inserting new ${type}...`);
        const { data: newDoc, error: insertError } = await (supabase.from('documents') as any).insert({
          site_id: siteId,
          type: type as any,
          content: finalContent,
          version: 1,
          is_active: true,
          language: language
        }).select().single() as any;
        
        if (insertError) {
          console.error(`Error inserting ${type}:`, insertError);
        } else {
          console.log(`Successfully inserted ${type} (ID: ${newDoc?.id})`);
          results.push(newDoc);
        }
      }
    } catch (docErr) {
      console.error(`Failed to generate ${type}:`, docErr);
    }
  }

  await (supabase.from('sites') as any).update({ 
    status: 'active'
  }).eq('id', siteId);
  
  console.log('Fallback generation complete. Saved', results.length, 'documents.');
  return results;
};
