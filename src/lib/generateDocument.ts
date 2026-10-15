import { extractCompanyFacts, generateStatutoryPrivacyPolicy } from "@/src/lib/statutoryCorpus";

export function generateDocument(type: string, siteName: string, answers: Record<string, any>) {
  const cleanSiteName = (siteName || 'Organization').trim();
  const rawUrl = (answers.url || answers.website || answers.siteUrl || `https://${cleanSiteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.com`).trim();
  const cleanSiteUrl = rawUrl.replace(/\s+/g, '-');

  const jurisdictions = answers.jurisdictions || ['GDPR (EU)'];
  const hostOrigin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://example.com';
  const facts = extractCompanyFacts({ name: cleanSiteName, url: cleanSiteUrl, jurisdictions }, answers, hostOrigin);

  if (type === 'privacy_policy') {
    return generateStatutoryPrivacyPolicy(facts, jurisdictions);
  }

  let domain = 'example.com';
  try {
    domain = new URL(cleanSiteUrl.startsWith('http') ? cleanSiteUrl : `https://${cleanSiteUrl}`).hostname.replace(/^www\./, '');
  } catch (e) {
    domain = cleanSiteName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.com';
  }

  const {
    companyName = facts.legalEntityName,
    contactEmail = facts.privacyEmail,
    dataCollected = ['Email Addresses', 'Full Names', 'Billing Information', 'Location Metadata'],
    useCookies = true,
    cookieTypes = ['Strictly Necessary', 'Analytics & Performance', 'Functional', 'Targeting'],
    thirdParties = ['Google Analytics 4', 'Amazon Web Services', 'Supabase', 'Stripe'],
    sellData = false,
    under13 = false,
    effectiveDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  } = answers;

  const cleanContactEmail = contactEmail.trim().replace(/\s+/g, '');

  let content = `<h1>${type.replace('_', ' ').toUpperCase()}</h1>`;
  content += `<p>Effective Date: ${effectiveDate} | Version: 2.0 (Statutory Compliance Release)</p>`;
  content += `<p>This document applies to <strong>${cleanSiteName}</strong>, operated by <strong>${companyName}</strong> (${cleanSiteUrl}).</p>`;

  if (type === 'privacy_policy') {
    content += `
      <h2>1. Data Controller Identification & Governance (GDPR Art. 13(1)(a))</h2>
      <p>Under Regulation (EU) 2016/679 (General Data Protection Regulation - "GDPR") and the UK Data Protection Act 2018, <strong>${companyName}</strong> acts as the Data Controller responsible for determining the purposes and means of processing personal data on <strong>${cleanSiteUrl}</strong>.</p>
      <p>Direct Privacy Office: <a href="mailto:${cleanContactEmail}">${cleanContactEmail}</a> | Electronic DSAR Portal: <a href="${cleanSiteUrl}#paperloo-dsar-form">Submit Data Rights Request</a></p>

      <h2>2. Data Protection Officer (DPO) & Article 27 Representation</h2>
      <p>Our designated Privacy Officer oversees data protection compliance. In accordance with Article 37 GDPR, our core processing operations do not require large-scale systematic tracking or special category processing; statutory compliance is continually maintained through our dedicated privacy office at <a href="mailto:${cleanContactEmail}">${cleanContactEmail}</a>.</p>

      <h2>3. Purpose-Mapped Categories of Data & Explicit Legal Bases (GDPR Art. 6(1))</h2>
      <p>Each processing activity is anchored upon an independent, non-conflated lawful ground under GDPR Article 6:</p>
      <ul>
        <li><strong>Account Provisioning & Core Services:</strong> ${dataCollected.join(', ')} — <strong>GDPR Art. 6(1)(b)</strong> (Performance of a contract).</li>
        <li><strong>Billing, Invoicing & Financial Accounting:</strong> Billing address, transaction history, VAT IDs — <strong>GDPR Art. 6(1)(b)</strong> (Contractual performance) and <strong>GDPR Art. 6(1)(c)</strong> (Legal and fiscal preservation obligations).</li>
        <li><strong>Customer Support & SLA Resolution:</strong> Inquiries, contact logs — <strong>GDPR Art. 6(1)(b)</strong> and <strong>GDPR Art. 6(1)(f)</strong> (Legitimate interest in quality support).</li>
        <li><strong>Security, Fraud Prevention & Telemetry:</strong> IP addresses, request headers, firewall telemetry — <strong>GDPR Art. 6(1)(f)</strong> (Legitimate interest in system integrity and network security per Recital 49).</li>
        <li><strong>Non-Essential Analytics & Optimization:</strong> Interaction telemetry (${thirdParties.join(', ')}) — <strong>GDPR Art. 6(1)(a)</strong> and ePrivacy Art. 5(3) (Explicit, freely given consent via Consent Banner).</li>
        <li><strong>Direct Marketing & Alerts:</strong> Email, subscription choices — <strong>GDPR Art. 6(1)(a)</strong> (Consent), revocable at any time.</li>
      </ul>

      <h2>4. Purpose-Differentiated Data Retention Schedule (GDPR Art. 5(1)(e) & Art. 13(2)(a))</h2>
      <p>In accordance with statutory storage limitation, personal data is retained only for duration periods calibrated to specific legal bases:</p>
      <ul>
        <li><strong>Operational & Account Records:</strong> Active contract period plus 3 years (statutory limitation period for contract claims).</li>
        <li><strong>Financial, Billing & Tax Records:</strong> 6 to 10 years in strict compliance with EU commercial and tax preservation laws.</li>
        <li><strong>Server Security & Audit Logs:</strong> 30 to 90 days, rotated automatically unless required for cybersecurity investigations.</li>
        <li><strong>Analytical Telemetry:</strong> 14 months maximum, stored in aggregated or anonymized format.</li>
        <li><strong>Consent & DSAR Audit Records:</strong> 3 years from decision date under the GDPR Art. 5(2) accountability principle.</li>
      </ul>

      <h2>5. Sub-Processors & International Data Transfers (GDPR Art. 44–49)</h2>
      <p>We work with trusted third-party service providers (${thirdParties.join(', ')}) bound by Data Processing Agreements under GDPR Art. 28(3). For cross-border data transfers outside the EEA or UK (including the US), we mandate:</p>
      <ul>
        <li><strong>EU-U.S. Data Privacy Framework (DPF):</strong> Adequacy decision under Art. 45 GDPR for certified US organizations.</li>
        <li><strong>Standard Contractual Clauses (SCCs):</strong> Implementing Decision (EU) 2021/914 with Transfer Impact Assessments (TIAs).</li>
        <li><strong>Technical Safeguards:</strong> End-to-end encryption in transit (TLS 1.3) and at rest (AES-256) pursuant to the CJEU <em>Schrems II</em> standard.</li>
      </ul>

      <h2>6. Automated Decision-Making & Profiling (GDPR Art. 13(2)(f) & Art. 22)</h2>
      <p>We do not engage in automated decision-making or profiling that produces legal or similarly significant effects under GDPR Article 22.</p>

      <h2>7. Your Statutory Data Subject Rights (GDPR Art. 12–22 & Art. 77)</h2>
      <p>You possess enforceable statutory rights: Right of Access (Art. 15), Right to Rectification (Art. 16), Right to Erasure / "Right to be Forgotten" (Art. 17), Right to Restriction of Processing (Art. 18), Right to Data Portability (Art. 20), Right to Object (Art. 21), Right to Withdraw Consent (Art. 7(3)) distinctly without affecting prior lawfulness, and Right to Lodge a Complaint with a Supervisory Authority (Art. 77).</p>
      <p><strong>Statutory SLA:</strong> Responses provided within one calendar month under Art. 12(3) without charge.</p>
    `;

    if (jurisdictions.includes('GDPR') || jurisdictions.some((j: string) => j.includes('GDPR'))) {
      content += `<h2>3. European Union General Data Protection Regulation (GDPR) Governance</h2>`;
      content += `<p>Pursuant to Regulation (EU) 2016/679 (GDPR), processing operations are anchored strictly upon lawful grounds under Article 6, including legitimate interest, contractual necessity, or explicit consent negotiation.</p>`;
      content += `<p>Data subjects retain unequivocal statutory rights: access, rectification, erasure, restriction of processing, and data portability.</p>`;
    }

    if (jurisdictions.includes('CCPA') || jurisdictions.some((j: string) => j.includes('CCPA'))) {
      content += `<h2>4. California Consumer Privacy Act (CCPA / CPRA) Disclosures</h2>`;
      content += `<p>California consumers possess explicit statutory entitlements regarding the disclosure, access, deletion, and opt-out of personal information commercialization.</p>`;
      content += `<p>We ${sellData ? 'do' : 'do not'} sell or share personal information as defined under applicable statutory parameters.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('PDPA (Thailand)'))) {
      content += `<h2>PDPA Compliance Matrix (Thailand)</h2>`;
      content += `<p>Pursuant to Thailand's Personal Data Protection Act B.E. 2562 (PDPA), processing operations proceed strictly upon freely given, explicit consent or established statutory exemptions. Data subjects retain irrevocable rights to request access, rectification, deletion, and portability.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('PDPA (Turkey)') || j.includes('KVKK'))) {
      content += `<h2>KVKK Statutory Framework (Turkey)</h2>`;
      content += `<p>In strict accordance with Law No. 6698 on the Protection of Personal Data (KVKK), data processing activities are safeguarded by organizational and technical security measures. Data subjects hold statutory rights to ascertain processing parameters and object to automated profiling.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('POPIA'))) {
      content += `<h2>POPIA Governance Standard (South Africa)</h2>`;
      content += `<p>Pursuant to the Protection of Personal Information Act 4 of 2013 (POPIA), we enforce eight mandatory conditions for lawful processing, establishing comprehensive access controls and data subject rights mechanisms.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('Privacy Act'))) {
      content += `<h2>Australian Privacy Principles (APPs) Framework</h2>`;
      content += `<p>Under the Privacy Act 1988 (Cth) and the 13 Australian Privacy Principles (APPs), personal information is safeguarded against unauthorized access, modification, or disclosure. Data subjects maintain rights of access, correction, and direct recourse to the Office of the Australian Information Commissioner (OAIC).</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('APPI'))) {
      content += `<h2>APPI Compliance (Japan)</h2>`;
      content += `<p>In accordance with Japan's Act on the Protection of Personal Information (APPI), we safeguard personal data identifiers, strictly limit third-party provisions without prior consent, and fulfill personal data disclosure requests.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('PDPB') || j.includes('DPDP'))) {
      content += `<h2>DPDP Act Compliance (India)</h2>`;
      content += `<p>Under the Digital Personal Data Protection Act of India, we act as a responsible Data Fiduciary, ensuring collection notices are transparent and individual Data Principals retain rights to request summary, correction, or erasure of their personal data.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('PDPL'))) {
      content += `<h2>PDPL Compliance (Saudi Arabia)</h2>`;
      content += `<p>Pursuant to Saudi Arabia's Personal Data Protection Law (PDPL), we implement appropriate safeguarding controls to protect personal data from unauthorized access, breach, or disclosure, adhering closely to SDAIA guidelines.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('Law 25'))) {
      content += `<h2>Quebec Law 25 Compliance (Quebec, Canada)</h2>`;
      content += `<p>Under Quebec's Law 25, default deactivation of all user-tracking cookies is enforced. We carry out assessments for any data transfer outside of Quebec, and respect mandatory breach notifications.</p>`;
    }

    if (under13) {
      content += `<h2>5. COPPA (Children's Privacy)</h2>`;
      content += `<p>We do not knowingly collect data from children under 13 without parental consent.</p>`;
    }

    content += `<h2>6. Contact Us</h2><p>If you have questions, contact us at: ${contactEmail}</p>`;
  }

  if (type === 'cookie_policy') {
    content += `<h2>1. About Cookies</h2><p>Cookies are small text files stored on your device.</p>`;
    if (useCookies) {
      content += `<h2>2. Cookies We Use</h2><ul>`;
      cookieTypes.forEach((type: string) => {
        content += `<li><strong>${type}:</strong> Used for ${type.toLowerCase()} purposes.</li>`;
      });
      content += `</ul>`;
    } else {
      content += `<p>We do not use cookies on this site.</p>`;
    }
  }

  if (type === 'terms_of_service') {
    content += `<h2>1. Acceptance of Terms</h2><p>By using this site, you agree to these terms.</p>`;
    content += `<h2>2. User Obligations</h2><p>You agree to use the site legally and respectfully.</p>`;
    content += `<h2>3. Limitation of Liability</h2><p>${companyName} is not liable for any damages arising from your use of the site.</p>`;
  }

  return content;
}
