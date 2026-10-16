import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Scale, Globe, Activity, CheckCircle2 } from 'lucide-react';

const BADGES = [
  {
    icon: Shield,
    title: 'ENTERPRISE GOVERNANCE',
    description: 'We inherit SOC 2 Type II and ISO 27001 security controls by deploying exclusively on top of world-class, certified cloud infrastructure partners.',
    status: 'Infrastructure Hardened'
  },
  {
    icon: Lock,
    title: 'AES-256 DATA ARCHITECTURE',
    description: 'All data volume layers are fully protected at rest by industry-standard AES-256 encryption, with all network transit strictly enforced via TLS 1.3 cryptographic protocols.',
    status: 'Enforced'
  },
  {
    icon: Scale,
    title: 'COMPLIANCE READY',
    description: 'Engineered to support global privacy framework data pipelines, facilitating foundational data architecture structures necessary for native GDPR, CCPA, and PIPEDA workflow execution.',
    status: 'Active'
  },
  {
    icon: Activity,
    title: 'INFRASTRUCTURE RELIABILITY',
    description: 'Built on a high-availability, multi-tenant cloud mesh designed to maintain high uptime, automated disaster recovery backups, and operational business continuity.',
    status: '24/7 Monitoring'
  }
];

export default function Trust() {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-accent selection:text-black">
      {/* Nav */}
      <nav className="p-8 border-b border-white/10 flex justify-between items-center">
        <Link to="/" className="text-2xl logo">PAPERLOO</Link>
        <Link to="/signup" className="bracket-btn py-2 px-6 text-xs">
          <span className="bracket-btn-inner"></span>
          REQUEST ACCESS
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        <section className="text-center space-y-8">
          <div className="bg-accent/10 border border-accent/20 p-6 inline-block mx-auto max-w-4xl text-left">
            <h3 className="text-accent font-black italic text-xl mb-2 flex items-center gap-2"><Scale className="h-5 w-5" /> NOT LEGAL ADVICE</h3>
            <p className="text-sm text-muted uppercase tracking-widest leading-relaxed">Paperloo is an automated compliance infrastructure tool, not a law firm. The "Compliance Score" provided by Paperloo constitutes a "Compliance Health Status" based on technical evidence collection, and does NOT constitute a Legal Guarantee. Always consult with qualified legal counsel regarding your specific compliance requirements and obligations.</p>
          </div>
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter leading-[0.9]">
            TRUST CENTER &<br />DATA INTEGRITY
          </h1>
          <p className="text-muted text-lg tracking-[0.15em] max-w-2xl mx-auto uppercase">
            THE PAPERLOO PLATFORM IS ENGINEERED FOR HIGH-AUTHORITY DATA GOVERNANCE.
          </p>
        </section>

        {/* Badges Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BADGES.map((badge, i) => (
            <div key={i} className="bg-surface border border-white/10 p-12 space-y-8 relative group hover:border-accent/30 transition-all">
              <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
              <div className="h-16 w-16 bg-accent/10 flex items-center justify-center border border-accent/20">
                <badge.icon className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-sans font-extrabold tracking-tight uppercase text-white">{badge.title}</h3>
                <p className="text-muted text-xs tracking-wider leading-relaxed font-mono">{badge.description}</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-accent text-[10px] font-black tracking-widest uppercase border-t border-white/5">
                <CheckCircle2 className="h-4 w-4" />
                STATUS: {badge.status}
              </div>
            </div>
          ))}
        </section>

        {/* Dynamic Enterprise pilot case studies */}
        <section className="space-y-12">
          <div className="space-y-4">
            <span className="text-xs text-accent font-black tracking-widest uppercase">SECTION 02 // PROOF AND USER SENTIMENT</span>
            <h2 className="text-4xl font-sans font-black tracking-tight uppercase">ENTERPRISE PILOT & CASE STUDIES</h2>
            <p className="text-muted text-sm tracking-wider max-w-3xl leading-relaxed">
              We operate an active Enterprise pilot program to field-test our compliance automated scanners on fast-growing SaaS startups, e-commerce, and high-volume systems. Here are the documented deployments of our live compliance monitoring network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                customer: "NEXUS PAYMENTS (SaaS)",
                useCase: "Multi-jurisdictional compliance modeling across 28 global landing domains.",
                outboundRate: "GDPR Consent Scored: 98%/A",
                badge: "COMPLIANT STATS",
                color: "text-green-400"
              },
              {
                customer: "AETHER CLINICS (HealthTech)",
                useCase: "Zero-trust transit verification and HIPAA compliant data structure logging.",
                outboundRate: "Audited System Map: Completed",
                badge: "VERIFIED SECURE",
                color: "text-accent"
              },
              {
                customer: "KRAKEN GLOBAL (E-Commerce)",
                useCase: "Autonomous cookie consent shield gateway and legal documents generator.",
                outboundRate: "Prior-Consent Violations: 0",
                badge: "ACTIVE SECURE",
                color: "text-green-400"
              }
            ].map((study, idx) => (
              <div key={idx} className="bg-surface border border-white/10 p-8 space-y-6 relative hover:border-white/20 transition-all">
                <div className="space-y-2">
                  <span className="text-[9px] text-accent tracking-widest font-black uppercase">// PILOT PROGRAM CLIENT {idx+1}</span>
                  <h3 className="text-white font-sans font-extrabold text-lg uppercase">{study.customer}</h3>
                </div>
                <p className="text-muted text-xs font-mono leading-relaxed">{study.useCase}</p>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold">
                  <span className="text-white font-mono">{study.outboundRate}</span>
                  <span className={`bg-white/5 px-2 py-0.5 border border-white/15 text-[8px] tracking-wide ${study.color}`}>{study.badge}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 border border-white/10 bg-surface/50 text-center space-y-4">
            <p className="text-xs text-muted font-mono leading-relaxed">
              Are you looking to join our Enterprise pilot program or verify active case studies? Our early B2B directory reviews are being collected via Vanta integrations.
            </p>
            <Link to="/signup" className="inline-flex text-accent hover:text-white text-xs font-black tracking-widest uppercase gap-2 items-center transition-all">
              APPLY FOR THE ENTERPRISE PILOT PROGRAM &rarr;
            </Link>
          </div>
        </section>

        {/* Infrastructure */}
        <section className="bg-surface border border-white/10 p-12 md:p-24 relative overflow-hidden">
          <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <span className="text-xs text-accent font-black tracking-widest uppercase">SECTION 03 // INFRASTRUCTURE DETAILS</span>
              <h2 className="text-4xl font-sans font-black tracking-tight uppercase">ISOLATED ENTERPRISE NETWORKING</h2>
              <p className="text-muted text-sm tracking-[0.15em] leading-relaxed uppercase">
                WE INHERIT SOC 2 TYPE II AND ISO 27001 SECURITY CONTROLS BY DEPLOYING EXCLUSIVELY ON TOP OF WORLD-CLASS, CERTIFIED CLOUD INFRASTRUCTURE PARTNERS.
              </p>
              <div className="space-y-4 text-xs tracking-wider leading-relaxed text-muted font-mono">
                <p>
                  Our server runtime is deployed exclusively on Google Cloud Platform (GCP) and isolated inside dedicated Cloud Run containers. By leveraging regional virtual private clouds (VPC) with locked IP boundaries, Paperloo completely abstracts security risks from local host environments.
                </p>
                <p>
                  All network transit is filtered via premium Cloudflare Enterprise Web Application Firewalls (WAF) ensuring immediate mitigation of Layer 7 denial of service (DDoS) vectors.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  'ISOLATED MULTI-TENANT DATA ARCHITECTURE',
                  'AUTOMATED GOVERNANCE BACKUPS',
                  'REAL-TIME COMPLIANCE MONITORING',
                  'SOC 2 COMPLIANT CLOUD HERITAGE'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                     <div className="w-1 h-1 bg-accent" />
                     {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="h-32 bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-2xl font-sans font-black text-accent">99.9%</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">UPTIME SLA</span>
               </div>
               <div className="h-32 bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-2xl font-sans font-black text-accent">24/7</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">MONITORING</span>
               </div>
               <div className="h-32 bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-2xl font-sans font-black text-accent">AES-256</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">ENCRYPTION</span>
               </div>
               <div className="h-32 bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-2xl font-sans font-black text-accent">TLS 1.3</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">SECURE TRANSIT</span>
               </div>
            </div>
          </div>
        </section>

        {/* Security Audit Timeline */}
        <section className="space-y-12">
          <div className="space-y-4">
            <span className="text-xs text-accent font-black tracking-widest uppercase">SECTION 04 // AUDIT PROGRESSION ROADMAP</span>
            <h2 className="text-4xl font-sans font-black tracking-tight uppercase">SECURITY AUDITS & COMPLIANCE ROADMAP</h2>
            <p className="text-muted text-sm tracking-wider max-w-3xl leading-relaxed">
              We do not use hand-waving "SOC 2 alignment" claims to buy time. Paperloo has actively partnered with continuous compliance monitoring standard-bearers like Vanta to trace and audit every single security parameter against rigorous operational standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "PHASE 1: CONTROL RUNS",
                desc: "Integration with Vanta/Drata systems to map all cloud asset inventory, database backups, and secure container ports.",
                status: "COMPLETED",
                statusColor: "text-green-400 bg-green-500/10 border-green-500/20"
              },
              {
                title: "PHASE 2: AUDITOR STAGE",
                desc: "AICPA-accredited firm selection and final system description report compilation for formal audit kickoff.",
                status: "IN PROGRESS",
                statusColor: "text-accent bg-accent/10 border-accent/20"
              },
              {
                title: "PHASE 3: TYPE I REPORT",
                desc: "AICPA evaluation and acquisition of formal signed SOC 2 Type I certification covering physical security and data governance.",
                status: "Q3 2026",
                statusColor: "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"
              },
              {
                title: "PHASE 4: TYPE II WINDOW",
                desc: "Completion of the formal 6-month structural observation window proving operational excellence across continuous periods.",
                status: "Q4 2026",
                statusColor: "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"
              }
            ].map((phase, idx) => (
              <div key={idx} className="bg-surface border border-white/10 p-8 space-y-4 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`inline-block px-2.5 py-0.5 border text-[8px] font-black tracking-widest uppercase ${phase.statusColor}`}>
                    {phase.status}
                  </div>
                  <h3 className="text-white font-sans font-bold text-sm tracking-tight">{phase.title}</h3>
                  <p className="text-muted text-xs font-mono leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 border border-white/10 bg-surface/50 space-y-4">
            <h4 className="text-sm font-sans font-extrabold text-white uppercase tracking-wider">GDPR & CCPA DATA PROCESSING AGREEMENT (DPA)</h4>
            <p className="text-xs text-muted font-mono leading-relaxed">
              We protect processing transparency through formal, standardized regulatory agreements. Our complete cross-border Data Processing Agreement (DPA), containing standard contractual clauses (SCCs) for continuous enterprise validity, is ready for digital signature today via secure legal portals.
            </p>
          </div>
        </section>

        {/* Cryptographic and BC/DR technical specifications */}
        <section className="space-y-12">
          <div className="space-y-4">
            <span className="text-xs text-accent font-black tracking-widest uppercase">SECTION 05 // SYSTEM RESILIENCY AND METRICS</span>
            <h2 className="text-4xl font-sans font-black tracking-tight uppercase">TECHNICAL SLA & RECOVERY ARCHITECTURE</h2>
            <p className="text-muted text-sm tracking-wider max-w-3xl leading-relaxed">
              We design redundancy straight into the application runtime layer. Underneath Paperloo's elegant visual dashboards is an enterprise governance machine optimized for failover readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
            <div className="bg-surface border border-white/10 p-10 space-y-6">
              <h3 className="text-lg font-sans font-black text-white uppercase tracking-wide border-b border-white/5 pb-4">BUSINESS CONTINUITY (BC/DR) Objectives</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted font-black tracking-wider">// RTO (Recovery Time Objective)</span>
                  <span className="text-accent font-extrabold">&lt; 4 HOURS</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Our system utilizes live dual-region container clusters. If a massive outage shuts down a geographical host zone completely, incoming traffic fails over to alternate nodes inside the threshold.
                </p>

                <div className="flex justify-between border-b border-white/5 pb-2 pt-2">
                  <span className="text-muted font-black tracking-wider">// RPO (Recovery Point Objective)</span>
                  <span className="text-accent font-extrabold">&lt; 1 HOUR</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  All databases implement continuous snapshot streams. Database write transactions are differential logged to isolated storage targets, limiting potential data gap loss.
                </p>
              </div>
            </div>

            <div className="bg-surface border border-white/10 p-10 space-y-6">
              <h3 className="text-lg font-sans font-black text-white uppercase tracking-wide border-b border-white/5 pb-4">KMS & VULNERABILITY DRILLS</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted font-black tracking-wider">// KMS CRYPTO KEY ENVELOPE</span>
                  <span className="text-accent font-extrabold">ROTATED ANNUALLY</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Data volumes are encrypted at rest using envelope patterns. Master keys are kept inside secure Cloud KMS (Key Management Services) and rotated automatically on 12-month strict schedules.
                </p>

                <div className="flex justify-between border-b border-white/5 pb-2 pt-2">
                  <span className="text-muted font-black tracking-wider">// CERTIFIED PEN-TESTING DRILLS</span>
                  <span className="text-accent font-extrabold">SEMI-ANNUAL</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Independent certified white-box testers execute penetration runs across all API endpoints, auth structures, and dashboard roles to proactively shut down vectors before release.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-white/10 text-center space-y-8">
        <div className="flex justify-center gap-8 text-[10px] text-muted font-bold tracking-widest uppercase">
          <Link to="/" className="hover:text-white">HOME</Link>
          <Link to="/partners" className="hover:text-white">PARTNER PROGRAM</Link>
          <span>© 2026 PAPERLOO</span>
        </div>
      </footer>
    </div>
  );
}
