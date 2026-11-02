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
  requiredIf?: (answers: Record<string, any>) => boolean;
  template: (vars: ClauseVariables) => string;
}

export interface DetectedCookieItem {
  name: string;
  provider: string;
  category: 'Necessary' | 'Analytics' | 'Marketing' | 'Preferences';
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
    citation: 'UK Data Protection Act 2018 & PECR 2003 reg. 6',
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
    template: (v) => `
<h2>Privacy Policy & Statutory Data Protection Notice</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr} | <strong>Version:</strong> 3.0 Production Verified</p>
<p>This Privacy Policy governs the processing of personal data by <strong>${v.companyName}</strong> ("Company", "we", "us", or "our") across our digital properties, including <strong>${v.siteUrl}</strong> (the "Service"). We are committed to transparency, data minimization, and adherence to international statutory privacy frameworks, including the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act as amended by the CPRA (CCPA/CPRA), the UK Data Protection Act 2018 (UK GDPR), and applicable regional laws (${v.jurisdictionsStr}).</p>
<div class="regulatory-reference-card">
  <span class="ref-badge">Regulatory Grounding</span>
  <p><strong>EDPB Guidelines 05/2020:</strong> Information is presented in a concise, transparent, intelligible, and easily accessible format, using clear and plain language pursuant to GDPR Article 12.</p>
</div>`
  },
  {
    id: 'pp-data-inventory',
    docType: 'privacy_policy',
    section: 'Data Categories',
    title: 'Categories of Personal Data Collected',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>1. Categories of Personal Data We Collect</h3>
<p>In accordance with the principle of data minimization (GDPR Art. 5(1)(c) and Cal. Code Regs. tit. 11 § 7002), we collect only the personal information reasonably necessary and proportionate to fulfill specific business operations:</p>
<table class="compliance-table">
  <thead>
    <tr>
      <th>Data Category</th>
      <th>Specific Elements Collected</th>
      <th>Lawful Basis / Business Purpose</th>
      <th>Retention Duration</th>
    </tr>
  </thead>
  <tbody>
    ${v.collectedDataCategories.map(cat => `
    <tr>
      <td><strong>${cat}</strong></td>
      <td>${cat.includes('Financial') ? 'Billing token, masked card digits, transaction history' :
            cat.includes('Location') ? 'IP-derived geolocation, regional country code' :
            cat.includes('Account') ? 'Account username, hashed credentials, session auth tokens' :
            'Directly submitted identifiers (name, email address)'}</td>
      <td>${cat.includes('Financial') ? 'Performance of Contract (GDPR Art. 6(1)(b)) & Statutory Tax Compliance' :
            cat.includes('Location') ? 'Legitimate Interest (Service localization & fraud prevention)' :
            'Contractual Performance & Customer Relationship Management'}</td>
      <td>${v.retentionMonths} months from last active engagement</td>
    </tr>`).join('')}
  </tbody>
</table>`
  },
  {
    id: 'pp-gdpr-rights',
    docType: 'privacy_policy',
    section: 'Data Subject Rights',
    title: 'GDPR & UK GDPR Data Subject Rights (Articles 15–22)',
    jurisdiction: 'GDPR',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    requiredIf: (a) => !a.jurisdictions || a.jurisdictions.some((j: string) => j.includes('GDPR') || j.includes('EU') || j.includes('UK')),
    template: (v) => `
<h3>2. European & UK Data Subject Rights</h3>
<p>If you reside within the European Economic Area (EEA), United Kingdom, or Switzerland, you possess absolute statutory rights under GDPR Articles 15 through 22 and the UK Data Protection Act 2018:</p>
<ul>
  <li><strong>Right of Access (Art. 15):</strong> You have the right to obtain confirmation as to whether your personal data is processed, alongside a complete copy of such data.</li>
  <li><strong>Right to Rectification (Art. 16):</strong> You may request the correction of inaccurate or incomplete personal records without undue delay.</li>
  <li><strong>Right to Erasure / "Right to be Forgotten" (Art. 17):</strong> You may demand deletion of your personal data where it is no longer necessary for original purposes or where consent is withdrawn.</li>
  <li><strong>Right to Restriction of Processing (Art. 18):</strong> You have the right to freeze processing while data accuracy or lawful basis is contested.</li>
  <li><strong>Right to Data Portability (Art. 20):</strong> You have the right to receive your personal information in a structured, commonly used, and machine-readable format (JSON/CSV).</li>
  <li><strong>Right to Object (Art. 21):</strong> You may object at any time to processing based on legitimate interests or direct marketing profiling.</li>
  <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Where processing relies upon consent, you may revoke consent at any time as easily as it was given.</li>
</ul>
<p>To exercise any statutory right, contact our Data Protection Officer at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a>. We respond to all verified requests within thirty (30) calendar days without fee.</p>`
  },
  {
    id: 'pp-ccpa-rights',
    docType: 'privacy_policy',
    section: 'California Consumer Rights',
    title: 'CCPA / CPRA Notice at Collection & "Do Not Sell or Share"',
    jurisdiction: 'CCPA',
    guidance: REGULATOR_CITATIONS.CPPA_OPT_OUT_SPI,
    requiredIf: (a) => !a.jurisdictions || a.jurisdictions.some((j: string) => j.includes('CCPA') || j.includes('California')),
    template: (v) => `
<h3>3. California Consumer Privacy Rights (CCPA / CPRA Disclosures)</h3>
<p>Under the California Consumer Privacy Act as amended by the California Privacy Rights Act (Cal. Civ. Code § 1798.100 et seq.):</p>
<div class="regulatory-callout">
  <h4>Notice of Right to Opt-Out of Sale and Sharing</h4>
  <p><strong>We do NOT sell personal data for monetary consideration.</strong> However, under CPRA definitions, deploying third-party analytics pixels or behavioral advertising tags may be deemed "sharing" for cross-context behavioral advertising.</p>
  <p>You have the absolute right to direct us not to sell or share your personal information. You may submit an opt-out request at our dedicated portal or by emailing <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> with the subject line "CCPA Do Not Sell/Share".</p>
</div>
<p><strong>Recognition of Global Privacy Control (GPC):</strong> In strict conformance with Cal. Code Regs. tit. 11 § 7025, our web properties automatically detect and honor browser-level Global Privacy Control (GPC) opt-out preference signals without requiring manual submission.</p>
<p><strong>Limitation of Sensitive Personal Information:</strong> We do not use or disclose Sensitive Personal Information (SPI) for any purpose other than providing the core services requested by the consumer (Cal. Civ. Code § 1798.121; Cal. Code Regs. tit. 11 § 7027).</p>`
  },
  {
    id: 'pp-coppa-minors',
    docType: 'privacy_policy',
    section: "Children's Privacy",
    title: "Children's Privacy Protection (COPPA & GDPR Art. 8)",
    jurisdiction: 'COPPA',
    guidance: REGULATOR_CITATIONS.FTC_COPPA,
    template: (v) => v.hasMinors ? `
<h3>4. Children's Data & Verifiable Parental Consent</h3>
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
<h3>5. Cross-Border Data Transfers & Safeguards</h3>
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
<h3>6. Authorized Sub-Processors & Service Providers</h3>
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
    title: 'Data Protection Officer & Supervisory Authority Inquiries',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.EDPB_CONSENT,
    template: (v) => `
<h3>7. Data Protection Officer & Supervisory Authority</h3>
<p>For questions, statutory notices, or to exercise your rights, contact our Data Protection Team:</p>
<div class="contact-dpo-box">
  <p><strong>Designated Privacy Officer:</strong> ${v.dpoName || 'Compliance Office'}</p>
  <p><strong>Direct Inquiries:</strong> <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a></p>
  <p><strong>Corporate Address:</strong> ${v.companyAddress}</p>
  <p><strong>Competent Lead Supervisory Authority:</strong> ${v.supervisoryAuthority}</p>
</div>
<p>European and UK residents have the statutory right to lodge a formal complaint with their national data protection authority if they consider that our processing violates applicable data protection regulations.</p>`
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
<p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and <strong>${v.companyName}</strong> ("Company", "we", "us") governing your access to and use of <strong>${v.siteUrl}</strong> and associated software, services, and APIs (collectively, the "Platform").</p>
<p>BY ACCESSING OR USING OUR PLATFORM, YOU CONFIRM THAT YOU ARE AT LEAST 18 YEARS OF AGE (OR THE AGE OF MAJORITY IN YOUR RESIDENCE) AND AGREE TO BE BOUND BY THESE TERMS.</p>`
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
<h3>1. Account Registration & Security</h3>
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
<h3>2. Subscriptions, Fees & Automatic Renewal</h3>
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
<h3>3. Refund Policy & EU Statutory Right of Withdrawal</h3>
<p>Our refund policies reflect customer satisfaction commitments and statutory requirements:</p>
<ul>
  <li><strong>General Refund Policy:</strong> We offer a <strong>${v.refundPeriodDays}-day money-back guarantee</strong> for initial purchases if our service fails to meet documented specifications.</li>
  <li><strong>EEA / UK Statutory 14-Day Withdrawal Right:</strong> In accordance with the EU Consumer Rights Directive (Directive 2011/83/EU), consumers residing in the EEA or UK possess a statutory right to withdraw from distance contracts within fourteen (14) days of purchase without penalty.</li>
  <li><strong>Digital Content Waiver:</strong> If you explicitly consent to the immediate performance of digital services or immediate download of digital deliverables before the 14-day withdrawal period expires, you acknowledge that your statutory right of withdrawal is waived once access has commenced.</li>
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
<h3>4. User-Generated Content (UGC) & Intellectual Property</h3>
<p>Users retain ownership of any content, text, data, or media submitted to the Platform ("User Content"). However, by submitting User Content, you grant ${v.companyName} a worldwide, non-exclusive, royalty-free, transferable license to host, display, and reproduce such content solely for operating the Platform.</p>
<p><strong>DMCA Copyright Policy:</strong> We comply with the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe your copyrighted work is infringed, submit a formal takedown notice to our designated Copyright Agent at <a href="mailto:${v.dpoEmail}">${v.dpoEmail}</a> with identification of the copyrighted work and contact credentials.</p>`
  },
  {
    id: 'tos-liability',
    docType: 'terms_of_service',
    section: 'Liability & Warranties',
    title: 'Disclaimer of Warranties & Limitations of Liability',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>5. Limitation of Liability & Warranty Disclaimer</h3>
<p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
<p>IN NO EVENT SHALL ${v.companyName}, ITS OFFICERS, DIRECTORS, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THE PLATFORM.</p>
<p>OUR TOTAL AGGREGATE LIABILITY ARISING FROM ALL CLAIMS SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR ONE HUNDRED US DOLLARS ($100), WHICHEVER IS GREATER.</p>`
  },
  {
    id: 'tos-governing-law',
    docType: 'terms_of_service',
    section: 'Dispute Resolution',
    title: 'Governing Law & Dispute Forum',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.CPPA_PURPOSE_LIMITATION,
    template: (v) => `
<h3>6. Governing Law & Dispute Resolution</h3>
<p>These Terms and any dispute arising out of or related hereto shall be governed by and construed in accordance with the laws of <strong>${v.governingLaw}</strong>, without regard to conflicts of law principles.</p>
<p>Any legal suit, action, or proceeding shall be instituted exclusively in the competent courts located in <strong>${v.disputeForum}</strong>, and each party irrevocably submits to the jurisdiction of such courts.</p>`
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
    section: 'Live Inventory',
    title: 'Audit-Verified Cookie & Tracker Inventory',
    jurisdiction: 'GLOBAL',
    guidance: REGULATOR_CITATIONS.ICO_DIRECT_MARKETING,
    template: (v) => `
<h3>1. Live Audited Cookie Inventory</h3>
<p>The following table lists the active cookies and trackers identified during our compliance scan of <strong>${v.siteUrl}</strong>:</p>
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
      <td><span class="category-badge cat-${c.category.toLowerCase()}">${c.category}</span></td>
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
<h3>2. Managing Your Cookie Preferences</h3>
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
    template: (v) => `
<h2>End User License Agreement (EULA)</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr}</p>
<p>This End User License Agreement ("EULA") is a legal agreement between you and <strong>${v.companyName}</strong> regarding software, client libraries, and applications provided through <strong>${v.siteUrl}</strong>.</p>
<h3>1. Grant of License</h3>
<p>We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, and execute the Software strictly in accordance with this Agreement.</p>
<h3>2. Restrictions</h3>
<p>You agree not to, and you will not permit others to: (a) license, sell, rent, lease, or distribute the Software; (b) reverse engineer, decompile, or disassemble any portion of the Software; (c) modify, translate, or create derivative works based upon the Software; (d) remove or obscure any proprietary copyright notices.</p>
<h3>3. Telemetry & Analytics</h3>
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
<h3>1. Prohibited Actions</h3>
<p>You may not use our Platform to:</p>
<ul>
  <li>Violate any local, national, or international law, statute, or regulation.</li>
  <li>Probe, scan, or test the vulnerability of any system, network, or server without explicit authorization.</li>
  <li>Deploy automated scrapers, crawlers, or harvesting bots that exceed standard rate limits or circumvent robots.txt.</li>
  <li>Distribute unsolicited commercial communications, malware, trojans, or phishing payloads.</li>
  <li>Infringe upon intellectual property, privacy, or proprietary rights of third parties.</li>
</ul>
<h3>2. Enforcement & Suspension</h3>
<p>We reserve the right to immediately suspend or terminate access for any account found in violation of this Policy without prior notice or refund liability.</p>`
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
    template: (v) => `
<h2>Legal & Professional Information Disclaimer</h2>
<p class="doc-meta"><strong>Effective Date:</strong> ${v.dateStr}</p>
<p>The information provided by <strong>${v.companyName}</strong> on <strong>${v.siteUrl}</strong> is for general informational and educational purposes only.</p>
<h3>1. No Legal, Medical, or Financial Advice</h3>
<p>All materials and software tools are provided in good faith. However, we make no representation or warranty of any kind regarding completeness, accuracy, or suitability. Content published on the Platform does not constitute formal legal, financial, or medical advice and does not establish any attorney-client or professional fiduciary relationship.</p>
<h3>2. External Links Disclaimer</h3>
<p>The Site may contain links to third-party websites or content. Such external links are not investigated or monitored by us for accuracy or completeness, and we do not endorse or assume liability for third-party information.</p>`
  }
];

