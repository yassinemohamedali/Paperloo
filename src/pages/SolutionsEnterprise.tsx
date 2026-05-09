
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Database, Lock, Server } from 'lucide-react';

export default function SolutionsEnterprise() {
  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <Link to="/signup" className="bracket-btn py-2 px-6 text-xs font-black">
          <span className="bracket-btn-inner"></span>
          CONTACT ENTERPRISE
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        <section className="space-y-8">
          <div className="inline-block p-2 bg-accent/10 border border-accent/20 text-accent text-[10px] font-black tracking-widest">
            INDUSTRY: GLOBAL SaaS & ENTERPRISE
          </div>
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter italic">CROSS-BORDER<br/><span className="text-accent underline">GOVERNANCE.</span></h1>
          <p className="text-muted text-lg tracking-widest max-w-2xl leading-relaxed">
            COMPLEX DATA ARCHITECTURE REQUIRE SOPHISTICATED LEGAL PROTOCOLS. PAPERLOO IS THE INFRASTRUCTURE FOR THE FORTUNE 500.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { icon: Database, title: 'Data Residency', desc: 'Specify regional storage hubs to comply with local sovereignty laws.' },
            { icon: Server, title: 'Single Tenant Options', desc: 'Isolated infrastructure for mission-critical compliance security.' },
            { icon: Lock, title: 'RBAC Controls', desc: 'Granular access management for organizational legal departments.' },
            { icon: LayoutGrid, title: 'API Dominance', desc: 'Deep integration into your existing DevOps and CI/CD pipelines.' }
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-white/5 p-12 space-y-6 hover:border-accent/30 transition-all">
               <item.icon className="h-10 w-10 text-accent" />
               <h3 className="text-2xl font-black">{item.title}</h3>
               <p className="text-muted text-xs tracking-widest leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="p-12 border-t border-white/10 text-center">
        <p className="text-[10px] text-muted font-bold tracking-widest">© 2026 PAPERLOO INFRASTRUCTURE · ENTERPRISE DIVISION</p>
      </footer>
    </div>
  );
}
