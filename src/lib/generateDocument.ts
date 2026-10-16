export function generateDocument(type: string, siteName: string, answers: Record<string, any>) {
  const {
    companyName = siteName,
    contactEmail = 'paperloo.official@gmail.com',
    jurisdictions = [],
    dataCollected = [],
    useCookies = false,
    cookieTypes = [],
    thirdParties = [],
    sellData = false,
    under13 = false,
    effectiveDate = new Date().toLocaleDateString(),
  } = answers;

  let content = `<h1>${type.replace('_', ' ').toUpperCase()}</h1>`;
  content += `<p>Effective Date: ${effectiveDate}</p>`;
  content += `<p>This document applies to <strong>${siteName}</strong>, operated by <strong>${companyName}</strong>.</p>`;

  if (type === 'privacy_policy') {
    content += `<h2>1. Statutory Preamble & Scope</h2><p>We maintain an unyielding commitment to the inviolable protection of individual privacy and the rigorous governance of personal data processed across our operational architecture.</p>`;
    
    content += `<h2>2. Categorization of Processed Data</h2><ul>`;
    dataCollected.forEach((item: string) => {
      content += `<li><strong>${item}:</strong> Collected and processed in accordance with strict statutory necessity and proportionality standards.</li>`;
    });
    content += `</ul>`;

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
