
/**
 * PAPERLOO LEGAL ENGINE V2
 * Clause-Based Infrastructure & Compliance Matrix
 */

export enum Jurisdiction {
  GDPR = 'GDPR',
  CCPA = 'CCPA_CPRA',
  PIPEDA = 'PIPEDA',
  VCDPA = 'VCDPA',
  GLOBAL = 'GLOBAL_BASELINE',
  PDPA_TH = 'PDPA_TH',
  PDPA_TR = 'PDPA_TR',
  POPIA_ZA = 'POPIA_ZA',
  PRIVACY_ACT_AU = 'PRIVACY_ACT_AU',
  APPI_JP = 'APPI_JP',
  PDPB_IN = 'PDPB_IN',
  KVKK_TR = 'KVKK_TR',
  PDPL_SA = 'PDPL_SA',
  LAW_25_QC = 'LAW_25_QC'
}

export enum Industry {
  SAAS = 'SAAS',
  ECOMMERCE = 'ECOMMERCE',
  FINTECH = 'FINTECH',
  HEALTHCARE = 'HEALTHCARE',
  AGENCY = 'AGENCY'
}

export type ClauseType = 'INTRODUCTION' | 'DATA_COLLECTION' | 'USE_PURPOSE' | 'RIGHTS' | 'COOKIES' | 'RETENTION' | 'SECURITY' | 'CONTACT';

export interface Clause {
  id: string;
  type: ClauseType;
  jurisdictions: Jurisdiction[];
  industries: Industry[];
  content: string;
  priority: number;
}

// SIMULATED CLAUSE LIBRARY (EXPANDABLE TO 2,500+)
const CLAUSE_LIBRARY: Clause[] = [
  {
    id: 'intro-global',
    type: 'INTRODUCTION',
    jurisdictions: [Jurisdiction.GLOBAL],
    industries: [Industry.SAAS, Industry.ECOMMERCE, Industry.AGENCY],
    content: "This Privacy Policy describes how Paperloo Infrastructure ('we', 'us', or 'our') collects, uses, and shares your personal information.",
    priority: 1
  },
  {
    id: 'data-gdpr',
    type: 'DATA_COLLECTION',
    jurisdictions: [Jurisdiction.GDPR],
    industries: [Industry.SAAS],
    content: "Under GDPR, we process data based on legitimate interest and contractual necessity. We collect identifiers such as IP addresses and email addresses.",
    priority: 2
  },
  {
    id: 'rights-ccpa',
    type: 'RIGHTS',
    jurisdictions: [Jurisdiction.CCPA],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "California residents have the right to opt-out of the 'sale' or 'sharing' of their personal information. We do not sell data for monetary compensation.",
    priority: 3
  },
  {
    id: 'data-pdpa-th',
    type: 'DATA_COLLECTION',
    jurisdictions: [Jurisdiction.PDPA_TH],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "Under Thailand's Personal Data Protection Act (PDPA), we require explicit, written or electronic consent before processing your personal data, and we collect only identifiers strictly necessary for performance.",
    priority: 2
  },
  {
    id: 'data-pdpa-tr',
    type: 'DATA_COLLECTION',
    jurisdictions: [Jurisdiction.PDPA_TR],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "According to Turkey's Personal Data Protection regulations, we process data only with explicit consent or under clear legal exceptions defined under Turkish Law No. 6698.",
    priority: 2
  },
  {
    id: 'data-popia-za',
    type: 'RIGHTS',
    jurisdictions: [Jurisdiction.POPIA_ZA],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "South African residents possess rights under the Protection of Personal Information Act (POPIA) to request access to and correction of personal information, and to object to data processing for direct marketing.",
    priority: 2
  },
  {
    id: 'data-privacy-act-au',
    type: 'DATA_COLLECTION',
    jurisdictions: [Jurisdiction.PRIVACY_ACT_AU],
    industries: [Industry.SAAS],
    content: "In accordance with the Australian Privacy Principles (APPs) under the Privacy Act, we take reasonable steps to ensure transparent collection of personal data and notify individuals at or before the point of collection.",
    priority: 2
  },
  {
    id: 'data-appi-jp',
    type: 'RIGHTS',
    jurisdictions: [Jurisdiction.APPI_JP],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "Under Japan's Act on the Protection of Personal Information (APPI), individuals have the right to request disclosure, correction, or stoppage of utilization of their personal data, which we manage with strict technical controls.",
    priority: 2
  },
  {
    id: 'data-pdpb-in',
    type: 'DATA_COLLECTION',
    jurisdictions: [Jurisdiction.PDPB_IN],
    industries: [Industry.SAAS, Industry.ECOMMERCE, Industry.FINTECH],
    content: "Under India's Digital Personal Data Protection Act (DPDP/PDPB), processed personal data must be kept accurate and secure, with clear notices of processing available in standard scheduled languages upon request.",
    priority: 2
  },
  {
    id: 'data-kvkk-tr',
    type: 'DATA_COLLECTION',
    jurisdictions: [Jurisdiction.KVKK_TR],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "In compliance with Turkey's Law on Personal Data Protection (KVKK No. 6698), we implement strict data processing agreements and VERBIS registry standards for managing and preserving data integrity.",
    priority: 2
  },
  {
    id: 'data-pdpl-sa',
    type: 'SECURITY',
    jurisdictions: [Jurisdiction.PDPL_SA],
    industries: [Industry.SAAS, Industry.ECOMMERCE],
    content: "Under Saudi Arabia's Personal Data Protection Law (PDPL), we ensure all local data storage and international data transfers comply with the absolute security rules defined by the Saudi Data & AI Authority (SDAIA).",
    priority: 2
  },
  {
    id: 'data-law25-qc',
    type: 'RIGHTS',
    jurisdictions: [Jurisdiction.LAW_25_QC],
    industries: [Industry.SAAS],
    content: "Under Quebec's Law 25, visual or audio recording and web tracking are deactivated by default. We conduct strict privacy impact assessments for all high-risk data processing activities.",
    priority: 2
  },
  {
    id: 'fintech-security',
    type: 'SECURITY',
    jurisdictions: [Jurisdiction.GLOBAL],
    industries: [Industry.FINTECH],
    content: "Our fintech infrastructure employs bank-grade AES-256 encryption and multi-sig authorization for all sensitive transaction data.",
    priority: 2
  }
];

