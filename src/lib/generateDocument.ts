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

    if (jurisdictions.includes('GDPR')) {
      content += `<h2>3. GDPR Compliance (EU)</h2>`;
      content += `<p>Under the General Data Protection Regulation (GDPR), we process your data based on legitimate interest, contract fulfillment, or consent.</p>`;
      content += `<p>Your rights include: access, rectification, erasure, and data portability.</p>`;
    }

    if (jurisdictions.includes('CCPA')) {
      content += `<h2>4. CCPA Compliance (California)</h2>`;
      content += `<p>California residents have the right to know what personal information is collected, used, shared, or sold.</p>`;
      content += `<p>We ${sellData ? 'do' : 'do not'} sell your personal data.</p>`;
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