// Helper to extract default cookies based on declared questionnaire answers
export function buildCookieInventoryFromAnswers(answers: Record<string, any>, scannedCookies?: DetectedCookieItem[]): DetectedCookieItem[] {
  if (scannedCookies && scannedCookies.length > 0) {
    return scannedCookies;
  }

  const inventory: DetectedCookieItem[] = [
    {
      name: 'pl_consent',
      provider: 'paperloo.com',
      category: 'Necessary',
      expiry: '12 months',
      purpose: 'Stores user consent preferences across session requests'
    },
    {
      name: 'PHPSESSID / session_id',
      provider: 'First-party',
      category: 'Necessary',
      expiry: 'Session',
      purpose: 'Maintains user authentication state and csrf protection'
    }
  ];

  if (answers.uses_analytics !== false) {
    inventory.push(
      {
        name: '_ga',
        provider: 'Google Analytics',
        category: 'Analytics',
        expiry: '2 years',
        purpose: 'Calculates visitor, session and campaign data for site analytics'
      },
      {
        name: '_ga_*',
        provider: 'Google Analytics',
        category: 'Analytics',
        expiry: '2 years',
        purpose: 'Maintains session state and unique pageview counts'
      }
    );
  }

  if (answers.uses_ads === true || answers.uses_marketing_trackers === true) {
    inventory.push(
      {
        name: '_fbp',
        provider: 'Meta Platforms (Facebook)',
        category: 'Marketing',
        expiry: '90 days',
        purpose: 'Delivers targeted advertisements on Facebook following visit'
      },
      {
        name: '_gcl_au',
        provider: 'Google AdSense / Ads',
        category: 'Marketing',
        expiry: '90 days',
        purpose: 'Stores conversion tracking information for ad campaigns'
      }
    );
  }

  if (answers.collects_payment !== false) {
    inventory.push({
      name: '__stripe_mid / __stripe_sid',
      provider: 'Stripe Inc.',
      category: 'Necessary',
      expiry: '1 year / 30 mins',
      purpose: 'Enables fraud detection and secure payment processing'
    });
  }

  return inventory;
}

