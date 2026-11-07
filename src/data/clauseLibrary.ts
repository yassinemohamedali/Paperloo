/**
 * Paperloo Modular Legal Clause Library
 * Vetted statutory and regulatory clauses grounded in official regulator guidance:
 * - EU EDPB Guidelines 05/2020 (Consent), 04/2025 (Technical Measures), 07/2020 (Controllers/Processors)
 * - California Privacy Protection Agency (CPPA) Regulations (Cal. Code Regs. tit. 11 § 7002, § 7027)
 * - UK Information Commissioner's Office (ICO) Guidance on Transfers, Direct Marketing & PECR
 * - US FTC Children's Online Privacy Protection Rule (COPPA 16 C.F.R. Part 312)
 * - EU Consumer Rights Directive (2011/83/EU) on 14-day statutory withdrawal
 */

export interface RegulatorGuidance {
  authority: 'EDPB' | 'CPPA' | 'ICO' | 'FTC' | 'EU_COMMISSION' | 'GLOBAL';
  title: string;
  citation: string;
  url?: string;
  summary: string;
}

export interface ModularClause {
  id: string;
  docType: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'eula' | 'acceptable_use' | 'disclaimer' | 'return_policy' | 'accessibility_statement';
  section: string;
  title: string;
  jurisdiction: 'GDPR' | 'CCPA' | 'UK_GDPR' | 'COPPA' | 'GLOBAL';
  guidance: RegulatorGuidance;
  requiredIf?: (answers: Record<string, any>, context: { site: any; jurisdictions: string[] }) => boolean;
  template: (vars: ClauseVariables) => string;
}

export interface DetectedCookieItem {
  name: string;
  provider: string;
  category: 'Necessary' | 'Analytics' | 'Marketing' | 'Preferences' | 'Strictly Necessary' | 'Analytics & Performance' | 'Advertising & Marketing';
  expiry: string;
  purpose: string;
}

export interface ClauseVariables {
  companyName: string;
  siteUrl: string;
  domain: string;
  jurisdictions: string[];
  jurisdictionsStr: string;
  dateStr: string;
  dpoName?: string;
  dpoEmail: string;
  companyAddress: string;
  supervisoryAuthority: string;
  collectedDataList: string;
  collectedDataCategories: string[];
  trackersList: string;
  detectedCookies: DetectedCookieItem[];
  subProcessors: { name: string; category: string; purpose: string; transferSafeguard: string }[];
  retentionMonths: number;
  hasMinors: boolean;
  minorsAgeLimit: number;
  hasAccounts: boolean;
  hasSubscriptions: boolean;
  refundPeriodDays: number;
  hasUgc: boolean;
  collectsSensitive: boolean;
  governingLaw: string;
  disputeForum: string;
}

export const REGULATOR_CITATIONS: Record<string, RegulatorGuidance> = {
  EDPB_CONSENT: {
    authority: 'EDPB',
    title: 'Guidelines 05/2020 on consent under Regulation 2016/679',
    citation: 'EDPB Guidelines 05/2020, Version 1.1',
    summary: 'Consent must be freely given, specific, informed, and unambiguous. Pre-ticked boxes and cookie walls violate GDPR Art. 4(11) and 7.'
  },
  EDPB_TRANSFERS: {
    authority: 'EDPB',
    title: 'Recommendations 01/2020 on measures that supplement transfer tools to ensure compliance with the EU level of protection of personal data',
    citation: 'EDPB Recommendations 01/2020',
    summary: 'Data exporters must verify recipient third country safeguards (SCCs / EU-US Data Privacy Framework) on a case-by-case basis.'
  },
  CPPA_PURPOSE_LIMITATION: {
    authority: 'CPPA',
    title: 'CPPA Regulations on Purpose Limitation and Data Minimization',
    citation: 'Cal. Code Regs. tit. 11 § 7002',
    summary: 'Collection, use, and retention of personal info must be reasonably necessary and proportionate to achieve the purpose disclosed at collection.'
  },
  CPPA_OPT_OUT_SPI: {
    authority: 'CPPA',
    title: 'Right to Limit Use and Disclosure of Sensitive Personal Information',
    citation: 'Cal. Code Regs. tit. 11 § 7027; Cal. Civ. Code § 1798.121',
    summary: 'Businesses must provide a dedicated link or opt-out mechanism if Sensitive Personal Information (SPI) is used for purposes other than core service delivery.'
  },
  CPPA_GLOBAL_PRIVACY_CONTROL: {
    authority: 'CPPA',
    title: 'Opt-Out Preference Signals / Global Privacy Control',
    citation: 'Cal. Code Regs. tit. 11 § 7025',
    summary: 'Businesses must treat recognized opt-out preference signals (GPC) as valid consumer requests to opt-out of sale and sharing.'
  },
  ICO_DIRECT_MARKETING: {
    authority: 'ICO',
    title: 'ICO Direct Marketing Guidance & PECR Regulation 6',
    citation: 'UK General Data Protection Regulation & Data Protection Act 2018 (DPA 2018) read with PECR 2003 reg. 6',
    summary: 'Prior opt-in consent is strictly required for marketing trackers, analytics pixels, and electronic communications.'
  },
  FTC_COPPA: {
    authority: 'FTC',
    title: "Children's Online Privacy Protection Rule",
    citation: '16 C.F.R. Part 312 (COPPA)',
    summary: 'Verifiable parental consent is mandatory before collecting, using, or disclosing personal info from children under age 13.'
  },
  EU_WITHDRAWAL: {
    authority: 'EU_COMMISSION',
    title: 'EU Consumer Rights Directive (Directive 2011/83/EU)',
    citation: 'Directive 2011/83/EU, Articles 9-16',
    summary: 'Consumers within the EEA retain a statutory 14-day right of withdrawal for digital services and distance contracts.'
  }
};

/**
 * Robust site URL sanitizer
 * Completely strips spaces, %20, and invalid characters, guaranteeing a valid https:// domain
 */
