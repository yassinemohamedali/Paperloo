
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Server, Radio, Database } from 'lucide-react';

export default function SecurityPolicy() {
  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase selection:bg-accent selection:text-black">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <Link to="/trust" className="text-[10px] font-bold text-muted hover:text-white uppercase">Trust Center</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24 space-y-24">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20">
            <Lock className="w-3 h-3 text-accent" />
            <span className="text-[9px] font-black tracking-widest text-accent italic">SECURITY WHITE PAPER v4.1</span>
          </div>
          <h1 className="text-6xl font-sans font-black tracking-tighter italic">SECURITY <span className="text-accent underline">INFRASTRUCTURE.</span></h1>
          <p className="text-muted text-sm tracking-[0.2em] leading-relaxed">
            OUR COMMITMENT TO SECURING GLOBAL GOVERNANCE DATA THROUGH MILITARY-GRADE ENCRYPTION AND SOC2-ALIGNED OPERATIONS.
          </p>
        </section>

        <div className="space-y-16">
          <section className="space-y-8">
            <h2 className="text-2xl font-sans font-black italic tracking-tight border-b border-white/10 pb-4">DATA ENCRYPTION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface border border-white/5 p-8 space-y-6">
                <Shield className="h-10 w-10 text-accent" />
                <h3 className="text-lg font-black italic">AT REST</h3>
                <p className="text-[11px] text-muted tracking-widest leading-relaxed">
                  ALL SENSITIVE DATA IS ENCRYPTED USING AES-256 SYMMETRIC POLICIES. MASTER KEYS ARE STORED IN ISOLATED HARDWARE SECURITY MODULES (HSM).
                </p>
              </div>
              <div className="bg-surface border border-white/5 p-8 space-y-6">
                <Radio className="h-10 w-10 text-accent" />
                <h3 className="text-lg font-black italic">IN TRANSIT</h3>
                <p className="text-[11px] text-muted tracking-widest leading-relaxed">
                  END-TO-END ENCRYPTION VIA TLS 1.3 PROTOCOLS FOR ALL API TRAFFIC. PERFECT FORWARD SECRECY IS ENFORCED BY DEFAULT.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-sans font-black italic tracking-tight border-b border-white/10 pb-4">INFRASTRUCTURE PROTECTION</h2>
            <div className="space-y-6 text-xs text-muted leading-loose tracking-widest">
              <div className="flex gap-6 items-start">
                 <div className="h-8 w-8 shrink-0 bg-white/5 flex items-center justify-center font-black italic">01</div>
                 <p>MULTI-TENANT ISOLATION: CLIENT DATA IS LOGICALLY SEPARATED AT THE DATABASE LEVEL, ENSURING NO CROSS-TENANT DATA EXPOSURE OR LEAKAGE. ACCESS IS GOVERNED BY STRICT RBAC POLICIES.</p>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="h-8 w-8 shrink-0 bg-white/5 flex items-center justify-center font-black italic">02</div>
                 <p>CONTINUOUS MONITORING: REAL-TIME ANOMALY DETECTION AND INCIDENT RESPONSE PIPELINES ARE PERMANENTLY ACTIVE. AUTOMATED THREAT BLOCKING IS DEPLOYED AT THE EDGE LAYER.</p>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="h-8 w-8 shrink-0 bg-white/5 flex items-center justify-center font-black italic">03</div>
                 <p>COMPLIANCE AUDITS: OUR INTERNAL SECURITY TEAM CONDUCTS BI-WEEKLY PENETRATION TESTING AND SYSTEM AUDITS TO MAINTAIN THE INTEGRITY OF THE GOVERNANCE ENGINE.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="p-24 border-t border-white/10 text-center">
        <p className="text-[10px] text-muted font-black tracking-widest mb-8">© 2026 PAPERLOO INFRASTRUCTURE · SECURITY DIVISION</p>
      </footer>
    </div>
  );
}
