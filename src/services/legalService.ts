
/**
 * PAPERLOO LEGAL ENGINE V2
 * Clause-Based Infrastructure & Compliance Matrix
 */

export enum Jurisdiction {
  GDPR = 'GDPR',
  CCPA = 'CCPA_CPRA',
  PIPEDA = 'PIPEDA',
  VCDPA = 'VCDPA',
  GLOBAL = 'GLOBAL_BASELINE'
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
      [Jurisdiction.GLOBAL]: { status: 'BASELINE', requirements: ['TRANSPARENCY'] }
    };
    return matrix[jurisdiction];
  }
}
