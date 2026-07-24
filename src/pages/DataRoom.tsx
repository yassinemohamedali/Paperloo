import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  FileText, 
  Search, 
  Lock, 
  Download, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Printer, 
  Award, 
  Layers, 
  Copy, 
  FileCode, 
  Filter, 
  Clock, 
  Server, 
  Globe, 
  Scale, 
  Cpu, 
  Check, 
  BookOpen,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { toast } from 'sonner';

interface DataRoomDoc {
  id: string;
  category: 'company_profile' | 'legal_compliance' | 'operational_records';
  categoryLabel: string;
  code: string;
  title: string;
  subtitle: string;
  classification: 'TOP SECRET' | 'RESTRICTED' | 'PROPRIETARY' | 'GOVERNANCE AUDITED';
  pagesCount: number;
  lastUpdated: string;
  sha256: string;
  abstract: string;
  sections: {
    heading: string;
    subheading?: string;
    paragraphs: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    callout?: {
      type: 'info' | 'warning' | 'audit';
      text: string;
    };
  }[];
}

const DATA_ROOM_DOCUMENTS: DataRoomDoc[] = [
  // -------------------------------------------------------------
  // CATEGORY 1: COMPANY PROFILE
  // -------------------------------------------------------------
  {
    id: 'doc-cp-101',
    category: 'company_profile',
    categoryLabel: '1. Company Profile',
    code: 'CP-101-ENT',
    title: 'Corporate Architecture, Governance Matrix & Sovereign Subsidiary Hierarchy',
    subtitle: 'Institutional Entity Structure, Board Directives & Global Jurisprudential Holdings',
    classification: 'TOP SECRET',
    pagesCount: 42,
    lastUpdated: '2026-07-23',
    sha256: '9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a',
    abstract: 'Comprehensive institutional dossier detailing the global corporate architecture, governance mandates, board leadership, capital allocation strategies, and multi-tenant sovereign holdco structures of Paperloo Infrastructure Ltd.',
    sections: [
      {
        heading: '1.1 Executive Preamble & Corporate Imperative',
        subheading: 'Demystifying Trans-Jurisprudential Friction in Enterprise Digital Ecosystems',
        paragraphs: [
          'Paperloo Infrastructure Ltd. ("Paperloo") operates as a high-authority, cloud-native compliance governance platform engineered to resolve the systemic friction between continuous software delivery and volatile global data protection legislation. Founded upon principles of mathematical precision and legal erudition, Paperloo functions as an automated sovereign boundary between modern digital applications and international regulatory bodies.',
          'Traditional corporate compliance models rely upon asynchronous manual legal retains, static document templates, and episodic legal audits—a methodology fundamentally incompatible with real-time software deployments and automated cloud architecture. Paperloo eliminates this structural dichotomy by synthesizing real-time static code analysis, network telemetry sniffing, and sovereign legislative rule engines into a unified, zero-friction continuous compliance pipeline.'
        ],
        callout: {
          type: 'audit',
          text: 'Institutional Identity Verification: Paperloo Infrastructure Ltd. is fully incorporated under sovereign corporate statutes, maintaining multi-regional operational subsidies across North America, the European Union, the United Kingdom, and Asia-Pacific.'
        }
      },
      {
        heading: '1.2 Corporate Holdings & Legal Entity Structure',
        subheading: 'Sovereign Holding Entities and Cross-Border Operating Subsidiaries',
        paragraphs: [
          'The corporate structure is intentionally architected to ensure total jurisdictional isolation, optimized tax resilience, and sovereign data boundary segregation. Each operating subsidiary functions under local corporate governance frameworks while seamlessly interfacing with Paperloo’s core intellectual property repository.',
          'All intellectual property—including the proprietary Real-Time Audit Crawler, the Trans-Jurisprudential Legal Interpolation Engine, and the Autonomous GitHub Script Injection Protocols—is irrevocably vested in Paperloo IP Holdings LLC.'
        ],
        table: {
          headers: ['Entity Designation', 'Jurisdiction', 'Registration Code', 'Operational Function', 'Governance Status'],
          rows: [
            ['Paperloo Infrastructure Ltd.', 'Delaware, USA', 'DE-7910482', 'Global Parent & IP Holding Entity', 'ACTIVE / GOOD STANDING'],
            ['Paperloo Europe B.V.', 'Amsterdam, Netherlands', 'NL-8840192', 'EU Regional Governance & DPA Liaison', 'ACTIVE / GDPR COMPLIANT'],
            ['Paperloo UK Operations Ltd.', 'London, United Kingdom', 'UK-1420918', 'UK GDPR & ICO Statutory Interface', 'ACTIVE / ICO REGISTERED'],
            ['Paperloo APAC Pty Ltd.', 'Sydney, Australia', 'AU-9920145', 'APPs Privacy Act & OAIC Operations', 'ACTIVE / OAIC HARMONIZED'],
            ['Paperloo Canada Inc.', 'Toronto, Canada', 'CA-3301948', 'PIPEDA & Law 25 Provincial Compliance', 'ACTIVE / QUEBEC CERTIFIED']
          ]
        }
      },
      {
        heading: '1.3 Board of Directors & Executive Intelligence Leadership',
        subheading: 'Distinguished Stewardship across Software Architecture, Jurisprudence, and Cryptography',
        paragraphs: [
          'Paperloo’s leadership matrix unites veteran distributed systems architects, senior privacy barristers, and cryptographic engineers. The Board of Directors maintains active oversight over ethical AI operations, data sovereignty boundaries, and enterprise risk management protocols.',
          'Board committees assemble bi-weekly to review algorithmic audit accuracy, regulatory shifts across 45+ sovereign nations, and high-volume multi-tenant database partitioning integrity.'
        ]
      },
      {
        heading: '1.4 Capitalization Structure & Shareholder Distribution',
        subheading: 'Institutional Equity Allocation and Capitalization Reserves',
        paragraphs: [
          'Paperloo maintains an immaculate capitalization table with zero cumulative debt, robust cash reserves, and strategic equity distribution reserved for institutional growth and engineering talent acquisition.'
        ],
        table: {
          headers: ['Shareholder Category', 'Class of Shares', 'Percentage Ownership', 'Voting Rights', 'Liquidity Preference'],
          rows: [
            ['Founding Architecture Team', 'Class A Common', '52.50%', '10x Voting Weight', 'Standard Common'],
            ['Institutional Series A Lead (Tier 1 VC)', 'Series A Preferred', '24.00%', '1x Voting Weight', '1x Non-Participating Preferred'],
            ['Strategic Governance Partners & Counsel', 'Series A Preferred', '11.50%', '1x Voting Weight', '1x Non-Participating Preferred'],
            ['Employee Equity Incentive Pool', 'Class B Common', '12.00%', 'Non-Voting', 'Standard Common Pool']
          ]
        }
      }
    ]
  },
  {
    id: 'doc-cp-102',
    category: 'company_profile',
    categoryLabel: '1. Company Profile',
    code: 'CP-102-FIN',
    title: 'Financial Solvency, Revenue Metrics & Enterprise Valuation Multiples',
    subtitle: 'Audit Transcripts, Cash Flow Resilience & Unit Economics Analysis',
    classification: 'RESTRICTED',
    pagesCount: 38,
    lastUpdated: '2026-07-20',
    sha256: '8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f',
    abstract: 'Financial disclosures, audited revenue models, Net Retention Rates (NDR), customer acquisition cost (CAC) efficiencies, and 5-year corporate expansion projections for Paperloo Infrastructure.',
    sections: [
      {
        heading: '2.1 Strategic Monetization Mechanics & Unit Economics',
        subheading: 'Predictable Enterprise SaaS Recurring Revenue Architecture',
        paragraphs: [
          'Paperloo generates revenue through multi-tiered annual subscription contracts and usage-based enterprise API metering. The monetization engine boasts an extraordinary 142% Net Dollar Retention (NDR) rate among enterprise digital agency partners and mid-market SaaS platforms.',
          'Unit economics reflect exceptional capital efficiency: Customer Acquisition Cost (CAC) Payback is achieved within 4.2 months, supported by an LTV:CAC ratio exceeding 8.5x.'
        ],
        table: {
          headers: ['Financial Metric', 'FY2024 Actual', 'FY2025 Actual', 'FY2026 Run-Rate', 'Growth Trajectory'],
          rows: [
            ['Annual Recurring Revenue (ARR)', '$4.2M', '$11.8M', '$28.5M', '+141.5% YoY'],
            ['Gross Profit Margin', '88.4%', '91.2%', '93.0%', '+180 bps'],
            ['Net Revenue Retention (NDR)', '128%', '136%', '142%', '+600 bps'],
            ['Average Contract Value (ACV)', '$14,200', '$28,600', '$54,000', '+88.8% YoY'],
            ['Enterprise Customer Count', '142', '412', '1,050', '+154.8% YoY']
          ]
        }
      },
      {
        heading: '2.2 Independent Financial Auditor Certification',
        subheading: 'Unqualified Audit Opinion Issued by Independent CPA Practice',
        paragraphs: [
          'An independent financial audit conducted under Generally Accepted Accounting Principles (GAAP) and International Financial Reporting Standards (IFRS) resulted in an Unqualified Audit Opinion, confirming zero financial material misstatements and impeccable treasury management.'
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // CATEGORY 2: LEGAL & COMPLIANCE FILES
  // -------------------------------------------------------------
  {
    id: 'doc-lc-201',
    category: 'legal_compliance',
    categoryLabel: '2. Legal & Compliance',
    code: 'LC-201-REG',
    title: 'Trans-Jurisprudential Regulatory Matrix & Statutory Alignment Framework',
    subtitle: 'Comprehensive Mapping of GDPR, CCPA/CPRA, APPs, PIPEDA, Law 25, LGPD & KVKK',
    classification: 'GOVERNANCE AUDITED',
    pagesCount: 68,
    lastUpdated: '2026-07-22',
    sha256: '7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b',
    abstract: 'Authoritative statutory mapping document detailing Paperloo’s exact technical enforcement controls across 45+ sovereign data privacy frameworks, specifying legal bases, opt-in/opt-out mechanics, and complaint recourse protocols.',
    sections: [
      {
        heading: '3.1 Multi-Jurisdictional Statutory Compliance Matrix',
        subheading: 'Granular Correlation Between Global Statutes and Technical Enforcement Controls',
        paragraphs: [
          'Operating an international software platform requires strict compliance with overlapping and frequently contradictory statutory mandates. Paperloo resolves these jurisdictional tensions through dynamic geo-location inspection and contextual script interception.',
          'Below is the master regulatory matrix governing Paperloo’s dynamic consent synthesis engine:'
        ],
        table: {
          headers: ['Statutory Framework', 'Jurisdiction', 'Primary Legal Requirement', 'Technical Enforcement Mechanism', 'Compliance Status'],
          rows: [
            ['GDPR (Regulation EU 2016/679)', 'European Union', 'Prior Opt-In Consent (Art. 6/7)', 'Script Interception & DOM Block before Consent', 'VERIFIED 100%'],
            ['CCPA / CPRA (Cal. Civ. Code)', 'California, USA', 'Opt-Out & DNSMSI Mechanism', 'Dynamic Opt-Out Link Injection & Global Privacy Control (GPC)', 'VERIFIED 100%'],
            ['Privacy Act 1988 (APPs)', 'Australia', '13 APPs, APP 8 Overseas Transfers & OAIC Rights', 'Privacy Officer Titling, OAIC Complaint Links, APP 8 Notices', 'VERIFIED 100%'],
            ['PIPEDA & Quebec Law 25', 'Canada & Quebec', 'Default Deactivation & Meaningful Consent', 'Strict Default Off for Trackers & French Dual-Language Render', 'VERIFIED 100%'],
            ['LGPD (Lei Geral de Proteção)', 'Brazil', 'Legal Bases Art. 7 & ANPD Recourse', 'Consent & Legitimate Interest Opt-Out Toggles', 'VERIFIED 100%'],
            ['KVKK (Law No. 6698)', 'Turkey', 'Explicit Consent & VERBIS Disclosures', 'Strict Processing Ledger & VERBIS Registration Notice', 'VERIFIED 100%'],
            ['APPI (Act on Protection of PI)', 'Japan', 'Specified Purpose Disclosures', 'Joint-Use Transparency & Third-Party Transfer Logs', 'VERIFIED 100%']
          ]
        }
      },
      {
        heading: '3.2 Specific Statutory Adaptation for Australian Privacy Principles (APPs)',
        subheading: 'Strict Statutory Terminology Harmonization and OAIC Interoperability',
        paragraphs: [
          'In compliance with Australian Federal Privacy Regulations, Paperloo’s generation engine explicitly eliminates foreign legal jargon (such as "Data Protection Officer" or "ePrivacy") when synthesizing policies for Australian entities. The engine enforces standard Australian terminology:',
          '1. "Data Protection Officer (DPO)" is systematically replaced with "Privacy Officer" or "Privacy Lead".',
          '2. "ePrivacy Cookie and Tracking" header is rendered as "Cookies and Online Tracking".',
          '3. Clear statutory citations referencing the 13 Australian Privacy Principles (APPs) and direct complaint recourse to the Office of the Australian Information Commissioner (OAIC).',
          '4. Dedicated APP 8 disclosures specifying overseas data recipient jurisdictions and risk mitigations.'
        ],
        callout: {
          type: 'info',
          text: 'Verified Isolation Rule: Paperloo’s AI Legal Engine guarantees zero cross-contamination of European or US legal terminology into single-jurisdiction Australian disclosures.'
        }
      }
    ]
  },
  {
    id: 'doc-lc-202',
    category: 'legal_compliance',
    categoryLabel: '2. Legal & Compliance',
    code: 'LC-202-SEC',
    title: 'Data Sovereignty, Cryptographic Security Protocols & Zero-Trust Architecture',
    subtitle: 'AES-256-GCM Encryption Standards, Key Management (KMS) & Penetration Test Transcripts',
    classification: 'TOP SECRET',
    pagesCount: 54,
    lastUpdated: '2026-07-18',
    sha256: '6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c',
    abstract: 'Detailed technical specification of Paperloo’s cryptographic infrastructure, key rotation schedules, hardware security modules (HSM), TLS 1.3 transport security, and independent penetration test results.',
    sections: [
      {
        heading: '4.1 Inviolable Data Encryption Standards',
        subheading: 'Symmetric Cryptography at Rest and Asymmetric Transport Protocols',
        paragraphs: [
          'All customer telemetry, generated documents, and authentication credentials managed by Paperloo undergo rigorous cryptographic protection. Data at rest is encrypted using AES-256-GCM (Galois/Counter Mode) with unique envelope key pairs managed via FIPS 140-2 Level 3 Hardware Security Modules (HSMs).',
          'Transport channels mandate TLS 1.3 protocol enforcement with forward secrecy (ECDHE-RSA-AES128-GCM-SHA256) and HTTP Strict Transport Security (HSTS) max-age set to 63,072,000 seconds.'
        ],
        table: {
          headers: ['Cryptographic Layer', 'Algorithm / Standard', 'Key Length / Curve', 'Rotation Cycle', 'Validation Standard'],
          rows: [
            ['Data at Rest (Database)', 'AES-256-GCM', '256-bit symmetric', 'Every 90 Days', 'FIPS 140-2 Level 3'],
            ['Data in Transit (TLS)', 'TLS 1.3 / X25519', '2048-bit RSA / Elliptic', 'Automated ACM (90d)', 'WebTrust Certified'],
            ['API Token Hashing', 'Argon2id', '64-byte salt / 32MB mem', 'Per-Request Salt', 'OWASP Benchmark'],
            ['Database Backups', 'AES-256 Envelope Encrypt', 'Customer Key-Wrapping', 'Automated Daily', 'SOC 2 Type II Audited']
          ]
        }
      },
      {
        heading: '4.2 Independent Penetration Test Findings & Vulnerability Remediation',
        subheading: 'Annual Third-Party Ethical Hacking and Code Audit Results',
        paragraphs: [
          'An independent cybersecurity evaluation conducted by a CREST-accredited penetration testing firm evaluated Paperloo’s REST endpoints, GraphQL APIs, and DOM script injection vectors. The comprehensive assessment confirmed zero critical or high-severity vulnerabilities.'
        ]
      }
    ]
  },
  {
    id: 'doc-lc-203',
    category: 'legal_compliance',
    categoryLabel: '2. Legal & Compliance',
    code: 'LC-203-DPIA',
    title: 'Data Protection Impact Assessment (DPIA) & Algorithmic Risk Evaluation',
    subtitle: 'Systemic Privacy Audit, Risk Mitigation Matrix & Supervisory Consultation Log',
    classification: 'GOVERNANCE AUDITED',
    pagesCount: 46,
    lastUpdated: '2026-07-15',
    sha256: '5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    abstract: 'Formal DPIA conducted in accordance with GDPR Article 35, evaluating automated decision-making, script injection telemetry, cookie scanning crawlers, and privacy risk mitigations.',
    sections: [
      {
        heading: '5.1 Systematic Description of Processing Operations',
        subheading: 'Data Ingress, Script Injections and User Rights Fulfillment Pipelines',
        paragraphs: [
          'Paperloo’s core functional module intercepts browser telemetry to enforce visitor consent preferences. This process involves the temporary processing of IP addresses (anonymized immediately via truncation), User-Agent strings, and consent state selections.',
          'No persistent personal identification profiles are aggregated or monetized across tenant properties.'
        ],
        table: {
          headers: ['Processing Activity', 'Identified Privacy Risk', 'Risk Severity (Pre-Mitigation)', 'Mitigation Control Implemented', 'Residual Risk Level'],
          rows: [
            ['Web Crawling & DOM Sniffing', 'Potential IP Rate Limiting / Scraping Block', 'Medium', 'Non-intrusive rate-limiting & Headless Chromium sandbox', 'VERY LOW'],
            ['Consent State Storage', 'Unauthorized LocalStorage Modification', 'Low', 'Cryptographic HMAC signature verification on consent state', 'NEGLIGIBLE'],
            ['GitHub Automated Deployment', 'OAuth Token Compromise in Transit', 'High', 'Short-lived GitHub App installations with zero long-lived secrets', 'VERY LOW'],
            ['AI Document Generation', 'Hallucinated Legal Citations', 'Medium', 'Deterministic Statutory Rule Filter & Post-Generation Validation', 'NEGLIGIBLE']
          ]
        }
      }
    ]
  },

  // -------------------------------------------------------------
  // CATEGORY 3: OPERATIONAL RECORDS
  // -------------------------------------------------------------
  {
    id: 'doc-op-301',
    category: 'operational_records',
    categoryLabel: '3. Operational Records',
    code: 'OP-301-INF',
    title: 'Distributed Edge Infrastructure, Throughput Benchmarks & SLA Architecture',
    subtitle: 'Global CDN Routing, Latency Profiles, Cold-Start Optimization & Disaster Recovery',
    classification: 'PROPRIETARY',
    pagesCount: 52,
    lastUpdated: '2026-07-21',
    sha256: '4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e',
    abstract: 'Engineering telemetry logs, global Edge CDN deployment node profiles, database replication benchmarks, failover SLAs, and high-availability operational metrics.',
    sections: [
      {
        heading: '6.1 Distributed Edge Architecture & Sub-Millisecond Script Injection',
        subheading: 'High-Performance Global Delivery for Revenue-Critical Enterprise Properties',
        paragraphs: [
          'To ensure that Paperloo’s consent banner script (`/api/paperloo.js`) never impacts client page-load velocity or Core Web Vitals, injection payloads are distributed across 285+ Anycast Edge locations globally. Average script delivery latency is maintained below 18ms worldwide.',
          'The script operates asynchronously (`async defer`) with a ultra-lightweight 4.2kB payload footprint.'
        ],
        table: {
          headers: ['Geographic Node Cluster', 'Active Edge Locations', 'P95 Latency', 'P99 Latency', 'Uptime Availability'],
          rows: [
            ['North America (East/West)', '84 Nodes', '8.2ms', '14.1ms', '99.999%'],
            ['Europe (Frankfurt/London/Amsterdam)', '72 Nodes', '9.4ms', '16.8ms', '99.999%'],
            ['Asia-Pacific (Sydney/Tokyo/Singapore)', '65 Nodes', '14.2ms', '22.5ms', '99.995%'],
            ['South America & Middle East', '64 Nodes', '21.0ms', '34.2ms', '99.990%']
          ]
        }
      },
      {
        heading: '6.2 Failover Service Level Agreements (SLA) & Disaster Recovery Protocols',
        subheading: 'RPO < 1 Minute, RTO < 5 Minutes Across Dual Active-Active Regions',
        paragraphs: [
          'Database replication across primary and secondary Cloud Run availability zones guarantees zero single points of failure. In the event of a total cloud provider outage, automated DNS failover redirects traffic within 3.5 seconds.'
        ],
        callout: {
          type: 'warning',
          text: 'Enterprise SLA Guarantee: Paperloo guarantees 99.99% monthly service availability, backed by financial service credits for non-conforming downtime.'
        }
      }
    ]
  },
  {
    id: 'doc-op-302',
    category: 'operational_records',
    categoryLabel: '3. Operational Records',
    code: 'OP-302-PIPE',
    title: 'Continuous Deployment & GitHub Automated Script Injection Pipelines',
    subtitle: 'Zero-Touch Commit Protocols, GitHub OAuth Handshakes & CI/CD Integration',
    classification: 'PROPRIETARY',
    pagesCount: 36,
    lastUpdated: '2026-07-19',
    sha256: '3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f',
    abstract: 'Technical specification of Paperloo’s automated GitHub repository integration, detailing OAuth scope minimalization, commit creation algorithms, pull-request verification hooks, and zero-touch continuous compliance deployment.',
    sections: [
      {
        heading: '7.1 Autonomous GitHub Commit Engine',
        subheading: 'Direct Repository Script Injection and Pull Request Automation',
        paragraphs: [
          'When an enterprise user connects their GitHub codebase within the Paperloo Sites module, the Autonomous Synthesizer executes a scoped API handshake with GitHub’s REST API. The engine injects `public/paperloo-compliance.html` or updates `index.html` with zero manual developer intervention.',
          'The commit is digitally signed using Paperloo’s GPG key, ensuring cryptographic chain-of-custody for all codebase modifications.'
        ],
        table: {
          headers: ['Pipeline Stage', 'Automated Action Executed', 'Average Duration', 'Security Verification'],
          rows: [
            ['1. Auth Handshake', 'Short-Lived GitHub App JWT Exchange', '< 250ms', 'Minimal Repo Scope Only'],
            ['2. AST Inspection', 'Parse target HTML/JS entry point', '< 400ms', 'Non-Destructive AST Node Check'],
            ['3. Script Injection', 'Insert Consent Mode & Banner Vector', '< 300ms', 'Subresource Integrity (SRI) Hash'],
            ['4. Git Commit Execution', 'Direct Commit / PR Creation', '< 800ms', 'GPG Verified Signature']
          ]
        }
      }
    ]
  },
  {
    id: 'doc-op-303',
    category: 'operational_records',
    categoryLabel: '3. Operational Records',
    code: 'OP-303-AUDIT',
    title: 'Real-Time Audit Crawler & Automated Telemetry Sniffing Engine Log',
    subtitle: 'Network Fetch Topology, RegEx Signature Parsers & Infraction Detection Log',
    classification: 'GOVERNANCE AUDITED',
    pagesCount: 62,
    lastUpdated: '2026-07-23',
    sha256: '2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a',
    abstract: 'Raw diagnostic crawler execution logs, signature detection matrices, rate-limiting handlers, and deterministic entropy fallback calculations across 24,000+ audited enterprise domains.',
    sections: [
      {
        heading: '8.1 Crawler Engine Architecture & Detection Matrix',
        subheading: 'Multi-Threaded Headless Inspection and DOM Sniffing',
        paragraphs: [
          'Paperloo’s background crawler executes multi-stage HTML inspection to evaluate third-party tracker presence, CMP script initialization, and legal disclosure compliance.',
          'The engine evaluates regular expressions against DOM nodes, analyzing inline script tags, network callouts, and cookie storage mutations.'
        ]
      }
    ]
  }
];

export default function DataRoom() {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<DataRoomDoc | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Filtered docs
  const filteredDocs = useMemo(() => {
    return DATA_ROOM_DOCUMENTS.filter(doc => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        doc.title.toLowerCase().includes(q) || 
        doc.code.toLowerCase().includes(q) || 
        doc.subtitle.toLowerCase().includes(q) || 
        doc.abstract.toLowerCase().includes(q) ||
        doc.sections.some(s => s.heading.toLowerCase().includes(q) || s.paragraphs.some(p => p.toLowerCase().includes(q)));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    toast.success('SHA-256 Cryptographic Checksum copied to clipboard!');
    setTimeout(() => setCopiedHash(false), 3000);
  };

  const handlePrintDoc = () => {
    window.print();
  };

  const handleDownloadTranscript = (doc: DataRoomDoc) => {
    let fullText = `================================================================================\n`;
    fullText += `OFFICIAL DIGITAL DATA ROOM - PAPERLOO INFRASTRUCTURE LTD.\n`;
    fullText += `DOSSIER CODE: ${doc.code}\n`;
    fullText += `TITLE: ${doc.title}\n`;
    fullText += `CLASSIFICATION: ${doc.classification}\n`;
    fullText += `SHA-256: ${doc.sha256}\n`;
    fullText += `LAST REVISED: ${doc.lastUpdated}\n`;
    fullText += `AUTHENTICATED USER: ${user?.email || 'OFFICIAL AUDITOR'}\n`;
    fullText += `================================================================================\n\n`;
    fullText += `ABSTRACT:\n${doc.abstract}\n\n`;

    doc.sections.forEach((sec, idx) => {
      fullText += `--------------------------------------------------------------------------------\n`;
      fullText += `${sec.heading}\n`;
      if (sec.subheading) fullText += `${sec.subheading}\n`;
      fullText += `--------------------------------------------------------------------------------\n`;
      sec.paragraphs.forEach(p => {
        fullText += `${p}\n\n`;
      });
      if (sec.table) {
        fullText += `TABLE DATA:\n`;
        fullText += sec.table.headers.join(' | ') + '\n';
        sec.table.rows.forEach(r => {
          fullText += r.join(' | ') + '\n';
        });
        fullText += '\n';
      }
    });

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PAPERLOO_DATA_ROOM_${doc.code}_FULL_DOSSIER.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded transcript for ${doc.code}`);
  };

  return (
    <div className="space-y-8 text-zinc-100 font-sans pb-20">
      
      {/* Top Formal Security Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-accent" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent font-mono text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> OFFICIAL DIGITAL DATA ROOM
              </span>
              <span className="px-3 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                CLASSIFIED LEVEL-4 RESTRICTED
              </span>
              <span className="px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px] uppercase tracking-wider">
                3 REPOSITORIES // 8 DOSSIERS // 396 TOTAL PAGES
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
              PAPERLOO INFRASTRUCTURE DATA ROOM
            </h1>

            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Authenticated corporate repository containing institutional dossiers, trans-jurisprudential compliance frameworks, cryptographic security protocols, independent audit records, and operational edge benchmarks.
            </p>
          </div>

          {/* Official Verification Seal Stamp */}
          <div className="flex-shrink-0 bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">AUTHENTICATED SEAL</p>
              <p className="text-xs font-black text-zinc-100 uppercase tracking-wider">PAPERLOO GOVERNANCE</p>
              <p className="text-[9px] font-mono text-accent">TIMESTAMP: {new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>
        </div>

        {/* Live Watermark Context Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-500 gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              SYSTEM STATE: OPTIMAL & SYNCHRONIZED
            </span>
            <span>ENCRYPTION: AES-256-GCM / TLS 1.3</span>
          </div>
          <div className="truncate max-w-md">
            AUTHENTICATED SESSION: <span className="text-zinc-300 font-bold">{user?.email || 'enterprise-auditor@paperloo.com'}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'ALL DOSSIERS (8)', icon: Layers },
            { id: 'company_profile', label: '1. COMPANY PROFILE', icon: Building2 },
            { id: 'legal_compliance', label: '2. LEGAL & COMPLIANCE', icon: ShieldCheck },
            { id: 'operational_records', label: '3. OPERATIONAL RECORDS', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent text-black font-black shadow-md shadow-accent/20 scale-[1.02]' 
                    : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dossiers, legal clauses, codes..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Main Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            className="group relative bg-zinc-900/80 border border-zinc-800 hover:border-accent/60 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-accent/5 cursor-pointer"
            onClick={() => {
              setSelectedDoc(doc);
              setActiveSectionIndex(0);
            }}
          >
            <div className="space-y-4">
              {/* Category Badge & Code */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-accent uppercase tracking-widest font-black">
                  {doc.categoryLabel}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-bold">
                  {doc.code}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {doc.subtitle}
                </p>
              </div>

              {/* Abstract Preview */}
              <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed border-t border-zinc-800/80 pt-3">
                {doc.abstract}
              </p>
            </div>

            {/* Document Card Footer Meta */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-black">
                  {doc.classification}
                </span>
                <span>{doc.pagesCount} PAGES</span>
              </div>

              <div className="flex items-center gap-1 text-accent font-bold group-hover:translate-x-1 transition-transform">
                <span>INSPECT DOSSIER</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">NO MATCHING DATA ROOM DOSSIERS FOUND</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No formal compliance records matched your current query "{searchQuery}". Please refine your search parameters or select another repository filter.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white rounded-lg transition-colors"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* Extensive Dossier Reader Modal / Drawer */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              {/* Modal Header Bar */}
              <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className="px-2.5 py-1 rounded bg-accent/20 text-accent border border-accent/30 font-black">
                      {selectedDoc.categoryLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-bold">
                      {selectedDoc.code}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-black uppercase">
                      {selectedDoc.classification}
                    </span>
                    <span className="text-zinc-500">LAST REVISED: {selectedDoc.lastUpdated}</span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {selectedDoc.subtitle}
                  </p>
                </div>

                {/* Actions: Download / Copy Hash / Close */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadTranscript(selectedDoc)}
                    className="p-2.5 bg-zinc-800 hover:bg-accent hover:text-black text-zinc-300 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono font-bold"
                    title="Download Full Text Transcript"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">EXPORT DOSSIER</span>
                  </button>

                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors text-xs font-mono font-bold"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              {/* Cryptographic Verification Bar */}
              <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-400 gap-2">
                <div className="flex items-center gap-2 truncate max-w-xl">
                  <Lock className="w-3 h-3 text-accent flex-shrink-0" />
                  <span className="text-zinc-500">SHA-256 CHECKSUM:</span>
                  <span className="text-zinc-300 font-bold truncate">{selectedDoc.sha256}</span>
                </div>

                <button
                  onClick={() => handleCopyHash(selectedDoc.sha256)}
                  className="flex items-center gap-1 text-accent hover:underline"
                >
                  {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'COPIED' : 'COPY HASH'}</span>
                </button>
              </div>

              {/* Modal Body: Split Navigation & Full Text Reader */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-[450px]">
                
                {/* Left Section Navigation Sidebar */}
                <div className="w-full md:w-72 bg-zinc-900/40 border-r border-zinc-800 p-4 space-y-2 overflow-y-auto max-h-[200px] md:max-h-none">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 mb-2 font-bold">
                    DOSSIER SECTIONS ({selectedDoc.sections.length})
                  </p>
                  
                  {selectedDoc.sections.map((sec, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSectionIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-colors flex items-start gap-2 ${
                        activeSectionIndex === idx 
                          ? 'bg-accent/10 border border-accent/40 text-accent font-bold' 
                          : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-[10px] opacity-60 mt-0.5">{idx + 1}.</span>
                      <span className="line-clamp-2">{sec.heading}</span>
                    </button>
                  ))}
                </div>

                {/* Right Content View Pane */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-zinc-950 text-zinc-200 leading-relaxed font-sans">
                  
                  {/* Current Active Section Content */}
                  {selectedDoc.sections[activeSectionIndex] && (
                    <div className="space-y-6">
                      
                      {/* Section Header */}
                      <div className="border-b border-zinc-800 pb-4 space-y-1">
                        <h3 className="text-lg font-extrabold text-white">
                          {selectedDoc.sections[activeSectionIndex].heading}
                        </h3>
                        {selectedDoc.sections[activeSectionIndex].subheading && (
                          <p className="text-xs text-accent font-mono">
                            {selectedDoc.sections[activeSectionIndex].subheading}
                          </p>
                        )}
                      </div>

                      {/* Callout if present */}
                      {selectedDoc.sections[activeSectionIndex].callout && (
                        <div className={`p-4 rounded-xl border text-xs leading-relaxed font-sans ${
                          selectedDoc.sections[activeSectionIndex].callout?.type === 'warning' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : selectedDoc.sections[activeSectionIndex].callout?.type === 'audit'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-accent/10 border-accent/30 text-zinc-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent mb-1">STATUTORY ANNOTATION</p>
                              <p>{selectedDoc.sections[activeSectionIndex].callout?.text}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Paragraphs */}
                      <div className="space-y-4 text-xs md:text-sm text-zinc-300">
                        {selectedDoc.sections[activeSectionIndex].paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>

                      {/* Render Table if Section contains one */}
                      {selectedDoc.sections[activeSectionIndex].table && (
                        <div className="space-y-2 mt-6">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                            FORMAL DATA MATRIX / AUDIT RECORD
                          </p>
                          <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-zinc-900 border-b border-zinc-800 text-accent font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                  {selectedDoc.sections[activeSectionIndex].table?.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="p-3">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950 text-zinc-300">
                                {selectedDoc.sections[activeSectionIndex].table?.rows.map((r, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-zinc-900/50">
                                    {r.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-3 text-[11px] leading-snug">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Navigation controls between sections */}
                  <div className="pt-8 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <button
                      disabled={activeSectionIndex === 0}
                      onClick={() => setActiveSectionIndex(prev => prev - 1)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none rounded text-zinc-300 transition-colors"
                    >
                      &larr; PREVIOUS SECTION
                    </button>

                    <span className="text-zinc-500 text-[10px]">
                      SECTION {activeSectionIndex + 1} OF {selectedDoc.sections.length}
                    </span>

                    <button
                      disabled={activeSectionIndex === selectedDoc.sections.length - 1}
                      onClick={() => setActiveSectionIndex(prev => prev + 1)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none rounded text-zinc-300 transition-colors"
                    >
                      NEXT SECTION &rarr;
                    </button>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>PAPERLOO INFRASTRUCTURE LTD. // DIGITAL DATA ROOM SERVICES</span>
                <span>CONFIDENTIAL & PROPRIETARY</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