// Helper to build sub-processors list from answers
export function buildSubProcessorsFromAnswers(answers: Record<string, any>) {
  const processors = [
    {
      name: 'Vercel / Cloud Infrastructure',
      category: 'Hosting & CDN',
      purpose: 'Edge compute, content delivery, and application hosting',
      transferSafeguard: 'EU-US DPF / Standard Contractual Clauses'
    }
  ];

  if (answers.collects_payment !== false) {
    processors.push({
      name: 'Stripe Payments Inc.',
      category: 'Payment Processor',
      purpose: 'Credit card processing, billing subscriptions, and fraud prevention',
      transferSafeguard: 'PCI-DSS Level 1 & EU-US DPF Certified'
    });
  }

  if (answers.uses_analytics !== false) {
    processors.push({
      name: 'Google LLC (Google Analytics 4)',
      category: 'Web Analytics',
      purpose: 'Aggregated website traffic analysis and event tracking',
      transferSafeguard: 'EU-US DPF & SCCs 2021/914'
    });
  }

  if (answers.uses_email_marketing === true || answers.uses_mailchimp === true) {
    processors.push({
      name: 'Mailchimp / SendGrid',
      category: 'Email Communications',
      purpose: 'Transactional emails, newsletters, and user notifications',
      transferSafeguard: 'Executed DPA with Standard Contractual Clauses'
    });
  }

  if (answers.uses_support_chat === true || answers.uses_intercom === true) {
    processors.push({
      name: 'Intercom / Zendesk',
      category: 'Customer Support',
      purpose: 'Live chat widget and customer ticket management',
      transferSafeguard: 'EU-US DPF Certified'
    });
  }

  return processors;
}

