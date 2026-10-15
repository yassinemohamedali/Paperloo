import { supabase } from "@/src/lib/supabase";
import { escapeHtml, sanitizeDocHtml } from "@/src/lib/sanitizeHtml";
import { 
  extractCompanyFacts, 
  generateStatutoryPrivacyPolicy, 
  buildStatutorySystemInstruction, 
  RealCompanyFacts 
} from "@/src/lib/statutoryCorpus";

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
  facts: RealCompanyFacts,
  jurisdictions: string[],
  language: string,
  dataList: string,
  thirdPartiesList: string,
  retention: number | string
): string => {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const jurisdictionsStr = jurisdictions.length > 0 ? jurisdictions.join(', ') : 'GDPR (EU)';

  switch (type) {
    case 'privacy_policy':
      return generateStatutoryPrivacyPolicy(facts, jurisdictions);

    case 'terms_of_service':
      return `
        <h2>Terms of Service</h2>
        <p><strong>Effective Date:</strong> ${dateStr} | <strong>Version:</strong> 2.0 (Statutory Consumer & Enterprise Framework)</p>
        <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and <strong>${escapeHtml(facts.legalEntityName)}</strong> (trading as <em>"${escapeHtml(facts.tradingName)}"</em>, "we", "us", or "our"), governing access to and usage of the digital service at <strong><a href="${escapeHtml(facts.monitoredUrl)}" target="_blank" rel="noreferrer">${escapeHtml(facts.monitoredUrl)}</a></strong>.</p>

        <h3>1. Acceptance & Contract Formation</h3>
        <p>By accessing our website, creating an account, or purchasing digital services, you agree to be bound by these Terms and our Privacy Policy. If you are entering into these Terms on behalf of an entity, you warrant that you possess the legal authority to bind that entity.</p>

        <h3>2. User Accounts & Credential Security</h3>
        <p>You agree to provide true, accurate, and complete information upon registration. You are solely responsible for maintaining the confidentiality of your credentials and for all activities occurring under your account. Notify our security team immediately at <a href="mailto:${escapeHtml(facts.privacyEmail)}">${escapeHtml(facts.privacyEmail)}</a> upon discovering unauthorized access.</p>

        <h3>3. Acceptable Use & Prohibited Conduct</h3>
        <p>You agree not to: (a) probe, scan, or breach system security or authentication measures; (b) reverse engineer or decompile any software component; (c) transmit malicious payloads, trojans, or unauthorized scrapers; or (d) violate applicable statutory laws under ${escapeHtml(jurisdictionsStr)}.</p>

        <h3>4. Intellectual Property Rights</h3>
        <p>All software, interfaces, graphics, trade secrets, trademarks, and documentation provided on ${escapeHtml(facts.monitoredUrl)} remain the exclusive property of <strong>${escapeHtml(facts.legalEntityName)}</strong> and its licensors, protected under international copyright, patent, and trademark treaties.</p>

        <h3>5. Limitation of Liability & Statutory Consumer Warranties</h3>
        <p>To the maximum extent permitted by applicable law under the governing jurisdiction of <strong>${escapeHtml(facts.countryOfIncorporation)}</strong>, in no event shall <strong>${escapeHtml(facts.legalEntityName)}</strong> or its officers be liable for indirect, incidental, punitive, or consequential damages. Nothing in these Terms shall limit or exclude statutory rights that cannot be waived under applicable mandatory consumer protection laws.</p>

        <h3>6. Governing Law & Dispute Resolution</h3>
        <p>These Terms and any non-contractual disputes arising hereunder shall be governed by and construed in accordance with the laws of <strong>${escapeHtml(facts.countryOfIncorporation)}</strong>. Disputes shall be submitted to the exclusive jurisdiction of the competent courts in the controller's jurisdiction of establishment, without prejudice to mandatory statutory consumer forum provisions.</p>
      `;

    case 'cookie_policy':
      return `
        <h2>Cookie & Tracking Technology Policy</h2>
        <p><strong>Effective Date:</strong> ${dateStr} | <strong>Version:</strong> 2.0 (ePrivacy & Consent Mode v2 Standards)</p>
        <p>This Cookie Policy explains how <strong>${escapeHtml(facts.legalEntityName)}</strong> ("we", "us", or "our") deploys cookies, local storage objects, and similar tracking technologies on <strong><a href="${escapeHtml(facts.monitoredUrl)}" target="_blank" rel="noreferrer">${escapeHtml(facts.monitoredUrl)}</a></strong> in adherence to the ePrivacy Directive (Directive 2002/58/EC as amended), GDPR Article 6, and EDPB Guidelines 05/2020.</p>

        <h3>1. What Are Tracking Technologies?</h3>
        <p>Cookies are small alphanumeric files placed on your browser or device when accessing web applications. We utilize session cookies (deleted upon browser close) and persistent cookies (retained until statutory expiry or manual clearing) alongside modern browser storage.</p>

        <h3>2. Cookie Classifications & Deployment Matrix</h3>
        <ul>
          <li><strong>Strictly Necessary Cookies:</strong> Fundamental for load balancing, CSRF security verification, and authenticated sessions. These run under legitimate operational necessity and do not require prior consent under ePrivacy Art. 5(3).</li>
          <li><strong>Performance & Analytics Cookies:</strong> Measure aggregate traffic telemetry, page interaction speeds, and error diagnostics (${escapeHtml(thirdPartiesList)}). Integrated with <strong>Google Consent Mode v2</strong>: held in a default denied state until you grant affirmative consent.</li>
          <li><strong>Functional & Interface Cookies:</strong> Remember your user interface theme preferences, language selections, and session state.</li>
          <li><strong>Targeting & Advertising Cookies:</strong> Disabled by default; deployed only upon explicit opt-in to measure campaign reach.</li>
        </ul>

        <h3>3. Dynamic Consent Management & Withdrawal</h3>
        <p>You can modify or immediately revoke your cookie consent at any time via the persistent floating <strong>Cookie Preferences badge</strong> located at the bottom of the page. You may also configure your web browser (Chrome, Safari, Firefox, Edge) to reject or delete cookies automatically.</p>
      `;

    case 'eula':
      return `
        <h2>End User License Agreement (EULA)</h2>
        <p><strong>Effective Date:</strong> ${dateStr}</p>
        <p>This End User License Agreement ("Agreement") is a legal agreement between you and <strong>${escapeHtml(facts.legalEntityName)}</strong> concerning your installation and usage of software services deployed on <strong>${escapeHtml(facts.monitoredUrl)}</strong>.</p>
        <h3>1. License Grant</h3>
        <p>Subject to these terms, <strong>${escapeHtml(facts.legalEntityName)}</strong> grants you a revocable, non-exclusive, non-transferable, limited license to access and utilize the application strictly in accordance with statutory guidelines under ${escapeHtml(facts.countryOfIncorporation)}.</p>
        <h3>2. Restrictions</h3>
        <p>You agree not to modify, adapt, translate, reverse engineer, or decompile any portion of the software, or bypass any access-control mechanism.</p>
      `;

    case 'acceptable_use':
      return `
        <h2>Acceptable Use Policy</h2>
        <p><strong>Effective Date:</strong> ${dateStr}</p>
        <p>This Acceptable Use Policy defines permissible usage rules for all services operated by <strong>${escapeHtml(facts.legalEntityName)}</strong> on <strong>${escapeHtml(facts.monitoredUrl)}</strong>.</p>
        <h3>1. Prohibited Actions</h3>
        <ul>
          <li>Engaging in denial-of-service (DDoS) attacks, port scanning, or unauthorized penetration testing</li>
          <li>Distributing unsolicited bulk messages (spam) or hosting illegal material</li>
          <li>Harvesting personal data without valid statutory legal basis</li>
        </ul>
      `;

    case 'disclaimer':
      return `
        <h2>Legal & Informational Disclaimer</h2>
        <p><strong>Effective Date:</strong> ${dateStr}</p>
        <p>The information and software tools delivered by <strong>${escapeHtml(facts.legalEntityName)}</strong> on <strong>${escapeHtml(facts.monitoredUrl)}</strong> are provided for operational and informational purposes only.</p>
        <p>All materials are provided "as is" and "as available". While we strive for statutory accuracy, nothing on this digital property constitutes formal, bespoke legal advice, and no attorney-client relationship is created.</p>
      `;

    case 'return_policy':
      return `
        <h2>Refund & Cancellation Policy</h2>
        <p><strong>Effective Date:</strong> ${dateStr}</p>
        <p>This policy details refund terms for products and digital subscriptions purchased through <strong>${escapeHtml(facts.legalEntityName)}</strong> (${escapeHtml(facts.monitoredUrl)}).</p>
        <h3>1. Statutory Cooling-Off & Refund Period</h3>
        <p>Pursuant to statutory consumer protection regulations (including EU Directive 2011/83/EU on Consumer Rights), consumers retain a 14-day statutory withdrawal period for unactivated digital services. For active recurring subscriptions, cancellations take effect at the conclusion of the current billing cycle.</p>
        <h3>2. Submission Procedure</h3>
        <p>To request a refund, submit your invoice transaction ID and request details to <a href="mailto:${escapeHtml(facts.privacyEmail)}">${escapeHtml(facts.privacyEmail)}</a>. Approved refunds are credited to the original payment method within 5 to 10 business days.</p>
      `;

    case 'accessibility_statement':
      return `
        <h2>Accessibility Statement</h2>
        <p><strong>Effective Date:</strong> ${dateStr}</p>
        <p><strong>${escapeHtml(facts.legalEntityName)}</strong> is actively committed to ensuring digital accessibility for individuals with disabilities across <strong><a href="${escapeHtml(facts.monitoredUrl)}" target="_blank" rel="noreferrer">${escapeHtml(facts.monitoredUrl)}</a></strong> in conformance with the Web Content Accessibility Guidelines (WCAG 2.1 Level AA), Americans with Disabilities Act (ADA Title III), Section 508 of the Rehabilitation Act, and the European Accessibility Act (EAA EN 301 549).</p>
        <h3>1. Technical Implementation</h3>
        <ul>
          <li>Semantic HTML hierarchy and ARIA landmarks for screen reader navigation (NVDA, JAWS, VoiceOver)</li>
          <li>High-contrast visual palettes with minimum 4.5:1 text-to-background ratio</li>
          <li>Comprehensive keyboard tab navigation and visible focus states</li>
          <li>Support for reduced motion and responsive viewport zoom up to 200%</li>
        </ul>
        <h3>2. Alternative Formats SLA & Escalation</h3>
        <p>We provide alternative accessible document formats (large print, audio transcript, machine-readable plain text) within <strong>48 business hours</strong> upon formal request to our accessibility team at <a href="mailto:${escapeHtml(facts.privacyEmail)}">${escapeHtml(facts.privacyEmail)}</a>.</p>
      `;

    default:
      return `
        <h2>${escapeHtml(type.replace(/_/g, ' ').toUpperCase())}</h2>
        <p>Last updated: ${dateStr}</p>
        <p>Document for <strong>${escapeHtml(facts.legalEntityName)}</strong> governing operations on <strong>${escapeHtml(facts.monitoredUrl)}</strong>.</p>
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

  const cleanSiteName = (site.name || 'Company').trim();
  let cleanSiteUrl = (site.url || 'https://example.com').trim();
  if (!cleanSiteUrl.startsWith('http://') && !cleanSiteUrl.startsWith('https://')) {
    cleanSiteUrl = 'https://' + cleanSiteUrl;
  }
  cleanSiteUrl = cleanSiteUrl.replace(/\s+/g, '-');

  let domain = 'example.com';
  try {
    domain = new URL(cleanSiteUrl).hostname.replace(/^www\./, '');
  } catch (e) {
    domain = cleanSiteName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.com';
  }
  if (!domain || domain.includes(' ') || domain.startsWith('.')) {
    domain = cleanSiteName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.com';
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
  const dpoContact = (answers.contact_email || answers.dpo_email || `privacy@${domain}`).trim().replace(/\s+/g, '');

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

  const hostOrigin = (typeof window !== 'undefined' && window.location?.origin) 
    ? window.location.origin 
    : 'https://example.com';

  const facts = extractCompanyFacts(site, answers, hostOrigin);

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
    if (type === 'privacy_policy') {
      docSpecificInstructions = `
    1. Structure the Privacy Policy with rigorous GDPR Article 13/14 compliance:
       - Section 1: Data Controller Identification (Legal Entity Name: ${facts.legalEntityName}, Jurisdiction of Establishment: ${facts.countryOfIncorporation}, Registered Corporate Address: ${facts.registeredAddress}, Registration Number: ${facts.companyRegistrationNumber}, direct privacy email: ${facts.privacyEmail}, link to electronic DSAR portal: ${facts.dsarPortalUrl}).
       - Section 2: Data Protection Officer (DPO) and Article 27 EU/UK statutory representation. Include explicit DPO appointment assessment under Article 37.
       - Section 3: Categories of Data & Independent Legal Bases (Article 6(1)). Do NOT conflate contract performance and customer service. Specifically delineate: Contract Performance (Art. 6(1)(b)), Billing & Legal Obligation (Art. 6(1)(c)), Customer Support (Art. 6(1)(b)/(f)), Security/Telemetry (Art. 6(1)(f) legitimate interest per Recital 49), Non-essential analytics (Art. 6(1)(a) consent via banner), Marketing (Art. 6(1)(a) consent).
       - Section 4: Cookie Governance & Integrated Consent Management Layer: Disclose Strictly Necessary, Performance/Analytics (held blocked by default until consent per Google Consent Mode v2), Functional, and Marketing cookies, with instructions for dynamic consent revocation.
       - Section 5: Purpose-Differentiated Data Retention Schedule (Art. 5(1)(e) & 13(2)(a)): Differentiate preservation windows (Tax/accounting 6-10 years under commercial code; Account data duration of contract + 3-year limitation; Server security logs 30-90 days; Analytics 14 months; Consent audit trail 3 years). Never use a single blanket 12-month period.
       - Section 6: Named Third-Party Processors & International Data Transfers (Chapter V, Art. 44-49): Disclose named providers (AWS, Supabase, Stripe, Google Analytics 4, Resend), EU-U.S. Data Privacy Framework (DPF) adequacy finding, European Commission Standard Contractual Clauses (Decision 2021/914), and Schrems II technical/organizational encryption safeguards.
       - Section 7: Automated Decision-Making & Profiling: Include an explicit negative statement confirming that no automated decision-making or profiling with legal effect takes place under Article 22.
       - Section 8: Comprehensive Data Subject Rights (Art. 12-22 & 77): Enumerate Access (Art. 15), Rectification (Art. 16), Erasure / Right to be Forgotten (Art. 17), Restriction (Art. 18), Data Portability (Art. 20), Objection (Art. 21), Right to Withdraw Consent (Art. 7(3)) distinctly separated, and Right to Lodge a Complaint with a Supervisory Authority (Art. 77) naming relevant EU DPAs and UK ICO.
       - Section 9: How to Exercise Rights with Art. 12 One-Month Statutory SLA and live DSAR portal link (${facts.dsarPortalUrl}).
       - Section 10: Multi-Framework Addenda for selected jurisdictions (${jurisdictions.join(', ')}). Include explicit nexus linking for LGPD and POPIA, and CCPA statutory threshold disclosure under Cal. Civ. Code § 1798.140(d).`;
    } else if (type === 'cookie_policy') {
      docSpecificInstructions = `
    1. Detail all cookie classifications: Strictly Necessary, Performance/Analytics, Functional, and Marketing.
    2. Detail explicit integration with Google Consent Mode v2 and on-site Consent Management Shield.
    3. Detail instructions on persistent consent modification and revocation.`;
    } else if (type === 'terms_of_service') {
      docSpecificInstructions = `
    1. Focus on user accounts, acceptable use, intellectual property, limitation of liability, and governing law based on selected jurisdictions (${jurisdictions.join(', ')}).
    2. Do NOT include a Data Collection table or ePrivacy tracking section.`;
    } else if (type === 'accessibility_statement') {
      docSpecificInstructions = `
    1. Express definitive compliance commitment to W3C Web Content Accessibility Guidelines (WCAG 2.1 Level AA), Americans with Disabilities Act (ADA Title III), Section 508 of the US Rehabilitation Act, and the European Accessibility Act (EAA EN 301 549).
    2. Outline implemented technical accessibility features: ARIA landmarks, minimum 4.5:1 text contrast ratios, full keyboard tab-navigation support, screen reader compatibility (NVDA, JAWS, VoiceOver), and reduced motion support.
    3. Include explicit alternative format SLA: Guarantee alternative document formats (large print, plain text, audio transcript) within 48 business hours upon request to ${facts.privacyEmail}.
    4. Provide direct contact information for accessibility escalation and formal reporting.`;
    } else {
      docSpecificInstructions = `
    1. Ensure the document addresses the specific legal requirements for a ${type.replace(/_/g, ' ')} under the selected jurisdictions (${jurisdictions.join(', ')}).`;
    }

    const prompt = `Generate a legally robust ${type.replace(/_/g, ' ')} in HTML format tailored to the selected jurisdictions (${jurisdictions.join(', ')}) based strictly on these verified properties:
    - Legal Entity: ${facts.legalEntityName} (Trading as "${facts.tradingName}")
    - Website URL: ${facts.monitoredUrl}
    - Jurisdiction of Establishment: ${facts.countryOfIncorporation}
    - Registered Office: ${facts.registeredAddress}
    - Registration Number: ${facts.companyRegistrationNumber}
    - Collected Data Types: ${dataList}
    - Retention Schedule: Statutory purpose-differentiated (accounting 6-10 yrs, account duration+3 yrs, logs 30-90 days, analytics 14 mos)
    - Analytics & Trackers: ${thirdPartiesList}
    - Designated Privacy Lead/Officer Contact: ${facts.privacyEmail}
    - Electronic DSAR Portal: ${facts.dsarPortalUrl}

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
          systemInstruction: buildStatutorySystemInstruction(jurisdictions),
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
        facts,
        jurisdictions,
        language,
        dataList,
        thirdPartiesList,
        retention
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
