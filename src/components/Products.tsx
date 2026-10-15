import React from 'react';
import { ChevronRight, Search, FileText, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import useReveal from '../hooks/useReveal';

interface ProductsProps {
  onSelectSignal?: (signal: string) => void;
  onOpenScanner?: () => void;
  onOpenCockpit?: () => void;
  onToggleCmpPreview?: () => void;
}

export const Products: React.FC<ProductsProps> = ({
  onSelectSignal,
  onOpenScanner,
  onOpenCockpit,
  onToggleCmpPreview,
}) => {
  const { ref, isRevealed } = useReveal(0.1);

  const handleAction = (label: string) => {
    if (label.includes('Crawler') && onOpenScanner) {
      onOpenScanner();
    } else if (label.includes('Statute') && onOpenCockpit) {
      onOpenCockpit();
    } else if (label.includes('Consent') && onToggleCmpPreview) {
      onToggleCmpPreview();
    } else if (onSelectSignal) {
      onSelectSignal(label);
    }
  };

  return (
    <section
      id="products-section"
      ref={ref}
      className="relative w-full min-h-screen bg-[#E8E5E9] p-2 sm:p-3 z-10 select-none flex flex-col justify-center"
    >
      <div className="w-full h-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 py-4 md:py-0">
        
        {/* COLUMN 1: Crawler / Tracker Radar card */}
        <div
          className={`relative rounded-2xl overflow-hidden min-h-[520px] md:h-full flex flex-col justify-between p-5 sm:p-6 transition-all ${
            isRevealed ? 'animate-scale-in opacity-0' : 'opacity-0'
          }`}
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          {/* Absolute fill terrain/radar image */}
          <img
            src="/assets/aeris/aeris-trace-topography.webp"
            alt="Paperloo live compliance stack topography"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90"
          ></img>

          {/* Top content */}
          <div className="relative z-10">
            {/* Top delay 300ms: 01 in Bubbledot 5xl/6xl black/80 */}
            <div
              className={`font-bubbledot text-5xl sm:text-6xl font-bold text-black/80 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              01
            </div>

            {/* Subtext */}
            <p
              className={`font-jetbrains text-xs sm:text-sm text-black/70 leading-relaxed max-w-sm mt-4 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
            >
              Headless web crawler scans tracking cookies, third-party beacons, unconsented SDKs, and ADA accessibility across your entire digital surface.
            </p>
          </div>

          {/* Bottom stack gap 2 */}
          <div className="relative z-10 flex flex-col gap-2 mt-auto pt-6">
            {/* Bar card */}
            <button
              onClick={() => handleAction('Crawler Living Radar')}
              className={`w-full flex items-center justify-between bg-[#EBE8EB]/90 backdrop-blur-xs rounded-xl pl-4 py-2 pr-2 border border-black/5 shadow-xs hover:bg-[#EBE8EB] active:scale-98 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}
              aria-label="From scattered trackers to one living radar"
            >
              <span className="font-jetbrains text-[11px] sm:text-[13px] font-medium text-black text-left">
                From scattered trackers to one living radar
              </span>
              <span className="w-11 h-11 rounded-lg bg-black flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
                <Search className="w-4 h-4 text-[#10B981]" />
              </span>
            </button>

            {/* 5-column gap-2 row */}
            <div className="grid grid-cols-5 gap-2">
              {/* Left col-span-3 delay 550ms pale card p-4 */}
              <div
                className={`col-span-3 bg-[#EBE8EB]/90 backdrop-blur-xs rounded-xl p-4 border border-black/5 flex flex-col justify-between ${
                  isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
                }`}
                style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}
              >
                <p className="font-jetbrains text-[10px] sm:text-xs text-black/80 leading-snug">
                  The question is not what script dropped first, but what user data is leaking before consent.
                </p>
                <div className="font-bubbledot text-3xl sm:text-4xl lg:text-5xl font-bold text-black mt-3">
                  Crawler
                </div>
              </div>

              {/* Right col-span-2 delay 650ms pale card video */}
              <div
                className={`col-span-2 bg-[#EBE8EB]/90 backdrop-blur-xs rounded-xl overflow-hidden relative border border-black/5 flex flex-col justify-between p-3 ${
                  isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
                }`}
                style={{ animationDelay: '650ms', animationFillMode: 'forwards' }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/assets/aeris/aeris-radar-poster.webp"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                >
                  <source src="/assets/aeris/aeris-radar-close.mp4" type="video/mp4" />
                </video>
                <div className="relative z-10 flex justify-between items-start">
                  <span className="font-jetbrains text-[9px] uppercase tracking-wider text-black/60 bg-white/70 px-1.5 py-0.5 rounded">
                    SCAN RADAR
                  </span>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-bubbledot text-xl text-black">42+</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                </div>
              </div>
            </div>

            {/* Full-width bottom row: delay 750ms, #EBE8EB, rounded-xl, px-4 py-3, flex items-center justify-between */}
            <div
              className={`w-full bg-[#EBE8EB]/90 backdrop-blur-xs rounded-xl px-4 py-3 border border-black/5 flex items-center justify-between font-jetbrains text-xs text-black/80 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '750ms', animationFillMode: 'forwards' }}
            >
              <span className="font-bold tracking-wider text-black">L/01</span>
              <span className="text-[11px] sm:text-xs">Notice what client scripts hide.</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Statutory Generator card */}
        <div
          className={`relative bg-[#EBE8EB] rounded-2xl overflow-hidden min-h-[520px] md:h-full flex flex-col justify-between p-5 sm:p-6 border border-black/5 shadow-xs transition-all ${
            isRevealed ? 'animate-scale-in opacity-0' : 'opacity-0'
          }`}
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          {/* Top content */}
          <div className="relative z-10">
            {/* Top delay 350ms: 02 in Bubbledot 5xl/6xl */}
            <div
              className={`font-bubbledot text-5xl sm:text-6xl font-bold text-black/80 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
            >
              02
            </div>

            {/* Paragraph delay 400ms */}
            <p
              className={`font-jetbrains text-xs sm:text-sm text-black/70 leading-relaxed max-w-sm mt-4 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              Deterministic policy synthesis grounded in real legal corpora. Hard-requires verified company registration numbers — never fabricates Irish CROs or Dublin addresses.
            </p>
          </div>

          {/* Middle card delay 500ms: video container */}
          <div
            className={`relative my-auto w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-black/5 shadow-inner ${
              isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
            }`}
            style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/assets/aeris/aeris-sensor-poster.webp"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/assets/aeris/aeris-sensor-field.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
              <span className="font-jetbrains text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                STATUTORY CORPUS GROUNDING
              </span>
            </div>
          </div>

          {/* Bottom stack */}
          <div className="relative z-10 flex flex-col gap-2 mt-auto">
            {/* Action button with Paperloo emerald #10B981 square */}
            <button
              onClick={() => handleAction('Statute Verification')}
              className={`w-full flex items-center justify-between bg-white rounded-xl pl-4 py-2 pr-2 border border-black/5 shadow-xs hover:bg-zinc-50 active:scale-98 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
              aria-label="Generate Statutory Policy"
            >
              <span className="font-jetbrains text-[11px] sm:text-[13px] font-semibold text-black text-left">
                Generate Zero-Fabrication Policy
              </span>
              <span className="w-11 h-11 rounded-lg bg-[#10B981] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 shadow-sm">
                <FileText className="w-5 h-5 text-black" />
              </span>
            </button>

            {/* 5-column grid */}
            <div className="grid grid-cols-5 gap-2">
              {/* Left col-span-2 delay 650ms */}
              <div
                className={`col-span-2 bg-white/70 backdrop-blur-xs rounded-xl p-3 border border-black/5 flex flex-col justify-between ${
                  isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
                }`}
                style={{ animationDelay: '650ms', animationFillMode: 'forwards' }}
              >
                <span className="font-jetbrains text-[9px] uppercase tracking-wider text-black/50">
                  SUB-PROCESSORS
                </span>
                <span className="font-jetbrains text-[10px] text-black font-semibold">
                  AWS · Stripe · Google · Supabase
                </span>
                <span className="font-jetbrains text-[9px] text-[#10B981] font-mono">
                  + DPF / SCC Basis
                </span>
              </div>

              {/* Right col-span-3 delay 700ms */}
              <div
                className={`col-span-3 bg-white/70 backdrop-blur-xs rounded-xl p-4 border border-black/5 flex flex-col justify-between ${
                  isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
                }`}
                style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
              >
                <p className="font-jetbrains text-[10px] sm:text-xs text-black/80 leading-snug">
                  Legal compliance is not boilerplate. It is verifiable architecture.
                </p>
                <div className="font-bubbledot text-3xl sm:text-4xl lg:text-5xl font-bold text-black mt-3">
                  Statute
                </div>
              </div>
            </div>

            {/* Full-width bottom row */}
            <div
              className={`w-full bg-white/60 backdrop-blur-xs rounded-xl px-4 py-3 border border-black/5 flex items-center justify-between font-jetbrains text-xs text-black/80 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '750ms', animationFillMode: 'forwards' }}
            >
              <span className="font-bold tracking-wider text-black">L/02</span>
              <span className="text-[11px] sm:text-xs">Deterministic clauses, zero legal fiction.</span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Lightweight CMP & HTTPS DSAR card */}
        <div
          className={`relative bg-[#EBE8EB] rounded-2xl overflow-hidden min-h-[520px] md:h-full flex flex-col justify-between p-5 sm:p-6 border border-black/5 shadow-xs transition-all ${
            isRevealed ? 'animate-scale-in opacity-0' : 'opacity-0'
          }`}
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          {/* Top content */}
          <div className="relative z-10">
            {/* Top delay 400ms: 03 in Bubbledot 5xl/6xl */}
            <div
              className={`font-bubbledot text-5xl sm:text-6xl font-bold text-black/80 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              03
            </div>

            {/* Paragraph delay 450ms */}
            <p
              className={`font-jetbrains text-xs sm:text-sm text-black/70 leading-relaxed max-w-sm mt-4 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}
            >
              Under 3KB zero-dependency cookie banner halts unconsented script execution at runtime. Deploys production HTTPS DSAR endpoints with zero staging leaks.
            </p>
          </div>

          {/* Middle video card delay 550ms */}
          <div
            className={`relative my-auto w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-black/5 shadow-inner ${
              isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
            }`}
            style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/assets/aeris/aeris-hero-poster.webp"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/assets/aeris/aeris-hero-atmosphere.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-4">
              <div className="font-jetbrains text-xs text-white space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] tracking-wider uppercase text-[#10B981]">SCRIPT INTERCEPTOR</span>
                </div>
                <div className="text-[11px] text-white/80">document.createElement('script')</div>
                <div className="text-[10px] text-white/50 font-mono">Blocked until CMP opt-in</div>
              </div>
              <div className="bg-[#10B981]/20 border border-[#10B981]/40 rounded-lg p-2 text-center">
                <span className="font-bubbledot text-lg text-[#10B981] block">12ms</span>
                <span className="text-[8px] font-mono text-white/70 block uppercase">LATENCY</span>
              </div>
            </div>
          </div>

          {/* Bottom stack */}
          <div className="relative z-10 flex flex-col gap-2 mt-auto">
            {/* Bar card: toggle CMP preview */}
            <button
              onClick={() => handleAction('Consent Interceptor')}
              className={`w-full flex items-center justify-between bg-white rounded-xl pl-4 py-2 pr-2 border border-black/5 shadow-xs hover:bg-zinc-50 active:scale-98 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
              aria-label="Preview Lightweight CMP Banner"
            >
              <span className="font-jetbrains text-[11px] sm:text-[13px] font-semibold text-black text-left">
                Test Lightweight CMP Banner
              </span>
              <span className="w-11 h-11 rounded-lg bg-black flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
                <Sliders className="w-4 h-4 text-[#10B981]" />
              </span>
            </button>

            {/* 5-column grid */}
            <div className="grid grid-cols-5 gap-2">
              {/* Left col-span-3 delay 650ms */}
              <div
                className={`col-span-3 bg-white/70 backdrop-blur-xs rounded-xl p-4 border border-black/5 flex flex-col justify-between ${
                  isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
                }`}
                style={{ animationDelay: '650ms', animationFillMode: 'forwards' }}
              >
                <p className="font-jetbrains text-[10px] sm:text-xs text-black/80 leading-snug">
                  Consent is not a visual badge. It is verifiable browser execution control.
                </p>
                <div className="font-bubbledot text-3xl sm:text-4xl lg:text-5xl font-bold text-black mt-3">
                  Consent
                </div>
              </div>

              {/* Right col-span-2 delay 700ms */}
              <div
                className={`col-span-2 bg-white/70 backdrop-blur-xs rounded-xl p-3 border border-black/5 flex flex-col justify-between ${
                  isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
                }`}
                style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
              >
                <span className="font-jetbrains text-[9px] uppercase tracking-wider text-black/50">
                  HTTPS DSAR
                </span>
                <span className="font-jetbrains text-[10px] text-[#10B981] font-semibold">
                  TLS 1.3 Strict
                </span>
                <span className="font-jetbrains text-[8px] text-black/60 leading-tight">
                  Zero staging or HTTP leaks
                </span>
              </div>
            </div>

            {/* Full-width bottom row */}
            <div
              className={`w-full bg-white/60 backdrop-blur-xs rounded-xl px-4 py-3 border border-black/5 flex items-center justify-between font-jetbrains text-xs text-black/80 ${
                isRevealed ? 'animate-fade-up opacity-0' : 'opacity-0'
              }`}
              style={{ animationDelay: '750ms', animationFillMode: 'forwards' }}
            >
              <span className="font-bold tracking-wider text-black">L/03</span>
              <span className="text-[11px] sm:text-xs">Ship fast without regulatory debt.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Products;
