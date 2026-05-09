
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Users, Shield, Briefcase } from 'lucide-react';

export default function SolutionsAgencies() {
  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <Link to="/signup" className="bracket-btn py-2 px-6 text-xs font-black">
          <span className="bracket-btn-inner"></span>
          GET AGENCY KEY
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        <section className="space-y-8">
          <div className="inline-block p-2 bg-accent/10 border border-accent/20 text-accent text-[10px] font-black tracking-widest">
            INDUSTRY: ADVERTISING & MARKETING
          </div>
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter italic">AGENCY RAMP.<br/><span className="text-accent underline">SCALE GRP.</span></h1>
          <p className="text-muted text-lg tracking-widest max-w-2xl leading-relaxed">
            THE GLOBAL STANDARD FOR AGENCIES MANAGING 50+ CLIENT ENTITIES. CENTRALIZED GOVERNANCE FOR EVERY DEPLOYMENT.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { icon: Users, title: 'Multi-Tenant Auth', desc: 'Securely manage client legal permissions from a single pane of glass.' },
            { icon: Briefcase, title: 'White-Label Docs', desc: 'Brand compliance disclosures with your agency or your client identity.' },
            { icon: Shield, title: 'Legal Immunity', desc: 'Zero-touch policy updates ensuring any regional change propagates instantly.' },
            { icon: Globe, title: 'Global Scale', desc: 'Natively supports GDPR, CCPA, and emerging global legislative frameworks.' }
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
        <p className="text-[10px] text-muted font-bold tracking-widest">© 2026 PAPERLOO INFRASTRUCTURE · AGENCY DIVISION</p>
      </footer>
    </div>
  );
}
