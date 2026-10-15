import React from 'react';
import { Zap, Cpu, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    tag: 'LATENCY < 2MS',
    title: 'LIGHTSPEED EDGE DEPLOYMENT',
    description: 'Instant global CDN propagation across 12 distributed nodes. Zero impact on Core Web Vitals or page load speed.'
  },
  {
    icon: Cpu,
    tag: 'AUTONOMOUS REASONING',
    title: 'CONTEXT-AWARE PRIVACY ENGINE',
    description: 'Continuously audits your DOM scripts, forms, and network requests to detect missing legal disclosures in real time.'
  },
  {
    icon: ShieldCheck,
    tag: '100% STATUTORY COVERAGE',
    title: 'MULTI-JURISDICTIONAL HARMONY',
    description: 'Unified protection aligned with GDPR, CCPA/CPRA, PIPEDA, and APPs. Zero manual policy rewriting when laws amend.'
  }
];

export default function PalmoFeatureStrip() {
  return (
    <section className="relative z-20 border-y border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group px-4 md:px-8 py-6 md:py-2 transition-all duration-300 hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(200,241,53,0.15)] group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-sans font-black tracking-tight text-white mb-2 uppercase group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed font-mono">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