export function sanitizeSiteUrl(rawUrl?: string, rawName?: string): { url: string; domain: string } {
  let str = (rawUrl || rawName || 'example.com').trim();
  // Strip url encoding (%20) and internal whitespace
  str = decodeURIComponent(str).replace(/\s+/g, '').replace(/%20/g, '');
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = `https://${str}`;
  }
  let domain = 'example.com';
  try {
    const parsed = new URL(str);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch {
    domain = str.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
  domain = domain.toLowerCase().replace(/[^a-z0-9.-]/g, '');
  if (!domain || !domain.includes('.')) {
    const cleanName = (rawName || 'company').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    domain = `${cleanName || 'company'}.com`;
  }
  return {
    url: `https://${domain}`,
    domain
  };
}

/**
 * Robust domain & contact email sanitizer
 * Never generates emails with spaces, %20, or invalid hostnames, ensuring mailbox sits on the site's exact domain
 */
export function sanitizeEmailAndDomain(siteUrl: string, siteName: string, rawEmail?: string): { email: string; domain: string; siteUrl: string } {
  const { url: cleanSiteUrl, domain: cleanDomain } = sanitizeSiteUrl(siteUrl, siteName);

  // 1. If explicit valid email provided in questionnaire answers, check if it's well-formed
  if (rawEmail && typeof rawEmail === 'string') {
    const trimmed = decodeURIComponent(rawEmail).trim().replace(/\s+/g, '').replace(/%20/g, '');
    if (trimmed.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return {
        email: trimmed,
        domain: cleanDomain,
        siteUrl: cleanSiteUrl
      };
    }
  }

  // 2. Default to privacy@{cleanDomain}
  return {
    email: `privacy@${cleanDomain}`,
    domain: cleanDomain,
    siteUrl: cleanSiteUrl
  };
}

// --- MODULAR CLAUSE CATALOG ---
export const CLAUSE_CATALOG: ModularClause[] = [
  // ==========================================
  // PRIVACY POLICY CLAUSES
  // ==========================================
  {
    id: 'pp-header',
    docType: 'privacy_policy',
    section: 'Header & Scope',
    title: 'Statutory Notice & Scope',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => {
      // Build dynamic frameworks list strictly based on selected jurisdictions
      const frameworks: string[] = [];
      const jLower = v.jurisdictions.map(j => j.toLowerCase());
      if (jLower.some(j => j.includes('gdpr') || j.includes('eu') || j.includes('eea'))) {
        frameworks.push('the EU General Data Protection Regulation (Regulation (EU) 2016/679 - GDPR)');
      }
      if (jLower.some(j => j.includes('uk'))) {
        frameworks.push('the UK General Data Protection Regulation read alongside the Data Protection Act 2018 (DPA 2018)');
      }
      if (jLower.some(j => j.includes('ccpa') || j.includes('cpra') || j.includes('california'))) {
        frameworks.push('the California Consumer Privacy Act as amended by the California Privacy Rights Act (Cal. Civ. Code § 1798.100 et seq. - CCPA/CPRA)');
      }
      if (jLower.some(j => j.includes('pipeda') || j.includes('canada'))) {
        frameworks.push('the Personal Information Protection and Electronic Documents Act (PIPEDA)');
      }
      if (frameworks.length === 0) {
        frameworks.push('applicable statutory data protection legislation');
      }

      return `
<h2>Privacy Policy & Statutory Data Protection Notice</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr} | <strong>Governing Frameworks:</strong> ${v.jurisdictionsStr}</p>
<p>This Privacy Policy governs the processing of personal data by <strong>${v.companyName}</strong> ("Company", "we", "us", or "our") across our digital properties, including <strong>${v.siteUrl}</strong> (the "Service"). We are committed to transparency, purpose limitation, and strict adherence to statutory privacy frameworks applicable to our operations, specifically ${frameworks.join(', ')}.</p>
<div class="regulatory-reference-card">
  <span class="ref-badge">Statutory Transparency Standard</span>
  <p><strong>EDPB Guidelines 05/2020 &amp; GDPR Art. 12:</strong> Information is presented in a concise, transparent, intelligible, and easily accessible format, using clear and plain language.</p>
</div>`;
    }
  },
  {
    id: 'pp-data-inventory',
    docType: 'privacy_policy',
    section: 'Data Categories',
    title: 'Categories of Personal Data Collected & Statutory Retention Schedule',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>1. Categories of Personal Data We Collect &amp; Retention Standards</h3>
<p>In accordance with data minimization standards (GDPR Art. 5(1)(c), Cal. Code Regs. tit. 11 § 7002), we collect only personal information reasonably necessary and proportionate for disclosed operational purposes. Data is retained according to differentiated statutory retention periods:</p>
<table class="compliance-table">
  <thead>
    <tr>
      <th>Data Category</th>
      <th>Specific Elements Collected</th>
      <th>Lawful Basis / Business Purpose</th>
      <th>Statutory Retention Schedule</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Identifiers (Email &amp; Contact)</strong></td>
      <td>Email address, telephone number, communication records</td>
      <td>Performance of Contract (GDPR Art. 6(1)(b)) &amp; Customer Support Notifications</td>
      <td>Retained for active account lifecycle or until opt-out/deletion request (+30 days)</td>
    </tr>
    <tr>
      <td><strong>Personal Details (Full Name)</strong></td>
      <td>First name, last name, user display identity</td>
      <td>Contractual Identification &amp; Account Identity Verification (GDPR Art. 6(1)(b))</td>
      <td>Retained for active account lifecycle + 90 days following formal account closure</td>
    </tr>
    ${v.collectedDataCategories.some(c => c.includes('Financial') || c.includes('Payment')) ? `
    <tr>
      <td><strong>Financial &amp; Transaction Records</strong></td>
      <td>PCI-DSS tokenized payment IDs, masked card digits, transaction ledger, invoices</td>
      <td>Performance of Contract (GDPR Art. 6(1)(b)) &amp; Compliance with Statutory Legal/Tax Obligations (GDPR Art. 6(1)(c))</td>
      <td>7 years (statutory fiscal, accounting, and tax compliance obligations)</td>
    </tr>` : ''}
    <tr>
      <td><strong>Technical &amp; Security Logs</strong></td>
      <td>IP address, browser user-agent header, request timestamps, authentication tokens</td>
      <td>Legitimate Interests in Cyber Defense &amp; Service Availability (GDPR Art. 6(1)(f))</td>
      <td>30 to 90 days on automated rolling purge cycles</td>
    </tr>
    ${v.collectedDataCategories.some(c => c.includes('Location') || c.includes('Geolocation')) ? `
    <tr>
      <td><strong>Geolocation Telemetry</strong></td>
      <td>IP-derived country and regional city-level coordinates</td>
      <td>Legitimate Interests (service localization, regional fraud detection)</td>
      <td>Up to 14 months rolling aggregation window</td>
    </tr>` : ''}
    ${v.trackersList ? `
    <tr>
      <td><strong>Marketing &amp; Cookie Identifiers</strong></td>
      <td>Aggregated visitor analytics IDs (_ga), advertising attribution tags</td>
      <td>Freely-Given Consent (GDPR Art. 6(1)(a); PECR reg. 6; ePrivacy Directive)</td>
      <td>Retained until consent is revoked, plus 30 days for suppression list maintenance</td>
    </tr>` : ''}
  </tbody>
</table>`
  },
  {
    id: 'pp-gdpr-rights',
    docType: 'privacy_policy',
    section: 'Data Subject Rights',
    title: 'GDPR Data Subject Rights (Articles 15–22)',
    jurisdiction: 'GDPR',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    requiredIf: (a, ctx) => ctx.jurisdictions.some((j: string) => /gdpr|eu|eea/i.test(j)),
    template: (v) => `
<h3>2. European Data Subject Rights (GDPR Articles 15–22)</h3>
<p>If you reside within the European Economic Area (EEA), you possess statutory data subject rights under Regulation (EU) 2016/679 (GDPR), subject to lawful statutory exemptions (such as GDPR Art. 17(3) for legal compliance or Art. 21 for compelling legitimate grounds):</p>
<ul>
  <li><strong>Right of Access (Art. 15):</strong> Obtain confirmation as to whether your personal data is processed, alongside a copy of such data.</li>
  <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate or incomplete personal records without undue delay.</li>
  <li><strong>Right to Erasure ("Right to be Forgotten", Art. 17):</strong> Request deletion of personal data where it is no longer necessary for original purposes, subject to Art. 17(3) statutory exemptions.</li>
  <li><strong>Right to Restriction of Processing (Art. 18):</strong> Request temporary limitation of processing while data accuracy or lawful basis is contested.</li>
  <li><strong>Right to Data Portability (Art. 20):</strong> Receive your personal information in a structured, commonly used, and machine-readable format.</li>
  <li><strong>Right to Object (Art. 21):</strong> Object at any time to processing based on legitimate interests or direct marketing profiling.</li>
  <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Where processing is predicated on consent, revoke consent at any time without affecting prior lawful processing.</li>
</ul>
<p><strong>Statutory Response Timeline:</strong> To exercise your rights, submit a request to our Data Protection Lead at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>. In accordance with GDPR Article 12(3), we respond to all verified data subject requests within <strong>one (1) calendar month</strong> of receipt. That period may be extended by up to two (2) further months where necessary, taking into account request complexity and volume, with written notice provided within the initial month.</p>`
  },
  {
    id: 'pp-uk-gdpr-rights',
    docType: 'privacy_policy',
    section: 'Data Subject Rights',
    title: 'UK Data Subject Rights (UK GDPR & DPA 2018)',
    jurisdiction: 'UK_GDPR',
    guidance: REGULATOR_CITATIONS.ICO_DIRECT_MARKETING,
    requiredIf: (a, ctx) => ctx.jurisdictions.some((j: string) => /uk/i.test(j)),
    template: (v) => `
<h3>2.1. United Kingdom Data Subject Rights</h3>
<p>For individuals residing in the United Kingdom, processing of personal data is governed by the UK General Data Protection Regulation (UK GDPR) read alongside the Data Protection Act 2018 (DPA 2018). You possess equivalent statutory data subject rights as described above, enforceable through the UK Information Commissioner's Office (ICO). Verified requests are processed within one (1) calendar month by contacting <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>.</p>`
  },
  {
    id: 'pp-ccpa-rights',
    docType: 'privacy_policy',
    section: 'California Consumer Rights',
    title: 'California Consumer Privacy Rights (CCPA / CPRA Disclosures)',
    jurisdiction: 'CCPA',
    guidance: REGULATOR_CITATIONS.CPPA_OPT_OUT_SPI,
    requiredIf: (a, ctx) => ctx.jurisdictions.some((j: string) => /ccpa|cpra|california/i.test(j)),
    template: (v) => `
<h3>3. California Consumer Privacy Rights (CCPA / CPRA Disclosures)</h3>
<p>Under the California Consumer Privacy Act as amended by the California Privacy Rights Act (Cal. Civ. Code § 1798.100 et seq.):</p>
<div class="regulatory-callout">
  <h4>Notice of Right to Opt-Out of Sale and Sharing</h4>
  <p><strong>We do not sell personal data for monetary compensation.</strong> However, under CPRA statutory definitions, deploying third-party analytics pixels or behavioral advertising tags may be deemed a "sale" or "share" for cross-context behavioral advertising.</p>
  <p>California consumers have the right to direct businesses not to sell or share their personal information. You may submit an opt-out request at our dedicated portal or by emailing <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> with the subject line "CCPA Opt-Out".</p>
</div>
<p><strong>Recognition of Global Privacy Control (GPC):</strong> In accordance with Cal. Code Regs. tit. 11 § 7025, when our web properties receive a recognized browser-level Global Privacy Control (GPC) opt-out preference signal via standard HTTP request headers or DOM signals, our consent system treats the signal as a valid consumer opt-out of cross-context behavioral advertising and personal data sales/shares for that browser session.</p>
${v.collectsSensitive ? `
<p><strong>Limitation of Sensitive Personal Information:</strong> We collect and process Sensitive Personal Information (SPI) solely for the necessary business purposes permitted under Cal. Code Regs. tit. 11 § 7027(m). You possess the statutory right to limit the use and disclosure of your Sensitive Personal Information under Cal. Civ. Code § 1798.121 by contacting <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>.</p>` : `
<p><strong>No Collection of Sensitive Personal Information:</strong> We do not collect or process Sensitive Personal Information (as defined in Cal. Civ. Code § 1798.140(ae)). Consequently, the statutory right to limit under Cal. Civ. Code § 1798.121 and Cal. Code Regs. tit. 11 § 7027 is not applicable to our operations.</p>`}
<p><strong>Statutory Response Timeline:</strong> Pursuant to Cal. Civ. Code § 1798.130(a)(2), we confirm receipt of verifiable consumer requests within ten (10) business days and provide a substantive response within forty-five (45) calendar days (extendable once by an additional 45 days where reasonably necessary, with written notification).</p>`
  },
  {
    id: 'pp-coppa-minors',
    docType: 'privacy_policy',
    section: "Children's Privacy",
    title: "Children's Privacy Protection (COPPA & GDPR Art. 8)",
    jurisdiction: 'COPPA',
    guidance: REGULATOR_CITATIONS.FTC_COPPA,
    template: (v) => v.hasMinors ? `
<h3>4. Children's Data &amp; Verifiable Parental Consent</h3>
<p>Our Service provides features that may be accessible to minors under the age of ${v.minorsAgeLimit}. In compliance with the Children's Online Privacy Protection Act (COPPA, 16 C.F.R. Part 312) and GDPR Article 8:</p>
<ul>
  <li>We obtain verifiable parental consent prior to collecting personal data from children under age 13 (or 16 in applicable EU member states).</li>
  <li>Parents and legal guardians retain the right to review, delete, or prohibit further collection of their child's data by contacting <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>.</li>
  <li>We do not condition a child's participation in an activity on the disclosure of more personal information than is reasonably necessary.</li>
</ul>` : `
<h3>4. Children's Privacy</h3>
<p>Our Service is intended strictly for general audiences and is not directed to children under 13 years of age (or under 16 within the EEA). We do not knowingly collect personal information from children without verified parental consent. If we become aware that a child under statutory age limits has provided personal data, we take immediate corrective steps to delete such records from our servers.</p>`
  },
  {
    id: 'pp-international-transfers',
    docType: 'privacy_policy',
    section: 'International Transfers',
    title: 'Cross-Border Data Transfers & Adequacy Safeguards',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_TRANSFERS,
    template: (v) => `
<h3>5. Cross-Border Data Transfers &amp; Safeguards</h3>
<p>Where personal data originates in the EEA, UK, or Switzerland and is transferred to servers located in third countries (e.g. the United States), we implement robust statutory safeguards pursuant to GDPR Chapter V:</p>
<ul>
  <li><strong>EU-US Data Privacy Framework (DPF):</strong> Transfers to certified US service providers operate under the European Commission's Adequacy Decision of July 10, 2023.</li>
  <li><strong>Standard Contractual Clauses (SCCs):</strong> For providers not certified under DPF, transfers are governed by the European Commission's approved Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914) combined with Transfer Impact Assessments (TIAs).</li>
  <li><strong>UK International Data Transfer Addendum:</strong> For UK personal data, transfers utilize the UK Information Commissioner's Office approved International Data Transfer Addendum (IDTA).</li>
</ul>`
  },
  {
    id: 'pp-subprocessors',
    docType: 'privacy_policy',
    section: 'Sub-Processors',
    title: 'Third-Party Processors & Service Providers',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>6. Authorized Sub-Processors &amp; Service Providers</h3>
<p>We engage vetted third-party service providers bound by executed Data Processing Agreements (DPAs) with strict confidentiality and audit commitments (GDPR Art. 28):</p>
<table class="compliance-table">
  <thead>
    <tr>
      <th>Provider</th>
      <th>Category</th>
      <th>Processing Purpose</th>
      <th>Transfer Safeguard</th>
    </tr>
  </thead>
  <tbody>
    ${v.subProcessors.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>${p.purpose}</td>
      <td><span class="shield-pill">${p.transferSafeguard}</span></td>
    </tr>`).join('')}
  </tbody>
</table>`
  },
  {
    id: 'pp-contact-dpo',
    docType: 'privacy_policy',
    section: 'Supervisory Authority & Contact',
    title: 'Data Protection Lead & Supervisory Authority Inquiries',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>7. Data Protection Lead &amp; Supervisory Authority</h3>
<p>For questions, statutory notices, or to exercise your rights, contact our Data Protection Lead:</p>
<div class="contact-dpo-box">
  <p><strong>Designated Privacy Lead:</strong> ${v.dpoName || 'Compliance Office'}</p>
  <p><strong>Direct Inquiries:</strong> <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a></p>
  <p><strong>Corporate Address:</strong> ${v.companyAddress}</p>
  <p><strong>Competent Lead Supervisory Authority:</strong> ${v.supervisoryAuthority}</p>
</div>
<p>European and UK residents retain the statutory right to lodge a formal complaint with their national data protection authority if they consider that our processing violates applicable data protection regulations.</p>`
  },

  // ==========================================
  // TERMS OF SERVICE CLAUSES
  // ==========================================
  {
    id: 'tos-header',
    docType: 'terms_of_service',
    section: 'Preamble',
    title: 'Agreement to Terms of Service',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h2>Terms of Service & User Agreement</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr} | <strong>Governing Jurisdiction:</strong> ${v.governingLaw}</p>
<p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and <strong>${v.companyName}</strong> ("Company", "we", "us") governing your access to and use of our website located at <strong>${v.siteUrl}</strong> (the "Site") and all associated services, software, APIs, features, and content (collectively, the "Platform" or the "Site").</p>
<p><strong>Age Requirement:</strong> You must be at least 18 years of age, or the legal age of majority in your jurisdiction, to enter into binding contracts. If you are between the ages of 13 and 17 (or 16 and 17 in the EEA), you may only access and use the Platform with the verifiable consent and active supervision of your parent or legal guardian who agrees to be bound by these Terms. The Platform is strictly not intended for or directed to children under 13 years of age (or under 16 in jurisdictions subject to GDPR Article 8 unless parental authorization is provided).</p>`
  },
  {
    id: 'tos-accounts',
    docType: 'terms_of_service',
    section: 'User Accounts',
    title: 'Account Registration, Security & Credentials',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    requiredIf: (a) => a.has_accounts !== false,
    template: (v) => `
<h3>Account Registration & Security</h3>
<p>To utilize specific features of the Platform, you must create a registered account. You agree to:</p>
<ul>
  <li>Provide accurate, current, and complete registration information.</li>
  <li>Maintain the confidentiality and security of your account credentials and passwords.</li>
  <li>Promptly notify us at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> if you detect or suspect any unauthorized breach or account misuse.</li>
  <li>Accept full responsibility for all activities occurring under your registered account credentials.</li>
</ul>`
  },
  {
    id: 'tos-subscriptions',
    docType: 'terms_of_service',
    section: 'Subscriptions & Billing',
    title: 'Subscriptions, Recurring Billing & Auto-Renewal',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    requiredIf: (a) => a.has_subscriptions !== false || a.sells_physical_products || a.collects_payment,
    template: (v) => `
<h3>Subscriptions, Fees & Automatic Renewal</h3>
<p>Certain services require a paid subscription. By purchasing a subscription:</p>
<ul>
  <li><strong>Continuous Billing:</strong> You authorize us (via our PCI-DSS compliant payment processor) to bill your designated payment method on a recurring cycle (monthly or annually) until cancelled.</li>
  <li><strong>Automatic Renewal:</strong> Subscriptions automatically renew at the end of each billing term unless cancelled at least twenty-four (24) hours prior to the renewal date.</li>
  <li><strong>Price Changes:</strong> We reserve the right to revise subscription fees upon thirty (30) days advance written notice. Continued use following fee adjustments constitutes acceptance.</li>
  <li><strong>Cancellation:</strong> You may cancel your subscription at any time through your dashboard settings. Cancellation terminates recurring billing for the subsequent period.</li>
</ul>`
  },
  {
    id: 'tos-refunds',
    docType: 'terms_of_service',
    section: 'Refunds & Statutory Withdrawal',
    title: 'Refund Policy & Statutory 14-Day EU Right of Withdrawal',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h3>Refund Policy & EU Statutory Right of Withdrawal</h3>
<p>Our cancellation and refund provisions reflect both mandatory statutory consumer rights and our commercial satisfaction commitments:</p>
<ul>
  <li><strong>EEA / EU / UK Statutory 14-Day Right of Withdrawal:</strong> Under Directive 2011/83/EU on Consumer Rights (and equivalent UK consumer regulations), consumers habitually residing in the European Economic Area or United Kingdom possess an unconditional statutory right to cancel and withdraw from distance contracts within fourteen (14) calendar days from the date of conclusion of the contract without providing any reason and without penalty. If you validly exercise this statutory right, we will reimburse all payments received from you without undue delay and in any event within fourteen (14) calendar days of receiving your withdrawal notice.</li>
  <li><strong>Digital Content & Immediate SaaS Provisioning Waiver:</strong> Under Article 16(m) of Directive 2011/83/EU, the statutory right of withdrawal does not apply to the supply of digital content not supplied on a tangible medium or immediate online SaaS provisioning if performance has begun. Crucially, this waiver is <em>not automatic</em>: it applies only if, prior to purchase completion during the checkout process: (i) you have provided your explicit prior consent to commence performance immediately during the 14-day statutory withdrawal period, and (ii) you have affirmatively acknowledged that you will thereby lose your right of withdrawal once digital provisioning has begun. Where performance has commenced with your express consent prior to withdrawal, any refund shall be proportional only to the unused portion of the service.</li>
  <li><strong>Commercial Satisfaction Guarantee:</strong> Separate and distinct from the unconditional statutory withdrawal right above, we offer a <strong>${v.refundPeriodDays}-day money-back guarantee</strong> for initial subscription purchases if our service fails to meet documented operational specifications. To request a refund under our commercial guarantee, contact our support team at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>.</li>
</ul>`
  },
  {
    id: 'tos-ugc',
    docType: 'terms_of_service',
    section: 'User Content',
    title: 'User-Generated Content & DMCA Notice Process',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    requiredIf: (a) => a.hosts_ugc === true,
    template: (v) => `
<h3>User-Generated Content (UGC) & Intellectual Property</h3>
<p>Users retain ownership of any content, text, data, or media submitted to the Platform ("User Content"). However, by submitting User Content, you grant ${v.companyName} a worldwide, non-exclusive, royalty-free, transferable license to host, display, and reproduce such content solely for operating the Platform.</p>
<p><strong>DMCA Copyright Policy:</strong> We comply with the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe your copyrighted work is infringed, submit a formal takedown notice to our designated Copyright Agent at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> with identification of the copyrighted work and contact credentials.</p>`
  },
  {
    id: 'tos-suspension',
    docType: 'terms_of_service',
    section: 'Termination & Suspension',
    title: 'Account Suspension, Termination & Closure',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h3>Account Suspension, Termination & Closure</h3>
<p>Both you and ${v.companyName} retain specific rights regarding account termination and service discontinuation:</p>
<ul>
  <li><strong>Termination by User:</strong> You may close your account and terminate these Terms at any time by navigating to your account settings or contacting <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>. Termination takes effect at the conclusion of your current billing period.</li>
  <li><strong>Ordinary Termination by Company:</strong> We may terminate your account or discontinue the Platform for convenience by providing you with at least fourteen (14) calendar days advance written notice via email, with a pro-rata refund of any prepaid fees for unexpired subscription periods.</li>
  <li><strong>Suspension or Immediate Termination for Cause:</strong> We may suspend or terminate your access immediately only upon: (i) material breach of these Terms or the Acceptable Use Policy; (ii) engagement in fraudulent, unlawful, or security-compromising activities; or (iii) failure to cure a remediable breach within seven (7) days of written notice. Where suspension occurs, we will provide a clear written explanation of the grounds for suspension.</li>
  <li><strong>Data Retrieval & Export:</strong> Except where prohibited by law or urgent security concerns, you will be granted a reasonable opportunity (not less than thirty (30) days following notice) to retrieve and export your customer data prior to account deletion. Suspension or termination for cause does not prejudice any non-waivable statutory consumer withdrawal rights accrued prior to the breach.</li>
</ul>`
  },
  {
    id: 'tos-modifications',
    docType: 'terms_of_service',
    section: 'Modifications',
    title: 'Modifications to Terms of Service',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>Modifications to Terms</h3>
<p>We reserve the right to modify these Terms to reflect changes in our services, applicable statutes, or regulatory requirements. We will notify you of any material changes at least thirty (30) days before they take effect by email to your registered address and via a prominent announcement on the Platform. If you do not agree to the amended terms, you may terminate your account without penalty prior to the effective date. Your continued access to or use of the Platform after the effective date constitutes your agreement to the updated Terms.</p>`
  },
  {
    id: 'tos-liability',
    docType: 'terms_of_service',
    section: 'Liability & Warranties',
    title: 'Disclaimer of Warranties & Limitations of Liability',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>Limitation of Liability & Warranty Disclaimer</h3>
<p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, SUBJECT ALWAYS TO MANDATORY CONSUMER PROTECTIONS.</p>
<p><strong>MANDATORY STATUTORY CARVE-OUTS:</strong> NOTHING IN THESE TERMS SHALL OPERATE TO EXCLUDE OR LIMIT EITHER PARTY'S LIABILITY FOR:</p>
<ul>
  <li>(A) DEATH OR PERSONAL INJURY CAUSED BY NEGLIGENCE;</li>
  <li>(B) FRAUD OR FRAUDULENT MISREPRESENTATION;</li>
  <li>(C) GROSS NEGLIGENCE OR INTENTIONAL/WILLFUL MISCONDUCT; OR</li>
  <li>(D) ANY STATUTORY RIGHTS OR NON-WAIVABLE LEGAL GUARANTEES AFFORDED TO CONSUMERS UNDER APPLICABLE LAW, INCLUDING MANDATORY CONFORMITY GUARANTEES UNDER DIRECTIVE (EU) 2019/770 ON CONTRACTS FOR THE SUPPLY OF DIGITAL CONTENT AND SERVICES.</li>
</ul>
<p>SUBJECT TO THE FOREGOING CARVE-OUTS AND APPLICABLE CONSUMER STATUTES, IN NO EVENT SHALL ${v.companyName}, ITS OFFICERS, DIRECTORS, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL), AND TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR ONE HUNDRED US DOLLARS ($100), WHICHEVER IS GREATER.</p>`
  },
  {
    id: 'tos-governing-law',
    docType: 'terms_of_service',
    section: 'Dispute Resolution',
    title: 'Governing Law & Dispute Forum',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>Governing Law & Dispute Resolution</h3>
<p>These Terms and any dispute arising out of or related hereto shall be governed by and construed in accordance with the laws of <strong>${v.governingLaw}</strong>, without regard to conflicts of law principles, subject to mandatory consumer conflict rules.</p>
<div class="regulatory-reference-card">
  <span class="ref-badge">Consumer Mandatory Protections (Rome I Regulation)</span>
  <p><strong>FOR CONSUMERS RESIDING IN THE EUROPEAN UNION, EEA, OR THE UNITED KINGDOM:</strong> Under Article 6 of Regulation (EC) No 593/2008 (Rome I), the choice of governing law shall not have the result of depriving you of the protection afforded to you by provisions that cannot be derogated from by agreement under the law of the country where you have your habitual residence. You may bring proceedings against ${v.companyName} either in the courts of ${v.disputeForum} or in the competent courts of your member state of habitual residence.</p>
  <p>The European Commission provides an online dispute resolution platform for consumer complaints, accessible at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>
</div>`
  },

  // ==========================================
  // COOKIE POLICY CLAUSES
  // ==========================================
  {
    id: 'cookie-header',
    docType: 'cookie_policy',
    section: 'Overview',
    title: 'Cookie & Tracking Technologies Notice',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h2>Cookie & Tracking Technologies Policy</h2>
<p class="doc-meta"><strong>Last Updated:</strong> ${v.dateStr} | <strong>Compliance Standards:</strong> ePrivacy Directive (Directive 2002/58/EC) & GDPR Art. 7</p>
<p>This Cookie Policy explains how <strong>${v.companyName}</strong> uses cookies, pixel tags, local storage, and similar tracking technologies when you visit <strong>${v.siteUrl}</strong>.</p>
<div class="regulatory-reference-card">
  <span class="ref-badge">ePrivacy & EDPB Compliance</span>
  <p><strong>EDPB Guidelines 05/2020:</strong> We enforce prior opt-in consent before deploying non-essential analytics or advertising cookies. Necessary cookies are exempted from consent under ePrivacy Article 5(3).</p>
</div>`
  },
  {
    id: 'cookie-inventory-table',
    docType: 'cookie_policy',
    section: 'Cookie Inventory',
    title: 'Cookie & Tracking Technologies Inventory',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.ICO_DIRECT_MARKETING,
    template: (v) => `
<h3>Cookie & Tracking Technologies Inventory</h3>
<p>The following table lists the active cookies and tracking technologies deployed on <strong>${v.siteUrl}</strong>:</p>
<table class="compliance-table">
  <thead>
    <tr>
      <th>Cookie Name</th>
      <th>Provider / Domain</th>
      <th>Category</th>
      <th>Lifespan</th>
      <th>Statutory Purpose</th>
    </tr>
  </thead>
  <tbody>
    ${v.detectedCookies.map(c => `
    <tr>
      <td><code>${c.name}</code></td>
      <td>${c.provider}</td>
      <td><span class="category-badge cat-${c.category.toLowerCase().replace(/[^a-z]/g, '-')}">${c.category}</span></td>
      <td>${c.expiry}</td>
      <td>${c.purpose}</td>
    </tr>`).join('')}
  </tbody>
</table>`
  },
  {
    id: 'cookie-consent-management',
    docType: 'cookie_policy',
    section: 'Consent Controls',
    title: 'Managing Cookie Preferences & Google Consent Mode v2',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>Managing Your Cookie Preferences</h3>
<p>When you first visit our site, our Cookie Banner allows you to accept or decline cookies by category:</p>
<ul>
  <li><strong>Strictly Necessary:</strong> Always active. Essential for authentication, security, and session management.</li>
  <li><strong>Analytics & Performance:</strong> Optional. Helps us measure site traffic and optimize features (maps to Google Consent Mode v2 <code>analytics_storage</code>).</li>
  <li><strong>Advertising & Marketing:</strong> Optional. Used for personalized ads and cross-platform conversions (maps to <code>ad_storage</code>, <code>ad_user_data</code>, and <code>ad_personalization</code>).</li>
</ul>
<p>You can change your consent preferences at any time by clicking the "Cookie Preferences" link in our website footer or through your browser settings.</p>`
  },

  // ==========================================
  // EULA CLAUSES
  // ==========================================
  {
    id: 'eula-full',
    docType: 'eula',
    section: 'Software License',
    title: 'End User License Agreement (EULA)',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    requiredIf: (a) => a.distributes_software === true,
    template: (v) => `
<h2>End User License Agreement (EULA)</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr}</p>
<p>This End User License Agreement ("EULA") is a legal agreement between you and <strong>${v.companyName}</strong> regarding software, client libraries, and applications provided through <strong>${v.siteUrl}</strong>.</p>
<h3>Grant of License</h3>
<p>We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, and execute the Software strictly in accordance with this Agreement.</p>
<h3>Restrictions</h3>
<p>You agree not to, and you will not permit others to: (a) license, sell, rent, lease, or distribute the Software; (b) reverse engineer, decompile, or disassemble any portion of the Software; (c) modify, translate, or create derivative works based upon the Software; (d) remove or obscure any proprietary copyright notices.</p>
<h3>Telemetry & Analytics</h3>
<p>The Software may collect technical telemetry and diagnostic crash data to maintain stability. Such telemetry is anonymized and processed in accordance with our Privacy Policy.</p>`
  },

  // ==========================================
  // ACCEPTABLE USE POLICY CLAUSES
  // ==========================================
  {
    id: 'aup-full',
    docType: 'acceptable_use',
    section: 'Acceptable Use',
    title: 'Acceptable Use Policy (AUP)',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h2>Acceptable Use Policy (AUP)</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr}</p>
<p>This Acceptable Use Policy defines prohibited activities when accessing <strong>${v.siteUrl}</strong> and services operated by <strong>${v.companyName}</strong>.</p>
<h3>Prohibited Actions</h3>
<p>You may not use our Platform to:</p>
<ul>
  <li>Violate any local, national, or international law, statute, or regulation.</li>
  <li>Probe, scan, or test the vulnerability of any system, network, or server without explicit authorization.</li>
  <li>Deploy automated scrapers, crawlers, or harvesting bots that exceed standard rate limits or circumvent robots.txt.</li>
  <li>Distribute unsolicited commercial communications, malware, trojans, or phishing payloads.</li>
  <li>Infringe upon intellectual property, privacy, or proprietary rights of third parties.</li>
</ul>
<h3>Enforcement, Notice & Remediation</h3>
<p>We investigate suspected violations of this Policy. If we determine that a violation has occurred, we will issue a written warning describing the violation and, where practicable, afford a cure period of not less than seven (7) days. We reserve the right to suspend or restrict access where urgent security risks or severe unlawful acts occur. Any suspension or termination shall be conducted in accordance with the termination procedures in our Terms of Service and without prejudice to statutory consumer rights, including the right to refund of unperformed services or statutory withdrawal rights under Directive 2011/83/EU where applicable.</p>`
  },

  // ==========================================
  // LEGAL DISCLAIMER CLAUSES
  // ==========================================
  {
    id: 'disclaimer-full',
    docType: 'disclaimer',
    section: 'Disclaimer',
    title: 'General & Professional Advice Disclaimer',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    requiredIf: (a) => a.provides_advice === true,
    template: (v) => `
<h2>Legal & Professional Information Disclaimer</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr}</p>
<p>The information provided by <strong>${v.companyName}</strong> on <strong>${v.siteUrl}</strong> is for general informational and educational purposes only.</p>
<h3>No Legal, Medical, or Financial Advice</h3>
<p>All materials and software tools are provided in good faith. However, we make no representation or warranty of any kind regarding completeness, accuracy, or suitability. Content published on the Platform does not constitute formal legal, financial, or medical advice and does not establish any attorney-client or professional fiduciary relationship.</p>
<h3>External Links Disclaimer</h3>
<p>The Site may contain links to third-party websites or content. Such external links are not investigated or monitored by us for accuracy or completeness, and we do not endorse or assume liability for third-party information.</p>`
  },

  // ==========================================
  // RETURN & REFUND POLICY CLAUSES
  // ==========================================
  {
    id: 'rp-header',
    docType: 'return_policy',
    section: 'Overview & Statutory Framework',
    title: 'Return, Refund & Cancellation Policy Notice',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h2>Return, Refund & Cancellation Policy</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr} | <strong>Compliance Standards:</strong> EU Consumer Rights Directive (Directive 2011/83/EU) & Digital Content Directive (EU) 2019/770</p>
<p>This Return, Refund &amp; Cancellation Policy governs digital services, subscriptions, and purchases made through <strong>${v.siteUrl}</strong>, operated by <strong>${v.companyName}</strong>.</p>`
  },
  {
    id: 'rp-statutory-withdrawal',
    docType: 'return_policy',
    section: 'Statutory Right of Withdrawal',
    title: 'Statutory 14-Day Right of Withdrawal (EEA & UK)',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h3>Statutory 14-Day Right of Withdrawal (EEA & UK Consumers)</h3>
<p>If you are a consumer habitually residing in the European Economic Area (EEA) or the United Kingdom, you possess an unconditional statutory right to cancel and withdraw from your contract within fourteen (14) calendar days from the date of purchase without giving any reason and without incurring any penalty.</p>
<p>To exercise your statutory right of withdrawal, you must notify us of your clear decision prior to the expiration of the 14-day period. You may do so by contacting us at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> or using the Model Withdrawal Form below.</p>
<p>Upon receipt of your withdrawal notice, we will reimburse all payments received from you without undue delay and in any event within fourteen (14) calendar days using the same payment method as was used for the initial transaction.</p>`
  },
  {
    id: 'rp-digital-exceptions',
    docType: 'return_policy',
    section: 'Digital Content Exceptions',
    title: 'Digital Content & SaaS Performance Exceptions',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h3>Digital Content & SaaS Performance Exceptions</h3>
<p>Under Article 16(m) of Directive 2011/83/EU, the right of withdrawal is waived for digital content not supplied on a tangible medium or immediate online SaaS provisioning only when all of the following conditions are met:</p>
<ul>
  <li>You provided express prior consent at checkout to begin service provisioning immediately during the 14-day cancellation window; and</li>
  <li>You explicitly acknowledged during purchase that you lose your right of withdrawal once immediate digital provisioning or access commences.</li>
</ul>
<p>If you begin using digital services during the withdrawal period with prior consent, and subsequently cancel before completion, you will only be charged a proportional amount corresponding to the services performed up to the moment of cancellation.</p>`
  },
  {
    id: 'rp-commercial-guarantee',
    docType: 'return_policy',
    section: 'Commercial Satisfaction Guarantee',
    title: 'Commercial Money-Back Guarantee',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h3>Commercial Money-Back Satisfaction Guarantee</h3>
<p>Separate from your statutory withdrawal rights, ${v.companyName} provides a <strong>${v.refundPeriodDays}-day commercial satisfaction guarantee</strong>. If our platform or digital deliverables fail to conform to documented technical specifications or service descriptions, you may request a full refund within ${v.refundPeriodDays} calendar days of initial purchase by contacting our support team at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> with your order reference.</p>`
  },
  {
    id: 'rp-process',
    docType: 'return_policy',
    section: 'Model Withdrawal Form',
    title: 'Refund Procedure & Model Statutory Form',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EU_WITHDRAWAL,
    template: (v) => `
<h3>Refund Request Procedure & Model Withdrawal Form</h3>
<p>To submit a cancellation or refund request, send an email to <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> with your account email and transaction ID. You may optionally use the following model text:</p>
<div class="model-withdrawal-box" style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.2); padding: 1.25rem; border-radius: 6px; font-family: monospace; font-size: 0.8125rem; line-height: 1.6;">
  To: ${v.companyName} (${v.dpoEmail})<br/>
  I hereby give notice that I withdraw from my contract for the provision of the following service: [Insert Service / Plan Name]<br/>
  Ordered on: [Insert Date] / Received on: [Insert Date]<br/>
  Consumer Name: [Insert Name]<br/>
  Consumer Address: [Insert Address]<br/>
  Consumer Email: [Insert Email]<br/>
  Date: [Insert Date]
</div>`
  },

  // ==========================================
  // ACCESSIBILITY STATEMENT CLAUSES
  // ==========================================
  {
    id: 'as-header',
    docType: 'accessibility_statement',
    section: 'Commitment & Standards',
    title: 'Digital Accessibility Commitment & Conformance Standard',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h2>Website Accessibility Statement</h2>
<p class="doc-meta"><strong>Last Updated:</strong> ${v.dateStr} | <strong>Conformance Standard:</strong> Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</p>
<p><strong>${v.companyName}</strong> is committed to ensuring digital accessibility for individuals with disabilities when using <strong>${v.siteUrl}</strong>. We continually apply relevant accessibility standards to improve user experience for everyone, in alignment with the European Accessibility Act (Directive (EU) 2019/882), Section 508 of the US Rehabilitation Act, and Title III of the Americans with Disabilities Act (ADA).</p>`
  },
  {
    id: 'as-measures',
    docType: 'accessibility_statement',
    section: 'Technical Measures',
    title: 'Accessibility Measures & Conformance Status',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>Accessibility Measures & Conformance Status</h3>
<p>We take the following organizational and technical measures to ensure accessibility across our platform:</p>
<ul>
  <li>Include accessibility as an integral component of our UI/UX design specifications and software development lifecycle.</li>
  <li>Ensure semantic HTML structure with ARIA landmarks, roles, and accessible names for interactive elements.</li>
  <li>Maintain compliant color contrast ratios (minimum 4.5:1 for normal text and 3:1 for large text and interactive components).</li>
  <li>Ensure full keyboard navigability with visible focus indicators and logical tab order.</li>
  <li>Provide meaningful text alternatives (alt text) for non-decorative imagery and media.</li>
  <li>Support zoom and magnification up to 200% without loss of content or functionality.</li>
</ul>
<p><strong>Conformance Status:</strong> <strong>${v.siteUrl}</strong> is partially conformant with WCAG 2.1 Level AA. Partially conformant means that while the vast majority of our digital surfaces meet the standard, some third-party components or integrations may still be undergoing optimization.</p>`
  },
  {
    id: 'as-specs',
    docType: 'accessibility_statement',
    section: 'Compatibility',
    title: 'Technical Specifications & Browser Compatibility',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>Technical Specifications & Compatibility</h3>
<p>Accessibility of <strong>${v.siteUrl}</strong> relies on the following technologies to work with modern web browsers and assistive technologies (such as NVDA, JAWS, VoiceOver, and TalkBack):</p>
<ul>
  <li>HTML5 / WAI-ARIA 1.2</li>
  <li>CSS3 / Responsive Flexbox and Grid layouts</li>
  <li>ECMAScript / DOM accessibility APIs</li>
</ul>
<p>The platform is designed and tested to be compatible with major desktop and mobile browsers (Chrome, Firefox, Safari, Edge) running assistive screen readers.</p>`
  },
  {
    id: 'as-feedback',
    docType: 'accessibility_statement',
    section: 'Feedback Contact',
    title: 'Accessibility Feedback, Inquiries & Escalation',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>Feedback, Inquiries & Escalation</h3>
<p>We welcome your feedback on the accessibility of <strong>${v.siteUrl}</strong>. If you encounter accessibility barriers, require alternative formats, or need assistance, please contact our Accessibility Lead:</p>
<div class="contact-dpo-box">
  <p><strong>Accessibility Inquiries:</strong> <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a></p>
  <p><strong>Responsible Entity:</strong> ${v.companyName}</p>
  <p><strong>Mailing Address:</strong> ${v.companyAddress}</p>
  <p><strong>Response Commitment:</strong> We endeavor to respond to accessibility inquiries and remediation requests within two (2) business days.</p>
</div>`
  }
];

