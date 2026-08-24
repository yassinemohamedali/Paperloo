import { supabase } from "@/src/lib/supabase";
import { escapeHtml, sanitizeDocHtml } from "@/src/lib/sanitizeHtml";

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

// Built-in client-side legal generator fallback to guarantee 100% success rate even if LLM/network fails
const generateLegalDocFallback = (
  type: string,
  siteName: string,
  siteUrl: string,
  jurisdictions: string[],
  language: string,
  dataList: string,
  thirdPartiesList: string,
  retention: number | string,
  dpoContact: string
): string => {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const jurisdictionsStr = jurisdictions.length > 0 ? jurisdictions.join(', ') : 'GDPR, CCPA';

  switch (type) {
    case 'privacy_policy':
      return `
        <h2>Privacy Policy</h2>
        <p>Last updated: ${dateStr}</p>
        <p><strong>${escapeHtml(siteName)}</strong> ("we", "our", or "us") operates the website located at <strong>${escapeHtml(siteUrl)}</strong>. We are committed to safeguarding the privacy and personal data of our users in full compliance with applicable statutory standards (${escapeHtml(jurisdictionsStr)}).</p>

        <h3>1. Scope & Applicable Frameworks</h3>
        <p>This Privacy Policy outlines our data handling practices under global data protection frameworks including the General Data Protection Regulation (GDPR), California Consumer Privacy Act / CPRA, Brazilian LGPD, South African POPIA, and Australian Privacy Principles (APPs).</p>

        <h3>2. Categories of Personal Data Collected</h3>
        <p>We process the following categories of personal data collected directly from you or through automated interactions:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
          <thead>
            <tr style="border-bottom: 2px solid rgba(255,255,255,0.2); text-align: left;">
              <th style="padding: 10px;">Data Category</th>
              <th style="padding: 10px;">Collected Items</th>
              <th style="padding: 10px;">Legal Basis / Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
              <td style="padding: 10px;">Primary Identifiers</td>
              <td style="padding: 10px;">${escapeHtml(dataList)}</td>
              <td style="padding: 10px;">Contractual Performance & Customer Service</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
              <td style="padding: 10px;">Analytics & Telemetry</td>
              <td style="padding: 10px;">${escapeHtml(thirdPartiesList)}</td>
              <td style="padding: 10px;">Legitimate Interest (Service Optimization)</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
              <td style="padding: 10px;">Financial / Transactional</td>
              <td style="padding: 10px;">Payment transactions, invoices</td>
              <td style="padding: 10px;">Legal Obligation & Financial Recordkeeping</td>
            </tr>
          </tbody>
        </table>

        <h3>3. Data Retention Schedule</h3>
        <p>We retain personal information for a maximum period of <strong>${escapeHtml(String(retention))} months</strong> or as long as necessary to fulfill the purposes for which it was collected, resolve disputes, and comply with legal requirements.</p>

        <h3>4. Third-Party Integrations & Sub-Processors</h3>
        <p>We work with trusted third-party service providers (${escapeHtml(thirdPartiesList)}) who process data solely on our instructions under strict Data Processing Agreements (DPAs) and standard contractual clauses.</p>

        <h3>5. Your Statutory Privacy Rights</h3>
        <p>Subject to applicable law in your jurisdiction (${escapeHtml(jurisdictionsStr)}), you have the right to:</p>
        <ul>
          <li><strong>Access & Portability:</strong> Request a copy of your personal data in a structured, machine-readable format.</li>
          <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete personal records.</li>
          <li><strong>Erasure / Deletion:</strong> Request prompt deletion of your personal data ("Right to be Forgotten").</li>
          <li><strong>Opt-Out of Sale / Sharing:</strong> California and Virginia residents may opt out of data sharing or behavioral advertising.</li>
          <li><strong>Lodge a Regulatory Complaint:</strong> You may submit complaints to your national or regional data protection authority (e.g., EU DPA, UK ICO, OAIC, or state Attorney General).</li>
        </ul>

        <h3>6. Data Protection Lead & Contact</h3>
        <p>To exercise your rights or submit questions regarding this policy, contact our designated privacy officer at <a href="mailto:${escapeHtml(dpoContact)}">${escapeHtml(dpoContact)}</a>.</p>
      `;

    case 'terms_of_service':
      return `
        <h2>Terms of Service</h2>
        <p>Last updated: ${dateStr}</p>
        <p>These Terms of Service ("Terms") constitute a legally binding agreement between you and <strong>${escapeHtml(siteName)}</strong> concerning your access to and use of <strong>${escapeHtml(siteUrl)}</strong>.</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or utilizing our website and associated digital services, you agree to comply with and be bound by these Terms and our Privacy Policy.</p>

        <h3>2. User Accounts & Security</h3>
        <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>

        <h3>3. Intellectual Property</h3>
        <p>All software, proprietary algorithms, design marks, trademarks, and content on <strong>${escapeHtml(siteUrl)}</strong> remain the exclusive intellectual property of <strong>${escapeHtml(siteName)}</strong>.</p>

        <h3>4. Limitation of Liability</h3>
        <p>To the maximum extent permitted by governing law under the jurisdictions of <strong>${escapeHtml(jurisdictionsStr)}</strong>, <strong>${escapeHtml(siteName)}</strong> and its affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages.</p>

        <h3>5. Governing Law & Dispute Resolution</h3>
        <p>These Terms are governed by and construed in accordance with applicable laws in the designated jurisdiction of registration.</p>
      `;

    case 'cookie_policy':
      return `
        <h2>Cookie & Online Tracking Policy</h2>
        <p>Last updated: ${dateStr}</p>
        <p>This Cookie Policy explains how <strong>${escapeHtml(siteName)}</strong> uses cookies, web beacons, and tracking pixels on <strong>${escapeHtml(siteUrl)}</strong>.</p>

        <h3>1. What Are Cookies</h3>
        <p>Cookies are small text files placed on your device to ensure website functionality, retain session state, and deliver analytical insights.</p>

        <h3>2. Categories of Cookies Deployed</h3>
        <ul>
          <li><strong>Strictly Necessary Cookies:</strong> Essential for platform security, load balancing, and authenticated user navigation.</li>
          <li><strong>Analytics & Performance Cookies (${escapeHtml(thirdPartiesList)}):</strong> Help us understand aggregated visitor trends and optimize loading speeds.</li>
          <li><strong>Preference & Functional Cookies:</strong> Save custom user settings, theme preferences, and localized configurations.</li>
        </ul>

        <h3>3. Managing Consent & Opting Out</h3>
        <p>You can adjust your cookie preferences at any time using our on-site Cookie Consent Banner or via your browser's security settings. Disabling essential cookies may impact specific platform features.</p>
      `;

    case 'eula':
      return `
        <h2>End User License Agreement (EULA)</h2>
        <p>Last updated: ${dateStr}</p>
        <p>This End User License Agreement is a legal contract between you and <strong>${escapeHtml(siteName)}</strong> governing the software services delivered via <strong>${escapeHtml(siteUrl)}</strong>.</p>

        <h3>1. License Grant</h3>
        <p>Subject to these terms, <strong>${escapeHtml(siteName)}</strong> grants you a non-exclusive, non-transferable, revocable license to access and use our application.</p>

        <h3>2. Prohibited Restrictions</h3>
        <p>You shall not reverse engineer, decompile, resell, or distribute the proprietary code without prior written consent.</p>
      `;

    case 'acceptable_use':
      return `
        <h2>Acceptable Use Policy</h2>
        <p>Last updated: ${dateStr}</p>
        <p>This Acceptable Use Policy defines the standards of conduct when interacting with <strong>${escapeHtml(siteName)}</strong> systems.</p>

        <h3>1. Prohibited Activities</h3>
        <ul>
          <li>Unauthorized vulnerability scanning, probing, or denial-of-service attempts.</li>
          <li>Distribution of malicious scripts, botnets, or unsolicited commercial communications (spam).</li>
          <li>Violating intellectual property rights or transmitting unlawful content.</li>
        </ul>
      `;

    case 'disclaimer':
      return `
        <h2>Legal & Information Disclaimer</h2>
        <p>Last updated: ${dateStr}</p>
        <p>The information and tools provided by <strong>${escapeHtml(siteName)}</strong> on <strong>${escapeHtml(siteUrl)}</strong> are for general informational purposes only and do not constitute legal, tax, or professional regulatory advice.</p>
      `;

    case 'return_policy':
      return `
        <h2>Refund & Return Policy</h2>
        <p>Last updated: ${dateStr}</p>
        <p>At <strong>${escapeHtml(siteName)}</strong>, we want to ensure satisfaction with our services. We offer a 14-day refund window on digital subscriptions if requested within the initial billing period. Contact our billing department with your order identifier.</p>
      `;

    case 'accessibility_statement':
      return `
        <h2>Accessibility Statement</h2>
        <p>Last updated: ${dateStr}</p>
        <p><strong>${escapeHtml(siteName)}</strong> is committed to digital inclusion and meeting <strong>WCAG 2.1 Level AA</strong> standards across <strong>${escapeHtml(siteUrl)}</strong>.</p>

        <h3>1. Accessibility Features</h3>
        <ul>
          <li>Semantic HTML hierarchy with full ARIA landmark support</li>
          <li>High-contrast visual compliance meeting minimum 4.5:1 ratios</li>
          <li>Comprehensive keyboard tab navigation and focus indicators</li>
          <li>Screen reader compatibility (NVDA, VoiceOver, JAWS)</li>
        </ul>

        <h3>2. Alternative Formats SLA</h3>
        <p>We provide alternative document formats within 48 business hours upon formal request to <a href="mailto:${escapeHtml(dpoContact)}">${escapeHtml(dpoContact)}</a>.</p>
      `;

    default:
      return `
        <h2>${escapeHtml(type.replace(/_/g, ' ').toUpperCase())}</h2>
        <p>Last updated: ${dateStr}</p>
        <p>Document for <strong>${escapeHtml(siteName)}</strong> governing operations on <strong>${escapeHtml(siteUrl)}</strong>.</p>
      `;
  }
};