export interface PolicyConfig {
  industries: Industry[];
  jurisdictions: Jurisdiction[];
  customBranding?: {
    companyName: string;
    contactEmail: string;
  };
}

export class LegalEngine {
  /**
   * Generates a unique policy by aggregating clauses based on industry and region
   */
  static generatePolicy(config: PolicyConfig): string {
    const activeClauses = CLAUSE_LIBRARY.filter(clause => 
      clause.jurisdictions.some(j => config.jurisdictions.includes(j) || j === Jurisdiction.GLOBAL) &&
      clause.industries.some(i => config.industries.includes(i))
    ).sort((a, b) => {
      // Sort by type order then priority
      const typeOrder: Record<ClauseType, number> = {
        INTRODUCTION: 0,
        DATA_COLLECTION: 1,
        USE_PURPOSE: 2,
        COOKIES: 3,
        SECURITY: 4,
        RETENTION: 5,
        RIGHTS: 6,
        CONTACT: 7
      };
      return typeOrder[a.type] - typeOrder[b.type] || a.priority - b.priority;
    });

    let policy = activeClauses.map(c => c.content).join('\n\n');

    // Replace placeholders if branding exists
    if (config.customBranding) {
      policy = policy.replace(/Paperloo Infrastructure/g, config.customBranding.companyName);
    }

    return policy;
  }

  /**
   * Compliance Matrix lookup
   * Maps features to their regulatory status
   */
  static getComplianceStatus(jurisdiction: Jurisdiction) {
    const matrix: Record<Jurisdiction, any> = {
      [Jurisdiction.GDPR]: { status: 'STRICT', requirements: ['DPA', 'ROPA', 'DPO_REQUIRED'] },
      [Jurisdiction.CCPA]: { status: 'MODERATE', requirements: ['DNSMPI', 'OPT_OUT'] },
      [Jurisdiction.PIPEDA]: { status: 'MODERATE', requirements: ['TRANS-BORDER_RULES'] },
      [Jurisdiction.VCDPA]: { status: 'EMERGING', requirements: ['DATA_SENSITIVITY_CHECK'] },
      [Jurisdiction.GLOBAL]: { status: 'BASELINE', requirements: ['TRANSPARENCY'] },
      [Jurisdiction.PDPA_TH]: { status: 'STRICT', requirements: ['CONSENT_RECORD', 'DPO_REQUIRED', 'RIGHT_TO_ERASURE'] },
      [Jurisdiction.PDPA_TR]: { status: 'STRICT', requirements: ['KVKK_REGISTRY', 'COMPLIANCE_OFFICER'] },
      [Jurisdiction.POPIA_ZA]: { status: 'STRICT', requirements: ['INFORMATION_OFFICER', 'REGULATOR_REGISTRATION'] },
      [Jurisdiction.PRIVACY_ACT_AU]: { status: 'MODERATE', requirements: ['NOTIFIABLE_BREACHES', 'CRF_PRINCIPLES'] },
      [Jurisdiction.APPI_JP]: { status: 'STRICT', requirements: ['APD_REGISTRY', 'CROSS_BORDER_RESTRICTIONS'] },
      [Jurisdiction.PDPB_IN]: { status: 'STRICT', requirements: ['DATA_FIDUCIARY_DUTIES', 'CONSENT_MANAGER', 'LOCALIZATION'] },
      [Jurisdiction.KVKK_TR]: { status: 'STRICT', requirements: ['VERBIS_REGISTRATION', 'EXPLICIT_CONSENT'] },
      [Jurisdiction.PDPL_SA]: { status: 'STRICT', requirements: ['LOCAL_REGULATOR_REGISTRATION', 'CONSENT_LOGS'] },
      [Jurisdiction.LAW_25_QC]: { status: 'STRICT', requirements: ['PRIVACY_BY_DEFAULT', 'MANDATORY_IMPACT_ASSESSMENT'] }
    };
    return matrix[jurisdiction];
  }
}
