import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Activity, CheckCircle, Scale, Database, Clock } from 'lucide-react';

const STATS = [
  {
    value: '99.8%',
    num: 99.8,
    suffix: '%',
    label: 'CONTEXTUAL ACCURACY',
    sub: 'Benchmark compliance score across multi-jurisdictional audits',
    icon: Activity,
    color: 'text-accent'
  },
  {
    value: '50+',
    num: 50,
    suffix: '+',
    label: 'GLOBAL JURISDICTIONS',
    sub: 'Active legal frameworks monitored (GDPR, CCPA, PIPEDA, APPs)',
    icon: Scale,
    color: 'text-emerald-400'
  },
  {
    value: '0%',
    num: 0,
    suffix: '%',
    label: 'UNMAPPED DATA LEAKS',
    sub: 'Zero unauthorized trackers passing autonomous edge filters',
    icon: Database,
    color: 'text-cyan-400'
  },
  {
    value: '<2MS',
    num: 2,
    prefix: '<',
    suffix: 'ms',
    label: 'EDGE POLICY LATENCY',
    sub: 'High-speed CDN propagation with zero impact on page load',
    icon: Clock,
    color: 'text-white'
  }
];

export default function StoryStatsSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-28 px-6 bg-black relative overflow-hidden border-t border-white/10"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Story Narrative (Palmo Story Section pattern) */}
        <div className="max-w-3xl mb-20 space-y-6">
          <div className="section-label mb-2 text-accent inline-block bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
            FOUNDATIONAL INTEGRITY
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tighter uppercase text-white leading-none">
            THE TRUE SOURCE OF <br />
            <span className="text-accent italic drop-shadow-[0_0_25px_rgba(200,241,53,0.3)]">EVERY DISCLOSURE.</span>
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed font-sans">
            Paperloo was engineered on a simple premise: privacy policies and terms of service should never be static PDF graveyard documents. As marketing agencies and high-velocity SaaS teams deploy new integrations, analytics tags, and AI features, compliance must evolve at runtime.
          </p>
          <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-mono">
            Our continuous autonomous engine scans your production domains, discovers newly added data endpoints, and synchronizes legally sound disclosures to your live sites before statutory authorities issue non-compliance notices.
          </p>
        </div>

        {/* 4 Stat Blocks with Palmo typography & high-contrast styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-surface border border-white/15 hover:border-accent/60 transition-all duration-300 hover:-translate-y-2 group shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">
                    METRIC 0{idx + 1}
                  </span>
                </div>

                <div>
                  <div className={`text-5xl sm:text-6xl font-sans font-black tracking-tight mb-2 ${stat.color} drop-shadow-[0_0_15px_rgba(200,241,53,0.15)]`}>
                    {stat.value}
                  </div>
                  <h3 className="text-sm font-sans font-black tracking-wider uppercase text-white mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">
                    {stat.sub}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span>AUDITED LIVE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