const fallbackClientSideGeneration = async (siteId: string, language: string) => {
  console.log('[AI DOCS] Starting comprehensive document generation for site:', siteId);
  
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
    'eula',
    'acceptable_use',
    'disclaimer',
    'return_policy',
    'accessibility_statement'
  ];

  const collectedData: string[] = [];
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

  const thirdPartyTrackers: string[] = [];
  if (answers.uses_analytics || answers.analytics) thirdPartyTrackers.push("Analytics Providers (e.g. Google Analytics)");
  if (answers.uses_social_login || answers.social_login) thirdPartyTrackers.push("Social Login Providers");
  if (answers.uses_ads || answers.ads) thirdPartyTrackers.push("Advertising & Marketing Networks");

  let domain = 'example.com';
  try {
    domain = site.url ? new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname.replace('www.', '') : 'example.com';
  } catch (e) {
    domain = site.url || 'example.com';
  }

  const retention = answers.data_retention_period ?? answers.retention_period ?? answers.retention ?? answers.data_retention ?? 12;
  const dataList = collectedData.length > 0 
    ? collectedData.join(", ") 
    : "Email Addresses, Full Names, Payment Information, Location Data";

  const thirdPartiesList = thirdPartyTrackers.length > 0 
    ? thirdPartyTrackers.join(", ") 
    : "Google Analytics, Essential Service Providers";

  const includesAustralia = jurisdictions.some(j => {
    const lj = String(j).toLowerCase();
    return lj.includes('australia') || lj.includes('privacy_act') || lj.includes('app') || lj.includes('oaic');
  });

  const isAustraliaOnly = jurisdictions.length > 0 && jurisdictions.every(j => {
    const lj = String(j).toLowerCase();
    return lj.includes('australia') || lj.includes('privacy_act') || lj.includes('app') || lj.includes('oaic');
  });

  const cookieSectionTitle = includesAustralia ? "Cookies and Online Tracking" : "ePrivacy Cookie & Tracking";
  const dpoContact = answers.has_data_officer !== false 
    ? "privacy@" + domain
    : `privacy@${domain}`;

  const isOnlyUS = jurisdictions.length > 0 && jurisdictions.every(j => ['CCPA', 'CPRA', 'VCDPA'].includes(j));

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

  const langNames: Record<string, string> = {
    en: 'English',
    fr: 'French (Français)',
    ar: 'Arabic (العربية)',
    es: 'Spanish (Español)',
    pt: 'Portuguese (Português)',
    de: 'German (Deutsch)',
  };
  const targetLanguageName = langNames[language] || language || 'English';

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  // Process all document types concurrently
  const generateSingleDocument = async (type: string) => {
    let docSpecificInstructions = "";
    if (type === 'privacy_policy' || type === 'cookie_policy') {
      docSpecificInstructions = `
    1. Populate every row in the Data Collection table using the collected data types listed above (${dataList}). The table MUST include a 3rd column mapping each item to its explicit legal ground or purpose, titled "${tableHeader}".
    2. Hardcode the retention period as exactly "${retention} months". Do not use fallback words like "Standard".
    3. Include a "${cookieSectionTitle}" section detailing opt-out mechanisms for the Analytics & Trackers listed above. Do NOT use "ePrivacy" terminology if Australia is selected.
    4. Clearly list all user rights applicable to the selected jurisdictions. Include the right to lodge a complaint with the relevant authority.
    5. If applicable, explicitly state the transfer mechanisms used.`;
    } else if (type === 'terms_of_service') {
      docSpecificInstructions = `
    1. Focus on user accounts, acceptable use, intellectual property, limitation of liability, and governing law based on selected jurisdictions (${jurisdictions.join(', ')}).
    2. Do NOT include a Data Collection table or ePrivacy tracking section.`;
    } else if (type === 'accessibility_statement') {
      docSpecificInstructions = `
    1. Express definitive compliance commitment to W3C Web Content Accessibility Guidelines (WCAG 2.1 Level AA), Americans with Disabilities Act (ADA Title III), Section 508 of the US Rehabilitation Act, and the European Accessibility Act (EAA EN 301 549).
    2. Outline implemented technical accessibility features: ARIA landmarks, minimum 4.5:1 text contrast ratios, full keyboard tab-navigation support, screen reader compatibility (NVDA, JAWS, VoiceOver), and reduced motion support.
    3. Include explicit alternative format SLA: Guarantee alternative document formats (large print, plain text, audio transcript) within 48 business hours upon request to ${dpoContact}.
    4. Provide direct contact information for accessibility escalation and formal reporting.`;
    } else {
      docSpecificInstructions = `
    1. Ensure the document addresses the specific legal requirements for a ${type.replace(/_/g, ' ')} under the selected jurisdictions (${jurisdictions.join(', ')}).`;
    }

    const prompt = `Generate a legally robust ${type.replace(/_/g, ' ')} in HTML format tailored to the selected jurisdictions (${jurisdictions.join(', ')}) based strictly on these verified properties:
    - Company: ${site.name}
    - Collected Data Types: ${dataList}
    - Retention Period: ${retention} months
    - Analytics & Trackers: ${thirdPartiesList}
    - Designated Privacy Lead/Officer Contact: ${dpoContact}

    CRITICAL FORMATTING RULES:${docSpecificInstructions}

    STRICT LANGUAGE & TRANSLATION MANDATE:
    You MUST output the entire document in ${targetLanguageName}. All section titles, headings, clauses, disclosures, tables, and legal language MUST be fluently written in ${targetLanguageName}.

    FORMATTING: Return ONLY valid HTML content inside the body (excluding <html>, <head>, or <body> tags). Use headings (<h2>, <h3>), paragraphs (<p>), and unordered lists (<ul>).`;

    let aiContent = "";

    try {
      const response = await fetch("/api/generate-content", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          model: 'gemini-3.6-flash',
          prompt,
          systemInstruction: 'You are a statutory legal compliance specialist. Return ONLY clean HTML formatted document text.',
          temperature: 0.2,
          siteId: siteId
        })
      });
      
      if (response.ok) {
        const completion = await response.json();
        aiContent = completion.text || '';
      }
    } catch (fetchErr) {
      console.warn(`[AI DOCS] Proxy request for ${type} had an issue, falling back to legal synthesis engine:`, fetchErr);
    }

    // If server generation returned empty or failed, use bulletproof legal synthesis fallback
    if (!aiContent || aiContent.trim().length < 50) {
      aiContent = generateLegalDocFallback(
        type,
        site.name || 'Company',
        site.url || 'https://example.com',
        jurisdictions,
        language,
        dataList,
        thirdPartiesList,
        retention,
        dpoContact
      );
    }

    // Clean raw markdown code fences if outputted by LLM
    if (aiContent.includes('```')) {
      aiContent = aiContent.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim();
    }
    
    // Inject custom clauses with strict HTML entity escaping
    const beginningClauses = clauses?.filter(c => c.document_type === type && c.position === 'beginning')
      .map(c => `<h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.content).replace(/\n/g, '<br/>')}</p>`).join('') || '';

    const endClauses = clauses?.filter(c => c.document_type === type && c.position === 'end')
      .map(c => `<h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.content).replace(/\n/g, '<br/>')}</p>`).join('') || '';

    const disclaimer = `
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; color: #ef4444; font-weight: bold; font-family: sans-serif;">
        LEGAL DISCLAIMER: PAPERLOO IS AN AI-POWERED TOOL AND DOES NOT CONSTITUTE A LAW FIRM. THE CONTENT GENERATED HEREIN IS NOT LEGAL ADVICE AND DOES NOT CREATE AN ATTORNEY-CLIENT RELATIONSHIP. WE ARE NOT LICENSED ATTORNEYS. ALL DOCUMENTS SHOULD BE REVIEWED BY A QUALIFIED LEGAL PROFESSIONAL IN YOUR SPECIFIC JURISDICTION BEFORE USE.
      </div>
    `;

    const rawCombinedContent = `<div dir="${language === 'ar' ? 'rtl' : 'ltr'}" class="legal-doc-content">${disclaimer}${beginningClauses}${aiContent}${endClauses}</div>`;
    const finalContent = sanitizeDocHtml(rawCombinedContent);

    // Save to DB
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
        changelog_note: 'Regenerated via UI'
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
  
  console.log(`[AI DOCS] Document generation complete. Successfully saved ${results.length} documents.`);
  
  // Trigger compliance calculation after saving documents
  try {
    const { calculateComplianceScore } = await import('@/src/lib/compliance');
    await calculateComplianceScore(siteId);
  } catch (err) {
    console.error('Failed to trigger compliance score update after doc generation:', err);
  }

  return results;
};
