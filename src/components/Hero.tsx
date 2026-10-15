import React from 'react';
import { ChevronRight, Search, ShieldCheck, Terminal, Cpu } from 'lucide-react';

interface HeroProps {
  onExploreFieldGuide?: () => void;
  onOpenScanner?: () => void;
  onOpenCockpit?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreFieldGuide,
  onOpenScanner,
  onOpenCockpit,
}) => {
  const handleExplore = () => {
    if (onExploreFieldGuide) {
      onExploreFieldGuide();
    } else {
      const el = document.getElementById('about-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full h-screen flex flex-col justify-between px-4 sm:px-6 lg:px-10 z-10 pointer-events-auto select-none">
      {/* Center top content */}
      <div className="pt-36 sm:pt-48 max-w-5xl">
        {/* Eyebrow: AUTOMATED COMPLIANCE INFRASTRUCTURE, JetBrains Mono, uppercase, tracking 0.3em, emerald accent, mb-6/10, fade-up delay 300ms */}
        <div
          className="flex items-center gap-3 mb-6 sm:mb-8 animate-fade-up opacity-0"
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <p className="font-jetbrains text-xs sm:text-sm uppercase tracking-[0.3em] text-[#10B981] font-semibold">
            AUTOMATED COMPLIANCE INFRASTRUCTURE // V4.2
          </p>
        </div>

        {/* H1: Read the Stack. Prove Compliance., Bubbledot, 3xl at mobile through 7xl at large screens, white, line-height .95, tight tracking, fade-up delay 500ms */}
        <h1
          className="font-bubbledot text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.95] max-w-5xl animate-fade-up opacity-0"
          style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
        >
          Read the Stack.
          <br />
          Prove Compliance.
        </h1>

        {/* Live telemetry row in JetBrains Mono font */}
        <div
          className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-2 font-jetbrains text-xs text-white/50 animate-fade-up opacity-0"
          style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
        >
          <span className="flex items-center gap-1.5 text-white/80">
            <span className="font-bubbledot text-base text-[#10B981]">0%</span> FABRICATION
          </span>
          <span className="text-white/20">/</span>
          <span className="flex items-center gap-1.5 text-white/80">
            <span className="font-bubbledot text-base text-[#10B981]">99.8%</span> RADAR PRECISION
          </span>
          <span className="text-white/20">/</span>
          <span className="flex items-center gap-1.5 text-white/80">
            <span className="font-bubbledot text-base text-[#10B981]">&lt;3KB</span> CMP BANNER
          </span>
          <span className="text-white/20">/</span>
          <span className="text-white/40">GDPR · CCPA · LGPD · POPIA</span>
        </div>
      </div>

      {/* Bottom row: column then row at sm, aligned end, pb-8/12 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 sm:pb-12 max-w-7xl w-full">
        {/* Left copy: in JetBrains Mono xs/sm, white/60, max width -sm, relaxed leading, fade-up delay 700ms */}
        <div
          className="space-y-2 max-w-md animate-fade-up opacity-0"
          style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
        >
          <p className="font-jetbrains text-xs sm:text-sm text-white/70 leading-relaxed">
            Zero-fabrication statutory corpus, deep headless tracker crawler, and lightweight script-blocking CMP. Turn regulatory requirements into deterministic verifiable software.
          </p>
          <p className="font-jetbrains text-[11px] text-white/40">
            Hard-required legal registration verification · No hallucinated CRO entities · Production HTTPS DSAR
          </p>
        </div>

        {/* Right CTA Group: black rounded-xl with emerald square + launch buttons */}
        <div
          className="flex flex-wrap items-center gap-3 animate-fade-up opacity-0"
          style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
        >
          {/* Secondary Cockpit Button */}
          <button
            onClick={onOpenCockpit}
            className="group inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-3 font-jetbrains text-xs sm:text-sm font-medium tracking-tight backdrop-blur-md border border-white/15 active:scale-98 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            aria-label="Open Compliance Cockpit"
          >
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Open Cockpit</span>
          </button>

          {/* Primary Audit Action: black rounded-xl, with an emerald (#10B981) 44px inner square */}
          <button
            onClick={onOpenScanner}
            className="group inline-flex items-center gap-4 rounded-xl bg-black text-white pl-5 pr-2 py-2 font-jetbrains text-xs sm:text-sm font-medium tracking-tight shadow-xl hover:bg-zinc-950 active:scale-98 transition-all duration-150 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            aria-label="Audit Your Stack"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Search className="w-4 h-4 text-[#10B981]" />
              Audit Your Stack
            </span>
            <span className="w-11 h-11 rounded-lg bg-[#10B981] flex items-center justify-center transition-all duration-150 group-hover:bg-[#059669] group-hover:translate-x-0.5 shadow-md">
              <ChevronRight className="w-5 h-5 text-black font-bold" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
