import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Scale, Globe, Activity, CheckCircle2, ArrowRight, Check } from 'lucide-react';

const BADGES = [
  {
    icon: Shield,
    title: 'Enterprise Governance',
    description: 'We inherit SOC 2 Type II and ISO 27001 security controls by deploying exclusively on top of verified, certified cloud infrastructure partners.',
    status: 'Infrastructure Hardened'
  },
  {
    icon: Lock,
    title: 'AES-256 Data Architecture',
    description: 'All data volume layers are fully protected at rest by industry-standard AES-256 encryption, with all network transit strictly enforced via TLS 1.3 cryptographic protocols.',
    status: 'Strictly Enforced'
  },
  {
    icon: Scale,
    title: 'Statutory Compliance Ready',
    description: 'Engineered to support global privacy framework data pipelines, facilitating foundational data architecture structures necessary for native GDPR, CCPA, and PIPEDA execution.',
    status: 'Frameworks Validated'
  },
  {
    icon: Activity,
    title: 'Infrastructure Reliability',
    description: 'Built on high-availability, multi-region container deployments designed to maintain 99.9% uptime, automated snapshots, and operational business continuity.',
    status: 'Continuous Monitoring'
  }
];

export default function Trust() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-black">P</span>
            <span>Paperloo</span>
            <span className="text-xs text-slate-400 font-normal ml-1">Trust Center</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="bracket-btn-accent text-xs px-4 py-2">
              Request Platform Access
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="h-3.5 w-3.5" />
            <span>Enterprise Security & Data Governance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto">
            Trust Center & Statutory Data Integrity
          </h1>
          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The Paperloo platform is engineered for agency-grade data governance, cryptographic integrity, and continuous compliance monitoring across global privacy regulations.
          </p>

          {/* Legal Notice */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 max-w-3xl mx-auto text-left flex items-start gap-4">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Statutory Disclaimer & Technical Scope
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paperloo is an automated compliance technology provider, not a law firm. The compliance scores and documents provided by Paperloo constitute a technical health assessment based on observable digital telemetry and do not constitute formal legal counsel. Agencies should verify regional jurisdictional nuances with qualified legal counsel.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Architecture Badges */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BADGES.map((badge, i) => (
            <div key={i} className="enterprise-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <badge.icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">{badge.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Status: {badge.status}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Enterprise Pilot & Case Studies */}
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Field Verification</span>
            <h2 className="text-2xl font-bold tracking-tight text-white">Enterprise Pilot Program & Case Studies</h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              We deploy automated compliance monitoring across high-volume digital agency networks, software platforms, and e-commerce storefronts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                customer: "Nexus Payments",
                sector: "Fintech / SaaS",
                useCase: "Multi-jurisdictional compliance modeling across 28 client marketing domains.",
                metric: "GDPR Consent Audit: 98% / Grade A",
                badge: "Active Production",
                badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              },
              {
                customer: "Meridian Healthcare",
                sector: "HealthTech & Telehealth",
                useCase: "Zero-trust transit verification and privacy disclosures covering sensitive telemetry.",
                metric: "Audited System Map: Verified",
                badge: "Compliance Verified",
                badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/20"
              },
              {
                customer: "Kraken Commerce",
                sector: "E-Commerce Network",
                useCase: "Autonomous cookie consent shield gateway and legal documents synchronization.",
                metric: "Prior-Consent Violations: 0",
                badge: "Statutory Shield",
                badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }
            ].map((study, idx) => (
              <div key={idx} className="enterprise-card p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">{study.sector}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${study.badgeClass}`}>
                      {study.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{study.customer}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{study.useCase}</p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 text-xs font-semibold text-slate-200">
                  {study.metric}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Agencies requiring customized compliance frameworks or volume pilots can enroll through our specialized enterprise onboarding channel.
            </p>
            <Link to="/signup" className="bracket-btn-accent text-xs px-4 py-2 whitespace-nowrap flex items-center gap-2">
              <span>Apply for Enterprise Pilot</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Infrastructure Details */}
        <section className="enterprise-card p-8 md:p-10 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Cloud Infrastructure</span>
            <h2 className="text-2xl font-bold tracking-tight text-white">Isolated Enterprise Hosting & Encryption</h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Paperloo inherits SOC 2 Type II and ISO 27001 physical and infrastructure safeguards by hosting workloads exclusively within certified Google Cloud Platform and Cloudflare Enterprise topologies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-bold text-white">99.9%</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Uptime SLA</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-bold text-emerald-400">AES-256</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Storage Encryption</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-bold text-white">TLS 1.3</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Transit Encryption</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-bold text-emerald-400">24/7</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Statutory Monitoring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Data Residency & Sovereignty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Agency databases and document repositories are isolated in sovereign cloud regions, preventing cross-border leakage of protected consumer identifiers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Continuous Disaster Recovery (BC/DR)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated snapshot cycles ensure an RPO of under 1 hour, with multi-zone container failover guaranteeing an RTO under 4 hours in critical failure scenarios.
              </p>
            </div>
          </div>
        </section>

        {/* Audit Progression Roadmap */}
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Assurance Roadmap</span>
            <h2 className="text-2xl font-bold tracking-tight text-white">Security Audits & Compliance Timeline</h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Paperloo maintains continuous compliance posture monitoring to document security controls against AICPA Trust Services Criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                phase: 'Phase 1',
                title: 'Control Architecture',
                desc: 'Continuous cloud asset inventory mapping, database encryption verification, and container isolation.',
                status: 'Completed',
                statusClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              },
              {
                phase: 'Phase 2',
                title: 'Auditor Engagement',
                desc: 'AICPA-accredited firm alignment and system description report compilation.',
                status: 'In Progress',
                statusClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              },
              {
                phase: 'Phase 3',
                title: 'SOC 2 Type I',
                desc: 'Formal signed SOC 2 Type I certification covering physical security and data governance.',
                status: 'Scheduled',
                statusClass: 'bg-slate-800 text-slate-300 border-slate-700'
              },
              {
                phase: 'Phase 4',
                title: 'SOC 2 Type II Window',
                desc: 'Structural 6-month observation window proving operational control continuity.',
                status: 'Planned',
                statusClass: 'bg-slate-800 text-slate-400 border-slate-700'
              },
            ].map((item, idx) => (
              <div key={idx} className="enterprise-card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">{item.phase}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.statusClass}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* DPA Section */}
          <div className="enterprise-card p-6 space-y-2">
            <h3 className="text-sm font-bold text-white">
              GDPR & CCPA Data Processing Agreement (DPA)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We provide formal, standardized regulatory agreements. Our complete cross-border Data Processing Agreement (DPA) contains Standard Contractual Clauses (SCCs) to ensure continuous legal validity for agencies servicing clients in the EU, UK, and United States.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Paperloo. Enterprise Compliance Infrastructure for Digital Agencies.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link to="/partners" className="hover:text-slate-300 transition-colors">Partner Program</Link>
            <Link to="/trust" className="hover:text-slate-300 transition-colors">Trust Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
