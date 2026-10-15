import React from 'react';
import { ChevronRight, ShieldCheck, Lock, FileCheck2, AlertCircle } from 'lucide-react';
import useReveal from '../hooks/useReveal';

interface AboutProps {
  onRequestFieldBrief?: () => void;
  onOpenCockpit?: () => void;
}

export const About: React.FC<AboutProps> = ({ onRequestFieldBrief, onOpenCockpit }) => {
  const { ref, isRevealed } = useReveal(0.1);

  return (
    <section
      id="about-section"
      ref={ref}
      className="relative w-full min-h-screen overflow-hidden bg-[#f0eded] z-10 text-black select-none"
    >
      {/* Local video atmospheric background with accessible poster fallback */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/assets/aeris/aeris-about-poster.webp"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
      >
        <source src="/assets/aeris/aeris-about-clouds.mp4" type="video/mp4" />
      </video>

      {/* Overlay content */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-10 sm:pb-16 flex flex-col justify-between max-w-7xl mx-auto">
        {/* Top-left: max width md */}
        <div className="max-w-md space-y-6">
          {/* Top-left delay 100ms */}
          <div
            className={`space-y-3 ${
              isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
            }`}
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/5 border border-black/10 text-[10px] font-jetbrains uppercase tracking-widest text-black/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              The Zero-Fabrication Standard
            </div>
            <p className="font-jetbrains text-xs sm:text-sm text-black/80 leading-relaxed">
              Most generators invent plausible-sounding companies, fake CRO numbers, and fictitious registered addresses. Paperloo enforces deterministic statutory grounding — zero hallucination, verifiable law.
            </p>
          </div>

          {/* Below it, delay 250ms: white rounded-xl shadow-sm CTA with black rounded-lg 44px inner square */}
          <button
            onClick={() => {
              if (onOpenCockpit) onOpenCockpit();
              else if (onRequestFieldBrief) onRequestFieldBrief();
            }}
            className={`group inline-flex items-center gap-4 rounded-xl bg-white text-black pl-5 pr-2 py-2 font-jetbrains text-xs sm:text-sm font-medium tracking-tight shadow-sm hover:shadow-md hover:bg-zinc-50 active:scale-98 transition-all duration-150 border border-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
              isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
            }`}
            style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
            aria-label="Generate Statutory Policy"
          >
            <span className="font-semibold">Generate Statutory Policy</span>
            <span className="w-11 h-11 rounded-lg bg-black flex items-center justify-center transition-transform duration-150 group-hover:translate-x-0.5">
              <ChevronRight className="w-5 h-5 text-white" />
            </span>
          </button>
        </div>

        {/* Center Grid of Compliance Architecture */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-3 my-8 ${
            isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
          }`}
          style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
        >
          <div className="bg-white/70 backdrop-blur-sm border border-black/5 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-black font-semibold text-xs font-jetbrains mb-1">
              <FileCheck2 className="w-4 h-4 text-[#10B981]" />
              01 / Hard-Required Legal Identity
            </div>
            <p className="text-[11px] font-jetbrains text-black/60 leading-normal">
              Company registration, CRO numbers, and jurisdictions are verified strictly against real public registers or left uncommitted. Never LLM-hallucinated.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-black/5 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-black font-semibold text-xs font-jetbrains mb-1">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              02 / Multi-Framework Addenda
            </div>
            <p className="text-[11px] font-jetbrains text-black/60 leading-normal">
              Fully rendered statutory clauses for GDPR (Art. 13/14), UK GDPR, CCPA/CPRA, LGPD (Art. 9), and POPIA. No empty template slots or truncated articles.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-black/5 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-black font-semibold text-xs font-jetbrains mb-1">
              <Lock className="w-4 h-4 text-[#10B981]" />
              03 / Named Sub-Processors & DSAR
            </div>
            <p className="text-[11px] font-jetbrains text-black/60 leading-normal">
              Explicit mapping for AWS, Supabase, Stripe, Google Cloud, and Resend with EU-US DPF / SCC legal transfer mechanisms and HTTPS production DSAR portals.
            </p>
          </div>
        </div>

        {/* Bottom row: column then row at md, items-end and space-between */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pt-4 border-t border-black/10">
          {/* Left max width md, delay 400ms */}
          <div
            className={`max-w-md font-jetbrains text-2xl sm:text-3xl md:text-4xl font-medium text-black leading-snug ${
              isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
            }`}
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            Meet Paperloo. Built to{' '}
            <span className="text-black/40">parse the stack</span> and{' '}
            <span className="text-black font-semibold">make compliance legible</span>.
          </div>

          {/* Right max width lg, delay 550ms */}
          <div
            className={`max-w-lg md:text-right font-jetbrains text-xl sm:text-2xl md:text-3xl font-medium text-black leading-snug ${
              isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
            }`}
            style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}
          >
            Follow an unconsented cookie drop and understand how{' '}
            <span className="text-black/40">small scripts</span> become{' '}
            <span className="font-bold text-black">statutory liabilities</span>.
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