// Helper to extract default cookies based on declared questionnaire answers
export function buildCookieInventoryFromAnswers(answers: Record<string, any>, scannedCookies?: DetectedCookieItem[], clientDomain = 'claudetest.com'): DetectedCookieItem[] {
  if (scannedCookies && scannedCookies.length > 0) {
    return scannedCookies;
  }

  const inventory: DetectedCookieItem[] = [
    {
      name: 'pl_consent',
      provider: `First-party (${clientDomain})`,
      category: 'Strictly Necessary',
      expiry: '12 months',
      purpose: 'Stores user cookie consent choices across browser sessions and maps to Google Consent Mode v2'
    },
    {
      name: 'session_id / auth_token',
      provider: `First-party (${clientDomain})`,
      category: 'Strictly Necessary',
      expiry: 'Session',
      purpose: 'Maintains authenticated state and CSRF security tokens during navigation'
    }
  ];

  // Analytics cookies (Google Analytics & Hotjar)
  if (answers.uses_analytics !== false || answers.uses_google_analytics !== false) {
    inventory.push(
      {
        name: '_ga',
        provider: 'Google Analytics (Google Ireland Ltd.)',
        category: 'Analytics & Performance',
        expiry: '2 years',
        purpose: 'Calculates visitor, session and campaign data for aggregated site metrics'
      },
      {
        name: '_ga_*',
        provider: 'Google Analytics (Google Ireland Ltd.)',
        category: 'Analytics & Performance',
        expiry: '2 years',
        purpose: 'Maintains session state and unique pageview counts'
      }
    );
  }

  // Hotjar telemetry (session recording / UX heatmaps)
  if (answers.uses_session_recording !== false || answers.uses_hotjar === true || answers.uses_analytics !== false) {
    inventory.push(
      {
        name: '_hjSessionUser_*',
        provider: 'Hotjar Ltd. (EEA)',
        category: 'Analytics & Performance',
        expiry: '1 year',
        purpose: 'Stores a unique user ID to attribute user sessions across multiple page loads'
      },
      {
        name: '_hjSession_*',
        provider: 'Hotjar Ltd. (EEA)',
        category: 'Analytics & Performance',
        expiry: '30 minutes',
        purpose: 'Maintains current session state to ensure subsequent requests are attributed correctly'
      }
    );
  }

  // Advertising & Marketing trackers (Meta Pixel & Google Ads)
  if (answers.uses_ads !== false || answers.uses_marketing_trackers !== false || answers.uses_meta_pixel === true) {
    inventory.push(
      {
        name: '_fbp',
        provider: 'Meta Platforms Ireland Ltd. (Facebook Pixel)',
        category: 'Advertising & Marketing',
        expiry: '90 days',
        purpose: 'Stores and tracks visits across websites for social ad conversion measurement and retargeting'
      },
      {
        name: '_fbc',
        provider: 'Meta Platforms Ireland Ltd. (Facebook Pixel)',
        category: 'Advertising & Marketing',
        expiry: '90 days',
        purpose: 'Stores click ID query parameters to attribute conversions from Facebook advertisements'
      },
      {
        name: '_gcl_au',
        provider: 'Google Ads (Google Ireland Ltd.)',
        category: 'Advertising & Marketing',
        expiry: '90 days',
        purpose: 'Stores conversion tracking telemetry for Google Ads campaign performance attribution'
      }
    );
  }

  if (answers.collects_payment !== false || answers.uses_stripe === true) {
    inventory.push({
      name: '__stripe_mid / __stripe_sid',
      provider: 'Stripe Inc.',
      category: 'Strictly Necessary',
      expiry: '1 year / 30 mins',
      purpose: 'Enables fraud mitigation, risk assessment, and secure PCI-DSS tokenized payment processing'
    });
  }

  return inventory;
}

