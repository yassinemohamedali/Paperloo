import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Link as LinkIcon, DollarSign, ArrowRight, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';

const STEPS = [
  {
    icon: Users,
    title: 'SIGN UP',
    description: 'JOIN OUR PARTNER NETWORK IN SECONDS.'
  },
  {
    icon: LinkIcon,
    title: 'SHARE LINK',
    description: 'USE YOUR UNIQUE TRACKING LINK WITH YOUR NETWORK.'
  },
  {
    icon: DollarSign,
    title: 'EARN 20%',
    description: 'GET RECURRING COMMISSION FOR EVERY ACTIVE AGENCY.'
  }
];

const FAQS = [
  {
    q: 'HOW DOES COMMISSION WORK?',
    a: 'YOU EARN 20% OF EVERY PAYMENT MADE BY AGENCIES YOU REFER, FOR AS LONG AS THEY REMAIN ACTIVE SUBSCRIBERS.'
  },
  {
    q: 'WHEN DO I GET PAID?',
    a: 'PAYMENTS ARE PROCESSED MONTHLY VIA PAYPAL OR STRIPE CONNECT ONCE YOUR BALANCE REACHES $50.'
  },
  {
    q: 'WHO QUALIFIES FOR THE PROGRAM?',
    a: 'WE WELCOME MARKETERS, DEVELOPERS, LEGAL TECH ENTHUSIASTS, AND ANYONE WORKING WITH DIGITAL AGENCIES.'
  }
];

export default function Partners() {
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
        {/* Hero */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1 border border-accent/30 bg-accent/5 rounded-full"
          >
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-accent tracking-[0.3em] uppercase">PARTNER PROGRAM</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter leading-[0.9]">
            GROW WITH<br />PAPERLOO
          </h1>
          <p className="text-muted text-lg tracking-[0.15em] max-w-2xl mx-auto uppercase">
            REFER AGENCIES AND EARN RECURRING COMMISSION WHILE HELPING THEM SCALE COMPLIANCE.
          </p>
          
          <div className="pt-8">
            <a 
              href="mailto:paperloo.official@gmail.com?subject=Partner Program Application"
              className="bracket-btn py-4 px-12 text-sm"
            >
              <span className="bracket-btn-inner"></span>
              APPLY TO BECOME A PARTNER
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-sans font-extrabold tracking-tight uppercase">HOW IT WORKS</h2>
            <div className="h-1 w-24 bg-accent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-surface border border-white/10 p-12 space-y-8 relative group hover:border-accent/30 transition-all">
                <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
                <div className="h-16 w-16 bg-accent/10 flex items-center justify-center border border-accent/20">
                  <step.icon className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-sans font-extrabold tracking-tight uppercase">{step.title}</h3>
                  <p className="text-muted text-xs tracking-[0.15em] leading-relaxed uppercase">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-5xl font-sans font-black tracking-tight uppercase leading-tight">
              PARTNER<br />BENEFITS
            </h2>
            <div className="space-y-8">
              {[
                { icon: ShieldCheck, t: 'RECURRING REVENUE', d: 'EARN EVERY MONTH FOR THE LIFETIME OF THE CUSTOMER.' },
                { icon: Zap, t: 'DEDICATED SUPPORT', d: 'DIRECT ACCESS TO OUR PARTNER SUCCESS TEAM.' },
                { icon: HeartHandshake, t: 'CO-MARKETING', d: 'OPPORTUNITIES FOR JOINT WEBINARS AND CASE STUDIES.' }
              ].map((b, i) => (
                <div key={i} className="flex gap-6">
                  <div className="h-12 w-12 shrink-0 bg-white/5 flex items-center justify-center border border-white/10">
                    <b.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-sans font-extrabold tracking-tight uppercase">{b.t}</h4>
                    <p className="text-muted text-xs tracking-[0.15em] uppercase">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square bg-surface border border-white/10 overflow-hidden">
             <div className="absolute inset-0 scan-lines opacity-10" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[20vw] font-sans font-black text-white/[0.03] select-none">20%</div>
             </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto space-y-16">
          <h2 className="text-4xl font-sans font-extrabold tracking-tight uppercase text-center">FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-8 border border-white/10 bg-surface space-y-4">
                <h4 className="text-accent text-sm font-black tracking-[0.1em] uppercase">{faq.q}</h4>
                <p className="text-muted text-xs tracking-[0.15em] leading-relaxed uppercase">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-white/10 text-center space-y-8">
        <p className="text-muted text-[10px] tracking-[0.3em] uppercase">READY TO SCALE WITH US?</p>
        <a 
          href="mailto:paperloo.official@gmail.com?subject=Partner Program Application"
          className="bracket-btn py-4 px-12 text-sm"
        >
          <span className="bracket-btn-inner"></span>
          JOIN THE NETWORK
        </a>
        <div className="pt-12 flex justify-center gap-8 text-[10px] text-muted font-bold tracking-widest uppercase">
          <Link to="/" className="hover:text-white">HOME</Link>
          <Link to="/trust" className="hover:text-white">TRUST & SECURITY</Link>
          <span>© 2026 PAPERLOO</span>
        </div>
      </footer>
    </div>
  );
}