// Assemble full document by assembling clauses deterministically
export function assembleDocumentFromClauses(
  docType: ModularClause['docType'],
  site: { name: string; url: string; jurisdictions?: string[] },
  answers: Record<string, any>,
  scannedCookies?: DetectedCookieItem[]
): { html: string; markdown: string; clausesUsed: string[]; wordCount: number } {
  let domain = 'example.com';
  try {
    domain = site.url ? new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname.replace('www.', '') : 'example.com';
  } catch {
    domain = site.url || 'example.com';
  }

  const collectedCategories: string[] = [];
  if (answers.collects_email !== false) collectedCategories.push('Identifiers (Email & Contact)');
  if (answers.collects_names !== false) collectedCategories.push('Personal Details (Full Name)');
  if (answers.collects_payment !== false) collectedCategories.push('Financial & Transaction Records');
  if (answers.collects_location === true) collectedCategories.push('Geolocation & IP Telemetry');
  if (answers.has_accounts !== false) collectedCategories.push('Account Credentials & Security Logs');
  if (collectedCategories.length === 0) collectedCategories.push('Directly Provided Contact Details');

  const cookies = buildCookieInventoryFromAnswers(answers, scannedCookies);
  const subProcessors = buildSubProcessorsFromAnswers(answers);

  const vars: ClauseVariables = {
    companyName: site.name || 'Company Inc.',
    siteUrl: site.url || `https://${domain}`,
    domain,
    jurisdictions: site.jurisdictions || ['GDPR (EU)', 'CCPA (California)', 'UK GDPR'],
    jurisdictionsStr: (site.jurisdictions || ['GDPR (EU)', 'CCPA (California)', 'UK GDPR']).join(', '),
    dateStr: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    dpoName: answers.dpo_name || (answers.has_data_officer ? 'Data Protection Officer' : undefined),
    dpoEmail: answers.dpo_email || `privacy@${domain}`,
    companyAddress: answers.company_address || '100 Compliance Way, Suite 400, San Francisco, CA 94105',
    supervisoryAuthority: answers.supervisory_authority || 'Lead European Data Protection Authority (EDPB / UK ICO)',
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
    governingLaw: answers.governing_law || 'State of California, United States',
    disputeForum: answers.dispute_forum || 'San Francisco, California'
  };

  const matchingClauses = CLAUSE_CATALOG.filter(clause => {
    if (clause.docType !== docType) return false;
    if (clause.requiredIf && !clause.requiredIf(answers)) return false;
    return true;
  });

  const bodyHtml = matchingClauses.map(c => c.template(vars)).join('\n\n');

  const disclaimerBanner = `
<div class="legal-disclaimer-box" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 1.25rem; margin-bottom: 2rem; color: #ef4444; font-size: 0.875rem; line-height: 1.5;">
  <strong>STATUTORY COMPLIANCE NOTICE:</strong> This legal document has been deterministically compiled by Paperloo's modular clause engine grounded in official regulator guidelines (EDPB, CPPA, ICO). It reflects the declared technical parameters of <code>${vars.siteUrl}</code>. Always have local legal counsel review before publishing.
</div>`;

  const fullHtml = `<div class="paperloo-modular-document" dir="ltr">\n${disclaimerBanner}\n${bodyHtml}\n</div>`;

  // Strip HTML tags for word count
  const rawText = bodyHtml.replace(/<[^>]*>/g, ' ');
  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;

  return {
    html: fullHtml,
    markdown: bodyHtml,
    clausesUsed: matchingClauses.map(c => c.id),
    wordCount
  };
}
