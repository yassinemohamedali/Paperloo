
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldCheck, Scale, Globe, FileCheck, Users } from 'lucide-react';

export default function DataPrivacy() {
  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase selection:bg-accent selection:text-black">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <Link to="/trust" className="text-[10px] font-bold text-muted hover:text-white uppercase">Trust Center</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24 space-y-24">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20">
            <Eye className="w-3 h-3 text-accent" />
            <span className="text-[9px] font-black tracking-widest text-accent italic">GOVERNANCE & PRIVACY</span>
          </div>
          <h1 className="text-6xl font-sans font-black tracking-tighter italic">DATA <span className="text-accent underline">PRIVACY.</span></h1>
          <p className="text-muted text-sm tracking-[0.2em] leading-relaxed">
            OUR ARCHITECTURE IS DESIGNED AROUND THE PRINCIPLE OF PRIVACY-BY-DESIGN. WE PROVIDE THE INFRASTRUCTURE FOR TRANSPARENT DATA GOVERNANCE.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {[
             { 
               icon: Globe, 
               title: 'SURVEILLANCE & GDPR', 
               desc: 'AUTOMATED DATA PROCESSING IMPACT ASSESSMENTS (DPIA) ARE INTEGRATED INTO EVERY SITE DEPLOYMENT.' 
             },
             { 
               icon: Users, 
               title: 'USER RIGHTS (DSAR)', 
               desc: 'PROGRAMMATIC ENDPOINTS FOR DATA ACCESS AND DELETION REQUESTS ENSURE COMPLIANCE WITH USER SOVEREIGNTY LAWS.' 
             },
             { 
               icon: Scale, 
               title: 'LEGAL BASIS', 
               desc: 'DYNAMICALLY ASSESS AND LOG THE LEGAL BASIS FOR EVERY PROCESSING ACTIVITY WITHIN THE CONSENT LEDGER.' 
             },
             { 
               icon: FileCheck, 
               title: 'RECORDS AUDIT', 
               desc: 'GENERATE COMPREHENSIVE RECORDS OF PROCESSING ACTIVITIES (ROPA) FOR REGULATORY INSPECTIONS.' 
             }
           ].map((item, i) => (
             <div key={i} className="bg-surface border border-white/5 p-12 space-y-6 hover:border-accent/20 transition-all">
                <item.icon className="h-10 w-10 text-accent" />
                <h3 className="text-xl font-black italic tracking-tight">{item.title}</h3>
                <p className="text-[11px] text-muted tracking-widest leading-loose uppercase">{item.desc}</p>
             </div>
           ))}
        </div>

        <section className="bg-surface border border-white/10 p-12 space-y-8">
           <h2 className="text-3xl font-sans font-black italic tracking-tight uppercase">OUR PRIVACY PROMISE</h2>
           <div className="space-y-6 text-xs text-muted leading-loose tracking-widest uppercase">
              <p>PAPERLOO INFRASTRUCTURE ACTS AS A DATA PROCESSOR UNDER GDPR. WE DO NOT SELL, MONETIZE, OR SHARE CLIENT DATA WITH THIRD-PARTY ADVERTISING NETWORKS.</p>
              <p>WE RETAIN DATA ONLY FOR THE MINIMUM PERIOD REQUIRED TO PROVIDE COMPLIANCE SERVICES OR AS MANDATED BY APPLICABLE GLOBAL LAWS.</p>
           </div>
        </section>
      </main>

      <footer className="p-24 border-t border-white/10 text-center">
        <p className="text-[10px] text-muted font-black tracking-widest mb-8">© 2026 PAPERLOO INFRASTRUCTURE · PRIVACY OFFICE</p>
      </footer>
    </div>
  );
}
