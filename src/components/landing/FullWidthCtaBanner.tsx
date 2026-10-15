import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';

export default function FullWidthCtaBanner() {
  const { user } = useAuthStore();

  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden border-t border-white/10">
      {/* Background neon ambient aura */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-emerald-500/10 to-cyan-500/10 opacity-70 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-accent/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl p-10 sm:p-16 md:p-20 bg-surface border border-accent/40 shadow-[0_0_50px_rgba(200,241,53,0.15)] relative overflow-hidden text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5 font-mono text-[10px] sm:text-xs font-bold text-accent tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            THE STANDARD FOR MODERN WEB PLATFORMS
          </div>

          {/* Heading matching Palmo's "THE BOX OF HEALTH." */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-black tracking-tighter uppercase text-white leading-none mb-6">
            THE FLOW OF <br className="hidden sm:inline" />
            <span className="text-accent italic drop-shadow-[0_0_30px_rgba(200,241,53,0.4)]">
              TOTAL COMPLIANCE.
            </span>
          </h2>

          <p className="text-white/80 text-xs sm:text-sm md:text-base font-mono uppercase tracking-widest max-w-2xl mb-10 leading-relaxed">
            All your disclosures, automated tracker blocks, and global statutory protections in one seamless edge infrastructure. Protect all client websites in 3 minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bracket-btn py-4 px-8 text-xs font-bold border-accent bg-accent text-black hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,241,53,0.4)]"
              >
                <span className="bracket-btn-inner" />
                ENTER OPERATOR DASHBOARD <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="w-full sm:w-auto bracket-btn py-4 px-8 text-xs font-bold border-accent bg-accent text-black hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,241,53,0.4)]"
              >
                <span className="bracket-btn-inner" />
                START FREE PILOT NOW <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/trust"
              className="w-full sm:w-auto bracket-btn py-4 px-8 text-xs font-bold border-white/30 text-white hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
            >
              <span className="bracket-btn-inner" />
              SECURITY WHITEPAPER
            </Link>
          </div>

          {/* Assurance bullet tags */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-[10px] sm:text-xs font-mono text-white/60 uppercase">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SOC2-Aligned Governance
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" /> 2ms Edge CDN Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> 100% White-Label Agency Ready
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
