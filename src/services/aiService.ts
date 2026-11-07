import { supabase } from "@/src/lib/supabase";
import { escapeHtml, sanitizeDocHtml } from "@/src/lib/sanitizeHtml";
import { assembleDocumentFromClauses, buildCookieInventoryFromAnswers, buildSubProcessorsFromAnswers } from "@/src/data/clauseLibrary";

export const generateDocuments = async (siteId: string, language: string = "en") => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    // 1. Try server-side generation endpoint
    const response = await fetch(`/api/sites/${siteId}/generate-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ language })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.documents && data.documents.length > 0) {
        console.log(`[AI DOCS] Successfully generated ${data.documents.length} documents via server.`);
        return data.documents;
      }
    }
  } catch (err) {
    console.warn('[AI DOCS] Server generation endpoint had an issue, using client generation engine:', err);
  }

  // 2. Client-side fallback generation
  return fallbackClientSideGeneration(siteId, language);
};

// Modular clause-based legal document synthesis
const generateLegalDocFallback = (
  type: string,
  siteName: string,
  siteUrl: string,
  jurisdictions: string[],
  language: string,
  answers: Record<string, any> = {}
): string => {
  const assembled = assembleDocumentFromClauses(
    type as any,
    { name: siteName, url: siteUrl, jurisdictions },
    answers,
    answers.scanned_cookies_inventory
  );
  return assembled.html;
};

const fallbackClientSideGeneration = async (siteId: string, language: string) => {
  console.log('[AI DOCS] Starting modular clause-based document generation for site:', siteId);
  
  const { data: siteData, error: siteError } = await (supabase.from('sites').select('*').eq('id', siteId).single() as any);
  if (siteError || !siteData) throw new Error(`Site missing: ${siteError?.message || 'Not found'}`);
  const site = siteData as any;

  const { data: responseData } = await (supabase.from('questionnaire_responses').select('*').eq('site_id', siteId).maybeSingle() as any);
  const response = responseData as any;

  const { data: clausesData } = await (supabase.from('custom_clauses').select('*').eq('site_id', siteId) as any);
  const clauses = (clausesData || []) as any[];

  const answers = response?.answers || response || {};
  const jurisdictions: string[] = site.jurisdictions || ['GDPR (EU)'];
  
  const docTypes = [
    'privacy_policy',
    'terms_of_service',
    'cookie_policy',
    'acceptable_use',
    'return_policy',
    'accessibility_statement'
  ];

  if (answers.distributes_software === true) {
    docTypes.push('eula');
  } else {
    // Drop EULA if site does not distribute downloadable software (per Audit Blocker 4)
    try {
      await (supabase.from('documents') as any).delete().eq('site_id', siteId).eq('type', 'eula');
    } catch (e) {
      console.warn('Could not clean up EULA:', e);
    }
  }

  if (answers.provides_advice === true) {
    docTypes.push('disclaimer');
  } else {
    // Drop advice disclaimer if site does not provide medical/legal/financial advice
    try {
      await (supabase.from('documents') as any).delete().eq('site_id', siteId).eq('type', 'disclaimer');
    } catch (e) {
      console.warn('Could not clean up disclaimer:', e);
    }
  }

  // Process all document types concurrently using modular clause library
  const generateSingleDocument = async (type: string) => {
    // Generate modular content deterministically from clauses
    const modularResult = assembleDocumentFromClauses(
      type as any,
      site,
      answers,
      answers.scanned_cookies_inventory
    );

    let docHtml = modularResult.html;

    // Inject custom user clauses if defined
    const beginningClauses = clauses?.filter(c => c.document_type === type && c.position === 'beginning')
      .map(c => `<h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.content).replace(/\n/g, '<br/>')}</p>`).join('') || '';

    const endClauses = clauses?.filter(c => c.document_type === type && c.position === 'end')
      .map(c => `<h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.content).replace(/\n/g, '<br/>')}</p>`).join('') || '';

    const rawCombinedContent = `<div dir="${language === 'ar' ? 'rtl' : 'ltr'}" class="legal-doc-content">${beginningClauses}${docHtml}${endClauses}</div>`;
    const finalContent = sanitizeDocHtml(rawCombinedContent);

    // Save to Supabase DB
    const { data: existingDocs } = await (supabase
      .from('documents')
      .select('*')
      .eq('site_id', siteId)
      .eq('type', type as any)
      .order('created_at', { ascending: false })
      .limit(1) as any);
    
    const existingDoc = existingDocs?.[0];

    if (existingDoc) {
      await (supabase.from('document_versions') as any).insert({
        document_id: existingDoc.id,
        site_id: siteId,
        content: existingDoc.content,
        version: existingDoc.version,
        changelog_note: 'Regenerated via Modular Clause Engine'
      });

      const { data: updatedDoc, error: updateError } = await (supabase.from('documents') as any).update({
        content: finalContent,
        version: (existingDoc.version || 1) + 1,
        is_active: true,
        language: language
      }).eq('id', existingDoc.id).select().single() as any;
      
      if (!updateError && updatedDoc) {
        return updatedDoc;
      }
    } else {
      const { data: newDoc, error: insertError } = await (supabase.from('documents') as any).insert({
        site_id: siteId,
        type: type as any,
        content: finalContent,
        version: 1,
        is_active: true,
        language: language
      }).select().single() as any;
      
      if (!insertError && newDoc) {
        return newDoc;
      }
    }

    return null;
  };

  // Run all 8 document types in parallel
  const docResults = await Promise.all(docTypes.map(t => generateSingleDocument(t)));
  const results = docResults.filter(Boolean);

  await (supabase.from('sites') as any).update({ 
    status: 'active'
  }).eq('id', siteId);
  
  console.log(`[AI DOCS] Modular document generation complete. Successfully saved ${results.length} documents.`);
  
  // Trigger compliance calculation after saving documents
  try {
    const { calculateComplianceScore } = await import('@/src/lib/compliance');
    await calculateComplianceScore(siteId);
  } catch (err) {
    console.error('Failed to trigger compliance score update after doc generation:', err);
  }

  return results;
};
