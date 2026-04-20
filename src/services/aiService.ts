import Groq from "groq-sdk";
import { supabase } from "@/src/lib/supabase";

let groq: Groq | null = null;

export const getGroqClient = () => {
  if (!groq) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ API Key (VITE_GROQ_API_KEY) is missing. Please set it in your environment variables.");
    }
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
    console.log('Attempting to invoke edge function...');
    const { data, error } = await supabase.functions.invoke('generate-documents', {
      body: { site_id: siteId, language }
    });

    if (!error && data?.success) {
      return data.documents;
    }

    console.warn('Edge function failed or not deployed, falling back to client-side generation:', error);
  } catch (err) {
    console.warn('Edge function invocation failed, falling back:', err);
  }

  // 2. Fallback to client-side generation if Edge Function is unavailable
  return fallbackClientSideGeneration(siteId, language);
};

const fallbackClientSideGeneration = async (siteId: string, language: string) => {
  const { data: siteData } = await (supabase.from('sites').select('*').eq('id', siteId).single() as any);
  const site = siteData as any;
  const { data: responseData } = await (supabase.from('questionnaire_responses').select('*').eq('site_id', siteId).single() as any);
  const response = responseData as any;
  const { data: clausesData } = await (supabase.from('custom_clauses').select('*').eq('site_id', siteId) as any);
  const clauses = (clausesData || []) as any[];

  if (!site) throw new Error("Site not found");
  
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
    const prompt = `Generate a professional ${type.replace(/_/g, ' ')} in HTML format for:
    Website: ${site.name} (${site.url})
    Jurisdictions: ${jurisdictions.join(', ')}
    Answers: ${JSON.stringify(answers)}
    Language: ${language}
    Return ONLY the HTML content.`;

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

    const finalContent = `<div dir="${language === 'ar' ? 'rtl' : 'ltr'}">${beginningClauses}${aiContent}${endClauses}</div>`;

    // Save to DB
    const { data: existingDocData } = await (supabase.from('documents').select('*').eq('site_id', siteId).eq('type', type).eq('language', language).maybeSingle() as any);
    const existingDoc = existingDocData as any;

    if (existingDoc) {
      await (supabase.from('document_versions') as any).insert({
        document_id: existingDoc.id,
        site_id: siteId,
        content: existingDoc.content,
        version: existingDoc.version,
        changelog_note: 'Regenerated via fallback'
      });

      const { data: updatedDoc } = await (supabase.from('documents') as any).update({
        content: finalContent,
        version: existingDoc.version + 1
      }).eq('id', existingDoc.id).select().single();
      results.push(updatedDoc);
    } else {
      const { data: newDoc } = await (supabase.from('documents') as any).insert({
        site_id: siteId,
        type: type as any,
        content: finalContent,
        version: 1,
        language,
        is_active: true
      }).select().single();
      results.push(newDoc);
    }
  }

  await (supabase.from('sites') as any).update({ status: 'active', last_reviewed_at: new Date().toISOString() }).eq('id', siteId);
  return results;
};