// Helper to build sub-processors list from answers and detected cookies
export function buildSubProcessorsFromAnswers(answers: Record<string, any>, scannedCookies?: DetectedCookieItem[]) {
  const processors: { name: string; category: string; purpose: string; transferSafeguard: string }[] = [];

  // Cloud & Hosting (Always present if web service)
  processors.push({
    name: 'Vercel Inc. / Amazon Web Services (AWS)',
    category: 'Cloud Infrastructure & CDN',
    purpose: 'Edge compute routing, TLS termination, high-availability hosting',
    transferSafeguard: 'EU-US DPF Certified & Standard Contractual Clauses (SCCs 2021/914)'
  });

  // Database persistence
  if (answers.uses_us_cloud !== false) {
    processors.push({
      name: 'Supabase Inc. / Cloud Database Infrastructure',
      category: 'Database & Auth Storage',
      purpose: 'Persistent relational database, encrypted session credentials, audit logs',
      transferSafeguard: 'EU-US Data Privacy Framework (DPF) Certified'
    });
  }

  // Payment processing
  if (answers.collects_payment !== false || answers.uses_stripe === true) {
    processors.push({
      name: 'Stripe Payments Europe Ltd. / Stripe Inc.',
      category: 'Payment Processor & Fraud Mitigation',
      purpose: 'PCI-DSS Level 1 payment tokenization, subscription billing, and Radar fraud screening',
      transferSafeguard: 'EU-US DPF Certified & Standard Contractual Clauses'
    });
  }

  // Web analytics
  const hasAnalyticsCookies = scannedCookies?.some(c => c.name.startsWith('_ga') || (c.provider || '').toLowerCase().includes('google'));
  if (answers.uses_analytics !== false || hasAnalyticsCookies) {
    processors.push({
      name: 'Google Ireland Limited / Google LLC (Google Analytics 4)',
      category: 'Web & Interaction Telemetry',
      purpose: 'Aggregated website traffic analysis, event measurement, and session statistics',
      transferSafeguard: 'Commission Implementing Decision (EU) 2021/914 (SCCs) & EU-US DPF'
    });
  }

  // Social & Behavioral Ads (Meta Pixel)
  const hasMetaCookies = scannedCookies?.some(c => c.name.includes('_fbp') || (c.provider || '').toLowerCase().includes('meta') || (c.provider || '').toLowerCase().includes('facebook'));
  if (answers.uses_ads === true || answers.uses_marketing_trackers === true || hasMetaCookies) {
    processors.push({
      name: 'Meta Platforms Ireland Ltd. / Meta Platforms, Inc.',
      category: 'Conversion Tracking & Social Retargeting',
      purpose: 'Cross-context behavioral advertising attribution and conversion measurement',
      transferSafeguard: 'EU-US DPF Certified & Standard Contractual Clauses (Module 2/3)'
    });
  }

  // Google Ads
  const hasGoogleAds = scannedCookies?.some(c => c.name.includes('_gcl') || (c.provider || '').toLowerCase().includes('ads'));
  if (answers.uses_ads === true || hasGoogleAds) {
    processors.push({
      name: 'Google Ireland Limited (Google Ads)',
      category: 'Search & Display Ad Attribution',
      purpose: 'Ad conversion attribution, audience matching, and campaign effectiveness',
      transferSafeguard: 'EU-US DPF Certified & SCCs 2021/914'
    });
  }

  // TikTok Ads
  const hasTikTok = scannedCookies?.some(c => (c.name || '').includes('tt_') || (c.provider || '').toLowerCase().includes('tiktok'));
  if (hasTikTok) {
    processors.push({
      name: 'TikTok Information Technologies UK / TikTok Pte. Ltd.',
      category: 'Video Ad Measurement',
      purpose: 'Attribution and conversion telemetry for TikTok ad campaigns',
      transferSafeguard: 'Standard Contractual Clauses with Supplementary Technical Measures'
    });
  }

  // Session replay & Heatmaps (Hotjar / Microsoft Clarity)
  const hasHotjar = scannedCookies?.some(c => (c.name || '').includes('_hj') || (c.provider || '').toLowerCase().includes('hotjar'));
  const hasClarity = scannedCookies?.some(c => (c.name || '').includes('_cl') || (c.provider || '').toLowerCase().includes('clarity'));
  if (answers.uses_session_recording === true || hasHotjar) {
    processors.push({
      name: 'Hotjar Ltd. (Malta / EEA)',
      category: 'User Experience & Session Heatmapping',
      purpose: 'Aggregated user interaction telemetry and behavioral UX heatmaps',
      transferSafeguard: 'In-Region EEA Processing (Malta) & GDPR Art. 28 DPA'
    });
  }
  if (answers.uses_session_recording === true || hasClarity) {
    processors.push({
      name: 'Microsoft Corporation (Microsoft Clarity)',
      category: 'Behavioral Analytics & Session Playback',
      purpose: 'Session click-tracking and diagnostic UX playback metrics',
      transferSafeguard: 'EU-US DPF Certified & Standard Contractual Clauses'
    });
  }

  // Email communications
  if (answers.uses_email_marketing === true || answers.uses_mailchimp === true) {
    processors.push({
      name: 'Intuit Inc. (Mailchimp) / Twilio Inc. (SendGrid)',
      category: 'Email Delivery & Transactional Messaging',
      purpose: 'Service announcements, transactional receipts, and newsletter communications',
      transferSafeguard: 'Executed DPA with Standard Contractual Clauses & EU-US DPF'
    });
  }

  // Support chat
  if (answers.uses_support_chat === true || answers.uses_intercom === true) {
    processors.push({
      name: 'Intercom R&D Unlimited Company / Zendesk Inc.',
      category: 'Customer Support & Help Desk',
      purpose: 'Direct customer service ticketing, real-time messaging, and helpdesk logging',
      transferSafeguard: 'EU-US DPF Certified & Standard Contractual Clauses'
    });
  }

  return processors;
}

