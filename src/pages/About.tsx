import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileCode, CheckCircle, ArrowLeft, Building2, Globe2, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono selection:bg-accent selection:text-black">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> RETURN TO INFRASTRUCTURE
          </Link>
          <div className="text-xs text-accent uppercase tracking-widest font-bold">
            ENTITY: PAPERLOO INFRASTRUCTURE INC.
          </div>
        </div>

        <header className="space-y-4">
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[11px] font-bold text-accent tracking-widest uppercase">
            CORPORATE OVERVIEW & MISSION
          </div>
          <h1 className="text-3xl md:text-5xl font-sans font-black italic tracking-tighter uppercase">
            ABOUT PAPERLOO INFRASTRUCTURE
          </h1>
          <p className="text-sm md:text-base text-zinc-400 font-mono leading-relaxed">
            Paperloo provides the underlying legal and regulatory architecture for automated disclosures, continuous cookie consent shields, and programmatic SaaS governance worldwide.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <Shield className="w-8 h-8 text-accent" />
            <h2 className="text-base font-bold uppercase tracking-tight text-white">Autonomous Governance</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We replace outdated static legal documents with real-time, dynamic legal policies that self-update whenever global statutory regulations change.
            </p>
          </div>
          <div className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <Globe2 className="w-8 h-8 text-accent" />
            <h2 className="text-base font-bold uppercase tracking-tight text-white">Multi-Jurisdiction Coverage</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Native compliance verification across GDPR (European Union & UK), CCPA/CPRA (California), PIPEDA (Canada), and Australian Privacy Principles.
            </p>
          </div>
          <div className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
            <FileCode className="w-8 h-8 text-accent" />
            <h2 className="text-base font-bold uppercase tracking-tight text-white">Developer & Agent Native</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Built from inception for automated CI/CD integration, full REST API endpoints, OpenAPI 3.1 specifications, and Model Context Protocol (MCP) tooling.
            </p>
          </div>
        </section>

        <section className="border border-white/10 p-8 bg-zinc-950 rounded-lg space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Corporate Entity & Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
            <div>
              <p className="font-bold text-white uppercase mb-1">Legal Corporation</p>
              <p className="text-zinc-400">Paperloo Infrastructure Inc.</p>
              <p className="text-zinc-400">Delaware C-Corp Registration #7829104</p>
              
              <p className="font-bold text-white uppercase mt-4 mb-1">Global Headquarters</p>
              <p className="text-zinc-400">548 Market St, Suite 29012</p>
              <p className="text-zinc-400">San Francisco, CA 94104, United States</p>
              
              <p className="font-bold text-white uppercase mt-4 mb-1">Telephone Contact</p>
              <p className="text-zinc-400">+1-415-555-0199 (Mon–Fri 9am–6pm PST)</p>
            </div>
            <div>
              <p className="font-bold text-white uppercase mb-1">Executive Leadership</p>
              <p className="text-zinc-400">Chief Executive Officer: Marcus Vance</p>
              <p className="text-zinc-400">VP of Regulatory Engineering: Elena Rostova</p>
              <p className="text-zinc-400">Lead Statutory Architect: David Chen</p>

              <p className="font-bold text-white uppercase mt-4 mb-1">Regulatory Enquiries</p>
              <p className="text-zinc-400">General: compliance@paperloo.com</p>
              <p className="text-zinc-400">Data Protection Officer: dpo@paperloo.com</p>
              <p className="text-zinc-400">Security Disclosures: security@paperloo.com</p>
            </div>
          </div>
        </section>

        <section className="border border-white/10 p-8 bg-zinc-950 rounded-lg space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" /> Security, Privacy & Industry Certifications
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Paperloo enforces strict defense-in-depth isolation across all tenant workspaces. System telemetry and customer policy metadata are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption. Our infrastructure operations conform with SOC 2 Type II controls, ISO/IEC 27001 security standards, and WCAG 2.1 AA accessibility guidelines.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-3 border border-white/10 rounded text-center">
              <span className="text-xs font-bold text-accent block">SOC 2 TYPE II</span>
              <span className="text-[10px] text-zinc-500 uppercase">Audit Verified</span>
            </div>
            <div className="p-3 border border-white/10 rounded text-center">
              <span className="text-xs font-bold text-accent block">GDPR & CCPA</span>
              <span className="text-[10px] text-zinc-500 uppercase">Continuous Sync</span>
            </div>
            <div className="p-3 border border-white/10 rounded text-center">
              <span className="text-xs font-bold text-accent block">WCAG 2.1 AA</span>
              <span className="text-[10px] text-zinc-500 uppercase">Accessibility Compliant</span>
            </div>
            <div className="p-3 border border-white/10 rounded text-center">
              <span className="text-xs font-bold text-accent block">MCP 2024-11-05</span>
              <span className="text-[10px] text-zinc-500 uppercase">Agent Protocol</span>
            </div>
          </div>
        </section>

        <footer className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Paperloo Infrastructure Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/contact" className="hover:text-accent transition-colors">CONTACT US</Link>
            <Link to="/privacy" className="hover:text-accent transition-colors">PRIVACY POLICY</Link>
            <Link to="/legal" className="hover:text-accent transition-colors">TERMS OF SERVICE</Link>
            <Link to="/docs" className="hover:text-accent transition-colors">DEVELOPER DOCS</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
