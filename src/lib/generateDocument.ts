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
    content += `<h2>1. Introduction</h2><p>We respect your privacy and are committed to protecting your personal data.</p>`;
    
    content += `<h2>2. Data We Collect</h2><ul>`;
    dataCollected.forEach((item: string) => {
      content += `<li>${item}</li>`;
    });
    content += `</ul>`;

    if (jurisdictions.includes('GDPR') || jurisdictions.some((j: string) => j.includes('GDPR'))) {
      content += `<h2>3. GDPR Compliance (EU)</h2>`;
      content += `<p>Under the General Data Protection Regulation (GDPR), we process your data based on legitimate interest, contract fulfillment, or consent.</p>`;
      content += `<p>Your rights include: access, rectification, erasure, and data portability.</p>`;
    }

    if (jurisdictions.includes('CCPA') || jurisdictions.some((j: string) => j.includes('CCPA'))) {
      content += `<h2>4. CCPA Compliance (California)</h2>`;
      content += `<p>California residents have the right to know what personal information is collected, used, shared, or sold.</p>`;
      content += `<p>We ${sellData ? 'do' : 'do not'} sell your personal data.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('PDPA (Thailand)'))) {
      content += `<h2>PDPA Compliance (Thailand)</h2>`;
      content += `<p>Pursuant to Thailand's Personal Data Protection Act (PDPA), we process personal data only when explicit, freely given consent is provided, or other lawful processing conditions are met. Data subjects have the right to request access, rectification, deletion, and portability of their information.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('PDPA (Turkey)') || j.includes('KVKK'))) {
      content += `<h2>KVKK Compliance (Turkey)</h2>`;
      content += `<p>In accordance with the Turkish Personal Data Protection Law (KVKK Law No. 6698), we process your personal data securely. Data owners maintain explicit rights to learn data processing details, request corrections, and object to adverse outcomes resulting from automated systems.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('POPIA'))) {
      content += `<h2>POPIA Compliance (South Africa)</h2>`;
      content += `<p>According to South Africa's Protection of Personal Information Act (POPIA), we strictly enforce minimum conditions for lawful processing of personal information, ensuring robust access control, and honoring your rights is our absolute operational baseline.</p>`;
    }

    if (jurisdictions.some((j: string) => j.includes('Privacy Act'))) {
      content += `<h2>Australian Privacy Compliance</h2>`;
      content += `<p>Under the Australian Privacy Act and the Australian Privacy Principles (APPs), we manage personal information safely. You have the right to access and correct your stored personal data, and to lodge any privacy complaints with our officer.</p>`;
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