// Assemble full document by assembling clauses deterministically
export function assembleDocumentFromClauses(
  docType: ModularClause['docType'],
  site: { name: string; url: string; jurisdictions?: string[]; contact_email?: string },
  answers: Record<string, any>,
  scannedCookies?: DetectedCookieItem[]
): { html: string; markdown: string; clausesUsed: string[]; wordCount: number } {
  // Clean & sanitize email and domain
  const rawEmailInput = answers.dpo_email || answers.privacy_email || answers.contact_email || site.contact_email;
  const { email: dpoEmail, domain, siteUrl: cleanSiteUrl } = sanitizeEmailAndDomain(site.url, site.name, rawEmailInput);

  // Derive active jurisdictions
  const rawJurisdictions = (site.jurisdictions && site.jurisdictions.length > 0)
    ? site.jurisdictions
    : (answers.jurisdictions && answers.jurisdictions.length > 0 ? answers.jurisdictions : ['GDPR (EU)']);

  const activeJurisdictions: string[] = Array.isArray(rawJurisdictions) ? rawJurisdictions : [rawJurisdictions];

  const collectedCategories: string[] = [];
  if (answers.collects_email !== false) collectedCategories.push('Identifiers (Email & Contact)');
  if (answers.collects_names !== false) collectedCategories.push('Personal Details (Full Name)');
  if (answers.collects_payment !== false) collectedCategories.push('Financial & Transaction Records');
  if (answers.collects_location === true) collectedCategories.push('Geolocation & IP Telemetry');
  if (answers.has_accounts !== false) collectedCategories.push('Account Credentials & Security Logs');
  if (collectedCategories.length === 0) collectedCategories.push('Directly Provided Contact Details');

  const cookies = buildCookieInventoryFromAnswers(answers, scannedCookies, domain);
  const subProcessors = buildSubProcessorsFromAnswers(answers, scannedCookies);

  const vars: ClauseVariables = {
    companyName: site.name || 'Company Inc.',
    siteUrl: cleanSiteUrl,
    domain,
    jurisdictions: activeJurisdictions,
    jurisdictionsStr: activeJurisdictions.join(', '),
    dateStr: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    dpoName: answers.dpo_name || (answers.has_data_officer ? 'Data Protection Lead' : undefined),
    dpoEmail,
    companyAddress: answers.company_address || '100 Compliance Way, Suite 400, San Francisco, CA 94105',
    supervisoryAuthority: answers.supervisory_authority || (
      activeJurisdictions.some(j => /uk/i.test(j))
        ? 'UK Information Commissioner\'s Office (ICO)'
        : 'Lead European Data Protection Authority (EDPB member state authority)'
    ),
    collectedDataList: collectedCategories.join(', '),
    collectedDataCategories: collectedCategories,
    trackersList: cookies.map(c => c.provider).filter((v, i, a) => a.indexOf(v) === i).join(', '),
    detectedCookies: cookies,
    subProcessors,
    retentionMonths: Number(answers.data_retention_period) || 12,
    hasMinors: answers.collects_minors === true || answers.minors_data === true,
    minorsAgeLimit: Number(answers.minors_age_limit) || 13,
    hasAccounts: answers.has_accounts !== false,
    hasSubscriptions: answers.has_subscriptions !== false || answers.collects_payment !== false,
    refundPeriodDays: Number(answers.refund_period_days) || 14,
    hasUgc: answers.hosts_ugc === true,
    collectsSensitive: answers.collects_sensitive === true,
    governingLaw: answers.governing_law || 'State of California, United States',
    disputeForum: answers.dispute_forum || 'San Francisco, California'
  };

  const context = {
    site: { ...site, url: cleanSiteUrl },
    jurisdictions: activeJurisdictions
  };

  const matchingClauses = CLAUSE_CATALOG.filter(clause => {
    if (clause.docType !== docType) return false;
    if (clause.requiredIf && !clause.requiredIf(answers, context)) return false;
    return true;
  });

  const rawBodyHtml = matchingClauses.map(c => c.template(vars)).join('\n\n');

  // Dynamic sequential renumbering for all <h3> section headers to prevent any numbering jumps
  let sectionCounter = 1;
  const renumberedHtml = rawBodyHtml.replace(/<h3(?:\s+[^>]*)?>(\d+\.)?\s*([^<]+)<\/h3>/gi, (_match, _num, titleText) => {
    return `<h3>${sectionCounter++}. ${titleText.trim()}</h3>`;
  });

  const disclaimerBanner = `
<div class="legal-disclaimer-box" style="background: rgba(200, 241, 53, 0.05); border: 1px solid rgba(200, 241, 53, 0.25); border-radius: 8px; padding: 1.25rem; margin-bottom: 2rem; color: #d4d4d8; font-size: 0.8125rem; line-height: 1.5;">
  <strong style="color: #c8f135;">COMPLIANCE NOTICE &amp; DISCLAIMER:</strong> This legal document has been generated via Paperloo's modular clause engine based on user declarations and technical configuration for <code>${vars.siteUrl}</code>. It reflects regulatory guidelines including EDPB Guidelines 05/2020, CPPA Regulations, and ICO statutory guidance. This self-assessment document does not constitute formal legal advice, a certified statutory audit, or an attorney-client relationship. Review by qualified legal counsel in your operating jurisdiction is advised.
</div>`;

  const fullHtml = `<div class="paperloo-modular-document" dir="ltr">\n${disclaimerBanner}\n${renumberedHtml}\n</div>`;

  // Strip HTML tags for word count
  const rawText = renumberedHtml.replace(/<[^>]*>/g, ' ');
  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;

  return {
    html: fullHtml,
    markdown: renumberedHtml,
    clausesUsed: matchingClauses.map(c => c.id),
    wordCount
  };
}
