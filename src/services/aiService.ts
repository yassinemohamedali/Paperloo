import { supabase } from "@/src/lib/supabase";
import { config } from "@/src/config/env";

export const generateDocuments = async (siteId: string, language: string = "en") => {
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
  
  const answers = response?.answers || response || {};
  const jurisdictions = site.jurisdictions || [];
  
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

  const collectedData = [];
  if (answers.collects_email || answers.email || answers.collect_email || answers.email_address || answers.email_addresses) {
    collectedData.push("Email Addresses");
  }
  if (answers.collects_names || answers.full_names || answers.collect_names || answers.names || answers.name) {
    collectedData.push("Full Names");
  }
  if (answers.collects_payment || answers.payment || answers.collect_payment || answers.payment_info || answers.payment_information) {
    collectedData.push("Payment Information");
  }
  if (answers.collects_location || answers.location || answers.collect_location || answers.location_data || answers.geolocation) {
    collectedData.push("Location Data");
  }
  if (Array.isArray(answers.collected_data)) {
    answers.collected_data.forEach((item: string) => {
      if (!collectedData.includes(item)) collectedData.push(item);
    });
  }

  const thirdPartyTrackers = [];
  if (answers.uses_analytics || answers.analytics) thirdPartyTrackers.push("Analytics Providers (e.g. Google Analytics)");
  if (answers.uses_social_login || answers.social_login) thirdPartyTrackers.push("Social Login Providers");
  if (answers.uses_ads || answers.ads) thirdPartyTrackers.push("Advertising & Marketing Networks");

  const domain = site.url ? new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname.replace('www.', '') : 'example.com';

  const retention = answers.data_retention_period ?? answers.retention_period ?? answers.retention ?? answers.data_retention ?? 12;
  const dataList = collectedData.length > 0 
    ? collectedData.join(", ") 
    : "Email Addresses, Full Names, Payment Information, Location Data";

  const thirdPartiesList = thirdPartyTrackers.length > 0 
    ? thirdPartyTrackers.join(", ") 
    : "Google Analytics";

  const includesAustralia = jurisdictions.some(j => {
    const lj = String(j).toLowerCase();
    return lj.includes('australia') || lj.includes('privacy_act') || lj.includes('app') || lj.includes('oaic');
  });

  const isAustraliaOnly = jurisdictions.length > 0 && jurisdictions.every(j => {
    const lj = String(j).toLowerCase();
    return lj.includes('australia') || lj.includes('privacy_act') || lj.includes('app') || lj.includes('oaic');
  });

  const officerTitle = includesAustralia ? "Privacy Officer" : "Data Protection Officer";
  const cookieSectionTitle = includesAustralia ? "Cookies and Online Tracking" : "ePrivacy Cookie & Tracking";

  const dpoContact = answers.has_data_officer !== false 
    ? (includesAustralia ? "privacy@" + domain : "privacy@" + domain)
    : "privacy@example.com";

  const isOnlyUS = jurisdictions.length > 0 && jurisdictions.every(j => ['CCPA', 'CPRA', 'VCDPA'].includes(j));
  const isOnlyEU = jurisdictions.length > 0 && jurisdictions.every(j => ['GDPR', 'UK GDPR'].includes(j));

  let tableHeader = "Legal Basis / Purpose";
  if (isOnlyUS) {
    tableHeader = "Business or Commercial Purpose";
  } else if (isAustraliaOnly) {
    tableHeader = "Australian Privacy Principle (APP) Purpose";
  } else if (jurisdictions.includes("GDPR") || jurisdictions.includes("UK GDPR")) {
    tableHeader = "Legal Basis (GDPR Art. 6)";
    if (jurisdictions.includes("LGPD")) tableHeader = "Legal Basis (GDPR Art. 6 / LGPD Art. 7)";
  } else if (jurisdictions.includes("LGPD")) {
    tableHeader = "Legal Basis (LGPD Art. 7)";
  } else if (jurisdictions.includes("POPIA")) {
    tableHeader = "Condition for Lawful Processing (POPIA)";
  }

  const userContext = JSON.stringify({
    personalData: dataList.split(", "),
    thirdParties: thirdPartiesList.split(", "),
    displaysAds: answers.uses_ads !== false ? true : false,
    retentionPeriodMonths: retention,
    hasDPO: answers.has_data_officer !== false,
    dpoEmail: dpoContact
  }, null, 2);

  const langNames: Record<string, string> = {
    en: 'English',
    fr: 'French (Français)',
    ar: 'Arabic (العربية)',
    es: 'Spanish (Español)',
    pt: 'Portuguese (Português)',
    de: 'German (Deutsch)',
  };
  const targetLanguageName = langNames[language] || language || 'English';

  for (const type of docTypes) {
    console.log(`Generating ${type}...`);

    let docSpecificInstructions = "";
    if (type === 'privacy_policy' || type === 'cookie_policy') {
      docSpecificInstructions = `
    1. Populate every row in the Data Collection table using the collected data types listed above (${dataList}). The table MUST include a 3rd column mapping each item to its explicit legal ground or purpose, titled "${tableHeader}".
    2. Hardcode the retention period as exactly "${retention} months". Do not use fallback words like "Standard".
    3. Include a "${cookieSectionTitle}" section detailing opt-out mechanisms for the Analytics & Trackers listed above. Do NOT use "ePrivacy" terminology if Australia is selected.
    4. Clearly list all user rights applicable to the selected jurisdictions. Include the right to lodge a complaint with the relevant authority (for Australia, direct reference to the Office of the Australian Information Commissioner / OAIC).
    5. If applicable, explicitly state the transfer mechanisms used.`;
    } else if (type === 'terms_of_service') {
      docSpecificInstructions = `
    1. Focus on user accounts, acceptable use, intellectual property, limitation of liability, and governing law based on selected jurisdictions (${jurisdictions.join(', ')}).
    2. Do NOT include a Data Collection table or ePrivacy tracking section.`;
    } else if (type === 'return_policy') {
      docSpecificInstructions = `
    1. Detail refund windows, shipping obligations, and return eligibility for physical products or SaaS subscriptions.`;
    } else if (type === 'accessibility_statement') {
      docSpecificInstructions = `
    1. Express definitive compliance commitment to W3C Web Content Accessibility Guidelines (WCAG 2.1 Level AA), Americans with Disabilities Act (ADA Title III), Section 508 of the US Rehabilitation Act, and the European Accessibility Act (EAA EN 301 549).
    2. Outline implemented technical accessibility features: ARIA landmarks, minimum 4.5:1 text contrast ratios, full keyboard tab-navigation support, screen reader compatibility (NVDA, JAWS, VoiceOver), and reduced motion support.
    3. Include explicit alternative format SLA: Guarantee alternative document formats (large print, plain text, audio transcript) within 48 business hours upon request to ${dpoContact}.
    4. Provide direct contact information for accessibility escalation and formal reporting.`;
    } else {
      docSpecificInstructions = `
    1. Ensure the document addresses the specific legal requirements for a ${type.replace(/_/g, ' ')} under the selected jurisdictions.
    2. Do NOT include a Data Collection table or ePrivacy tracking section unless explicitly relevant to the document type.`;
    }

    const prompt = `Generate a legally robust ${type.replace(/_/g, ' ')} in HTML format tailored to the selected jurisdictions (${jurisdictions.join(', ')}) based strictly on these verified properties:
    - Company: ${site.name}
    - Collected Data Types: ${dataList}
    - Retention Period: ${retention} months
    - Analytics & Trackers: ${thirdPartiesList}
    - Designated Privacy Lead/Officer Contact: ${dpoContact}

    CRITICAL FORMATTING RULES:${docSpecificInstructions}

    JURISDICTION ISOLATION RULE:
    When only ONE jurisdiction (or regional framework) is selected, do NOT reference other frameworks or standards.
    - If CCPA only: Do not mention GDPR, SCCs, or EU DPA complaint rights. Use "Business Purpose" instead of "Legal Basis". Include a 12-month historical disclosure section ("In the preceding 12 months, we have collected...").
    - If POPIA only: Use "Information Officer" and "Information Regulator". Do not cite EU Article 6. List the 8 Conditions for Lawful Processing.
    - If Law 25 only: Use "Person in Charge of Protection of Personal Information" and mandate default opt-out tracking.
    - If PIPEDA only: Mandate a plain-language explanation of "meaningful consent" and specific disclosures for service provider transfers.
    - If KVKK or PDPL only: State local cross-border data transfer restrictions. Do not cite EU SCCs alone without explicit approval mention.
    - If APPI only: Distinguish between "Personal Information" and "Retained Personal Data," along with specific disclosures when providing data to third parties in foreign countries.
    - If Australia (Privacy Act) / APPs only: 
      * Replace "Data Protection Officer (DPO)" with "Privacy Officer" or "Privacy Lead".
      * Replace "ePrivacy Cookie and Tracking" header with "Cookies and Online Tracking".
      * Reference the 13 Australian Privacy Principles (APPs) and the Privacy Act 1988.
      * Include a dedicated section for APP 8 (Disclosure to Overseas Recipients).
      * Include direct reference to lodging complaints with the Office of the Australian Information Commissioner (OAIC).
      * Do NOT mention GDPR, CCPA, Law 25, ePrivacy Directive, or EU DPA complaint rights.

    MULTI-JURISDICTION INJECTION INSTRUCTIONS:
    1. IF CCPA/CPRA is selected:
       - Add a section titled "California Privacy Rights (CCPA/CPRA)".
       - Include explicit "Right to Opt-Out of Sale/Sharing" and "Do Not Sell or Share My Personal Information" notices.
       - Disclose handling of Sensitive Personal Information (Location Data) and support for Global Privacy Control (GPC) signals.
    2. IF Law 25 (Quebec) is selected:
       - Add a section titled "Quebec Privacy Notice (Law 25)".
       - State that tracking/profiling technologies are disabled by default until express consent is given.
       - Mention that data transferred outside Quebec undergoes a Privacy Impact Assessment (PIA).
    3. IF LGPD (Brazil) is selected:
       - Map legal bases explicitly to LGPD Article 7.
    4. IF POPIA (South Africa) is selected:
       - Include the title "Information Officer" alongside "Data Protection Officer".

    STRICT LANGUAGE & TRANSLATION MANDATE:
    You MUST output the entire document in ${targetLanguageName}. All section titles, headings, clauses, disclosures, tables, and legal language MUST be fluently written and translated in ${targetLanguageName}. Do NOT output in English unless ${targetLanguageName} is English.

    STRICT RULE: Never output phrases like "Since no specific data was provided...", "As no retention period was given...", or "No DPO was specified." Every statement in the generated policy must be written as a definitive, legally binding commitment from the company to the user.

    FORMATTING: Return ONLY valid HTML content inside the body (excluding <html>, <head>, or <body> tags). Use headings (<h2>, <h3>), paragraphs (<p>), and unordered lists (<ul>).`;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch("/api/generate-content", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          prompt,
          systemInstruction: 'You are a legal specialist. Return ONLY HTML.',
          temperature: 0.2,
          siteId: siteId
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate content via proxy");
      }

      const completion = await response.json();
      let aiContent = completion.text || '';

      // Clean raw markdown code fences if outputted by LLM
      if (aiContent.includes('```')) {
        aiContent = aiContent.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim();
      }
      
      // Inject custom clauses
      const beginningClauses = clauses?.filter(c => c.document_type === type && c.position === 'beginning')
        .map(c => `<h2>${c.title}</h2><p>${c.content}</p>`).join('') || '';

      const endClauses = clauses?.filter(c => c.document_type === type && c.position === 'end')
        .map(c => `<h2>${c.title}</h2><p>${c.content}</p>`).join('') || '';

      const disclaimer = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; color: #ef4444; font-weight: bold; font-family: sans-serif;">
          LEGAL DISCLAIMER: PAPERLOO IS AN AI-POWERED TOOL AND DOES NOT CONSTITUTE A LAW FIRM. THE CONTENT GENERATED HEREIN IS NOT LEGAL ADVICE AND DOES NOT CREATE AN ATTORNEY-CLIENT RELATIONSHIP. WE ARE NOT LICENSED ATTORNEYS. ALL DOCUMENTS SHOULD BE REVIEWED BY A QUALIFIED LEGAL PROFESSIONAL IN YOUR SPECIFIC JURISDICTION BEFORE USE.
        </div>
      `;

      const finalContent = `<div dir="${language === 'ar' ? 'rtl' : 'ltr'}" class="legal-doc-content">${disclaimer}${beginningClauses}${aiContent}${endClauses}</div>`;

      // Save to DB
      console.log(`Checking for existing ${type}...`);
      const { data: existingDocs, error: checkError } = await (supabase
        .from('documents')
        .select('*')
        .eq('site_id', siteId)
        .eq('type', type as any)
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
  
  // Trigger compliance calculation after saving documents
  try {
    const { calculateComplianceScore } = await import('@/src/lib/compliance');
    await calculateComplianceScore(siteId);
  } catch (err) {
    console.error('Failed to trigger compliance score update after doc generation:', err);
  }

  return results;
};
