import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 md:p-24 selection:bg-accent selection:text-black">
      <div className="max-w-4xl mx-auto space-y-16">
        <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline text-xs tracking-widest uppercase mb-12">
          <ArrowLeft className="h-4 w-4" />
          BACK TO HOME
        </Link>

        <div className="space-y-8">
          <div className="flex items-center gap-4 text-accent">
            <Shield className="h-12 w-12" />
            <h1 className="text-6xl font-sans font-black tracking-tighter">LEGAL CENTER</h1>
          </div>
          <p className="text-muted text-lg tracking-[0.15em] max-w-2xl">
            IMPORTANT DISCLOSURES AND TERMS FOR USING THE PAPERLOO PLATFORM.
          </p>
        </div>

        <div className="grid gap-12 border-t border-white/10 pt-16">
          <section className="space-y-6">
            <h2 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase text-amber-400">1. MANDATORY STATUTORY NOTICE (UPL DISCLAIMER)</h2>
            <div className="bg-white/5 border border-amber-500/30 p-8 space-y-6 text-sm tracking-wide leading-relaxed uppercase">
              <p className="text-base font-bold text-white border-l-2 border-accent pl-4">
                "Paperloo provides compliance automation software. It does not provide legal advice and is not a law firm. Generated documents are templates and must be reviewed by qualified counsel."
              </p>
              <p>
                PAPERLOO.COM IS AN AUTOMATED COMPLIANCE INFRASTRUCTURE PLATFORM DESIGNED TO ASSIST SAAS FOUNDERS AND DIGITAL BUSINESSES WITH CONSENT AND DOCUMENT TEMPLATES. 
                WE ARE NOT A LAW FIRM, AND WE DO NOT PROVIDE LEGAL SERVICES.
              </p>
              <p>
                USE OF THE PAPERLOO WEBSITE, SCRIPTS, OR TEMPLATE-GENERATED CONTENT DOES NOT CREATE AN ATTORNEY-CLIENT RELATIONSHIP.
              </p>
              <p>
                WE DO NOT REVIEW YOUR ANSWERS FOR LEGAL SUFFICIENCY, DRAW LEGAL CONCLUSIONS, PROVIDE LEGAL ADVICE, 
                OR APPLY THE LAW TO THE SPECIFIC FACTS OF YOUR PARTICULAR SITUATION. YOU ALONE ARE RESPONSIBLE FOR COMPLYING 
                WITH ALL RELEVANT LAWS AND REGULATIONS IN YOUR JURISDICTION.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase">2. PRIVACY POLICY</h2>
            <div className="text-muted text-sm space-y-4 tracking-wide leading-relaxed">
              <p>At Paperloo, we value your privacy. We collect your email and agency name to provide our services.</p>
              <p>We use industry-standard encryption to protect your questionnaire responses. Your data is stored securely in Supabase and only used to generate the documents you request.</p>
              <p>We do not sell your personal data to third parties. We may use anonymized usage data to improve our AI models.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase">3. TERMS OF SERVICE</h2>
            <div className="text-muted text-sm space-y-4 tracking-wide leading-relaxed">
              <p>By using Paperloo, you agree that you are using an experimental AI tool at your own risk.</p>
              <p>You agree to indemnify and hold harmless Paperloo, its creators, and affiliates from any legal claims arising from the use of the generated documents.</p>
              <p>We provide these services "as-is" without any guarantees of legal compliance or accuracy. AI is prone to errors, and it is your sole responsibility to verify all output.</p>
            </div>
          </section>
        </div>

        <footer className="pt-24 text-[10px] text-muted-custom tracking-[0.2em] uppercase text-center border-t border-white/5">
          © 2026 PAPERLOO · SECURE COMPLIANCE AUTOMATION · GLOBAL OPERATIONS.
        </footer>
      </div>
    </div>
  );
}
