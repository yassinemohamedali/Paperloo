import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono selection:bg-accent selection:text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> RETURN TO INFRASTRUCTURE
          </Link>
          <div className="text-xs text-accent uppercase tracking-widest font-bold">
            STATUTORY POLICY VERSION: 2026.4.1
          </div>
        </div>

        <header className="space-y-4">
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[11px] font-bold text-accent tracking-widest uppercase">
            LEGAL NOTICE & STATUTORY PRIVACY POLICY
          </div>
          <h1 className="text-3xl md:text-5xl font-sans font-black italic tracking-tighter uppercase">
            PAPERLOO PRIVACY POLICY
          </h1>
          <p className="text-sm md:text-base text-zinc-400 font-mono leading-relaxed">
            Effective Date: April 15, 2026 &bull; Last Revised: October 15, 2026. This policy governs how Paperloo Infrastructure Inc. processes and protects personal data across our compliance platforms, APIs, and client portals.
          </p>
        </header>

        <div className="border border-red-500/30 bg-red-950/20 p-6 rounded-lg text-xs leading-relaxed text-red-200 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1 text-red-300">
              MANDATORY LEGAL DISCLOSURE (NO ATTORNEY-CLIENT PRIVILEGE)
            </span>
            Paperloo Infrastructure Inc. provides software infrastructure for automated disclosures and compliance monitoring. We are a technology company, not a law firm. Using our software does not create an attorney-client relationship. All generated documents should be reviewed by qualified legal counsel in your respective jurisdiction prior to execution.
          </div>
        </div>

        <article className="space-y-8 text-xs text-zinc-300 leading-relaxed">
          <section className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              1. Data Controller Identification
            </h2>
            <p>
              The data controller responsible for the processing of your personal data under the EU General Data Protection Regulation (GDPR), the UK Data Protection Act 2018, the California Consumer Privacy Act (CCPA/CPRA), and the Brazilian General Data Protection Law (LGPD) is:
            </p>
            <div className="bg-black/50 p-4 rounded border border-white/5 space-y-1 font-mono text-zinc-400">
              <p className="text-white font-bold">Paperloo Infrastructure Inc.</p>
              <p>548 Market St, Suite 29012, San Francisco, CA 94104, United States</p>
              <p>Data Protection Officer: <a href="mailto:dpo@paperloo.com" className="text-accent hover:underline">dpo@paperloo.com</a></p>
              <p>General Compliance Inquiries: <a href="mailto:compliance@paperloo.com" className="text-accent hover:underline">compliance@paperloo.com</a></p>
            </div>
          </section>

          <section className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              2. Categories of Personal Data Collected
            </h2>
            <p>Paperloo collects only the minimum personal data strictly necessary to fulfill our contractual commitments and service delivery:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li><strong className="text-white">Account & Authentication Data:</strong> Email address, workspace names, cryptographic authentication tokens, and billing identifiers.</li>
              <li><strong className="text-white">Monitored Web Property Metadata:</strong> Domain names, target URLs, cookie classifications, third-party script signatures, and questionnaire answers.</li>
              <li><strong className="text-white">API & Agent Interaction Telemetry:</strong> Request timestamps, IP addresses (hashed and anonymized within 7 days), API key prefixes, user-agent strings, and Model Context Protocol (MCP) tool invocation records.</li>
              <li><strong className="text-white">Billing Records:</strong> Transaction IDs and subscription status processed securely via Stripe. Paperloo does not store raw credit card numbers.</li>
            </ul>
          </section>

          <section className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              3. Legal Bases for Processing (GDPR Art. 6)
            </h2>
            <p>We process personal data under the following legitimate grounds recognized by international privacy frameworks:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li><strong className="text-white">Contractual Performance (Art. 6(1)(b)):</strong> Generating legal policies, managing cookie shields, and providing developer API access.</li>
              <li><strong className="text-white">Legitimate Interests (Art. 6(1)(f)):</strong> Platform security hardening, rate limiting, anti-abuse monitoring, and fraud prevention.</li>
              <li><strong className="text-white">Legal Obligations (Art. 6(1)(c)):</strong> Preserving audit logs, compliance evidence records, and financial accounting receipts.</li>
              <li><strong className="text-white">Consent (Art. 6(1)(a)):</strong> Optional product notifications and non-essential analytical cookies (managed via Google Consent Mode v2).</li>
            </ul>
          </section>

          <section className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              4. Sub-Processors & International Data Transfers
            </h2>
            <p>
              Paperloo engages vetted third-party cloud infrastructure providers bound by statutory Data Processing Agreements (DPAs) incorporating standard contractual clauses (SCCs) approved by the European Commission:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="border border-white/10 p-3 rounded bg-black/40">
                <span className="font-bold text-white block">Supabase Inc.</span>
                <span className="text-[10px] text-zinc-500">Database & Auth (US/EU)</span>
              </div>
              <div className="border border-white/10 p-3 rounded bg-black/40">
                <span className="font-bold text-white block">Vercel Inc.</span>
                <span className="text-[10px] text-zinc-500">Global Edge CDN & Compute</span>
              </div>
              <div className="border border-white/10 p-3 rounded bg-black/40">
                <span className="font-bold text-white block">Stripe Inc.</span>
                <span className="text-[10px] text-zinc-500">PCI-DSS Payment Processing</span>
              </div>
            </div>
          </section>

          <section className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              5. Data Retention & Secure Deletion
            </h2>
            <p>
              Personal data is maintained only for as long as your workspace remains active. When an account is terminated, customer policy content and domain configurations are cryptographically purged within thirty (30) days. Security audit logs and network connection traces are retained for a maximum rolling window of twelve (12) months before automated destruction.
            </p>
          </section>

          <section className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              6. Your Statutory Data Subject Rights
            </h2>
            <p>
              Regardless of geographic location, Paperloo guarantees all users full rights under GDPR, CCPA, and global privacy mandates:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li><strong className="text-white">Right to Access (GDPR Art. 15):</strong> Request a complete machine-readable copy (JSON) of all personal data held.</li>
              <li><strong className="text-white">Right to Rectification (Art. 16):</strong> Modify or update inaccurate company or account records.</li>
              <li><strong className="text-white">Right to Erasure / Right to be Forgotten (Art. 17):</strong> Request irrevocable deletion of all account data.</li>
              <li><strong className="text-white">Right to Restriction & Objection (Art. 18 & 21):</strong> Limit processing of certain operational data streams.</li>
              <li><strong className="text-white">Right to Data Portability (Art. 20):</strong> Export generated legal documents in raw HTML and Markdown formats.</li>
              <li><strong className="text-white">Do Not Sell or Share My Information:</strong> Paperloo never sells, rents, or monetizes personal data to third parties.</li>
            </ul>
            <p className="pt-2">
              To exercise any of these statutory rights, submit a Data Subject Access Request directly to our Data Protection Officer at <a href="mailto:dpo@paperloo.com" className="text-accent underline font-bold">dpo@paperloo.com</a>. We respond to all formal requests within thirty (30) calendar days.
            </p>
          </section>
        </article>

        <footer className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Paperloo Infrastructure Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-accent transition-colors">ABOUT</Link>
            <Link to="/contact" className="hover:text-accent transition-colors">CONTACT US</Link>
            <Link to="/legal" className="hover:text-accent transition-colors">TERMS OF SERVICE</Link>
            <Link to="/docs" className="hover:text-accent transition-colors">DEVELOPER DOCS</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
