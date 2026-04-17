import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Scale, Globe, Activity, CheckCircle2 } from 'lucide-react';

const BADGES = [
  {
    icon: Shield,
    title: 'GDPR COMPLIANT PLATFORM',
    description: 'WE ADHERE TO THE HIGHEST DATA PROTECTION STANDARDS FOR OUR OWN OPERATIONS.'
  },
  {
    icon: Lock,
    title: '256-BIT ENCRYPTION',
    description: 'ALL DATA IN TRANSIT AND AT REST IS PROTECTED BY INDUSTRY-STANDARD AES-256 ENCRYPTION.'
  },
  {
    icon: Scale,
    title: 'ATTORNEY-REVIEWED TEMPLATES',
    description: 'OUR DOCUMENT ENGINE IS BUILT ON LEGAL FRAMEWORKS REVIEWED BY PRIVACY EXPERTS.'
  },
  {
    icon: Globe,
    title: 'MULTI-JURISDICTION COVERAGE',
    description: 'NATIVE SUPPORT FOR GDPR, CCPA, PIPEDA, LGPD AND MORE GLOBAL REGULATIONS.'
  },
  {
    icon: Activity,
    title: '99.9% UPTIME',
    description: 'OUR INFRASTRUCTURE IS DESIGNED FOR MAXIMUM RELIABILITY AND DOCUMENT AVAILABILITY.'
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
          GET STARTED
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {/* Header */}
        <section className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter leading-[0.9]">
            TRUST &<br />SECURITY
          </h1>
          <p className="text-muted text-lg tracking-[0.15em] max-w-2xl mx-auto uppercase">
            WE TAKE COMPLIANCE SERIOUSLY. HERE IS HOW WE PROTECT YOUR AGENCY AND YOUR CLIENTS.
          </p>
        </section>

        {/* Badges Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BADGES.map((badge, i) => (
            <div key={i} className="bg-surface border border-white/10 p-12 space-y-8 relative group hover:border-accent/30 transition-all">
              <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
              <div className="h-16 w-16 bg-accent/10 flex items-center justify-center border border-accent/20">
                <badge.icon className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-sans font-extrabold tracking-tight uppercase">{badge.title}</h3>
                <p className="text-muted text-xs tracking-[0.15em] leading-relaxed uppercase">{badge.description}</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-accent text-[10px] font-black tracking-widest uppercase">
                <CheckCircle2 className="h-4 w-4" />
                VERIFIED
              </div>
            </div>
          ))}
        </section>

        {/* Infrastructure */}
        <section className="bg-surface border border-white/10 p-12 md:p-24 relative overflow-hidden">
          <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <h2 className="text-4xl font-sans font-black tracking-tight uppercase">SECURE BY DESIGN</h2>
              <p className="text-muted text-sm tracking-[0.15em] leading-relaxed uppercase">
                PAPERLOO IS BUILT ON TOP-TIER CLOUD INFRASTRUCTURE WITH AUTOMATED SECURITY MONITORING, REGULAR AUDITS, AND STRICT ACCESS CONTROLS.
              </p>
              <ul className="space-y-4">
                {[
                  'ISOLATED CLIENT DATA ENVIRONMENTS',
                  'AUTOMATED DAILY BACKUPS',
                  'REAL-TIME THREAT DETECTION',
                  'SOC 2 COMPLIANT DATA CENTERS'
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
                  <span className="text-2xl font-sans font-black text-accent">AES</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">ENCRYPTION</span>
               </div>
               <div className="h-32 bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-2xl font-sans font-black text-accent">TLS</span>
                  <span className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">SECURE TRANSIT</span>
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
