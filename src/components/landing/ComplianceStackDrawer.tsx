import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Check, Trash2, ArrowRight, Layers, Lock, Sparkles } from 'lucide-react';
import { useComplianceStackStore, ALL_STACK_MODULES } from '@/src/store/complianceStackStore';
import { useAuthStore } from '@/src/store/authStore';

export default function ComplianceStackDrawer() {
  const { 
    isDrawerOpen, 
    setDrawerOpen, 
    selectedModuleIds, 
    toggleModule, 
    clearStack,
    activePack,
    setActivePack
  } = useComplianceStackStore();

  const { user } = useAuthStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, setDrawerOpen]);

  const selectedModules = ALL_STACK_MODULES.filter((m) =>
    selectedModuleIds.includes(m.id)
  );

  const totalPossible = ALL_STACK_MODULES.length;
  const coveragePercent = Math.round((selectedModules.length / totalPossible) * 100);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* Slide-in Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[210] w-full max-w-md bg-[#0a0a0a] border-l border-white/20 shadow-2xl flex flex-col text-white font-mono"
            role="dialog"
            aria-modal="true"
            aria-label="Compliance Stack Drawer"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-sans font-black tracking-tight uppercase">
                    ACTIVE COMPLIANCE STACK
                  </h2>
                  <p className="text-[10px] text-white/50">
                    {selectedModules.length} OF {totalPossible} POLICIES ARMED
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-accent transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Statutory Protection Progress Gauge */}
            <div className="p-6 bg-white/[0.02] border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  Statutory Health Gauge
                </span>
                <span className={`font-mono font-bold ${coveragePercent === 100 ? 'text-emerald-400' : 'text-accent'}`}>
                  {coveragePercent}% PROTECTED
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-emerald-400 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(200,241,53,0.5)]"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed">
                {coveragePercent === 100
                  ? 'All 4 critical regulatory pillars armed. Zero legal vulnerability detected across all target regions.'
                  : `Add ${totalPossible - selectedModules.length} more policy module to achieve complete 100% multi-jurisdiction immunity.`}
              </p>

              {/* Pack Radio Selector Pills (Palmo pattern) */}
              <div className="pt-2">
                <span className="text-[9px] text-white/40 tracking-widest uppercase block mb-2 font-bold">
                  Select Agency Tier Tier-Pill:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['starter', 'growth', 'enterprise'] as const).map((pack) => (
                    <button
                      key={pack}
                      onClick={() => setActivePack(pack)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        activePack === pack
                          ? 'bg-accent text-black border-accent shadow-[0_0_12px_rgba(200,241,53,0.3)]'
                          : 'bg-black/40 text-white/70 border-white/15 hover:border-white/40'
                      }`}
                    >
                      {pack}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stack Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedModules.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-sans font-bold uppercase text-white">Your Stack is Empty</p>
                    <p className="text-xs text-white/50 max-w-xs mx-auto">
                      Click "+ ADD TO STACK" on any policy card in the showcase to arm compliance for your site.
                    </p>
                  </div>
                </div>
              ) : (
                selectedModules.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-black/60 border border-white/15 hover:border-accent/40 transition-all group flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-xs font-sans font-bold text-white uppercase group-hover:text-accent transition-colors">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-white/60 leading-relaxed font-mono">
                        {item.tagline}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px] font-mono">
                        <span className="bg-white/10 text-white/80 px-2 py-0.5 rounded border border-white/10">
                          {item.jurisdiction}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {item.latency}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleModule(item.id)}
                      className="text-white/40 hover:text-red-400 transition-colors p-1"
                      title="Remove from stack"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-black/80 backdrop-blur-md space-y-3">
              {selectedModules.length > 0 && (
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">Active Subscriptions</span>
                  <button
                    onClick={clearStack}
                    className="text-[10px] text-white/40 hover:text-red-400 uppercase underline transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className="bracket-btn w-full py-3.5 text-center flex items-center justify-center gap-2 border-accent text-accent hover:bg-accent hover:text-black transition-all font-bold text-xs"
                >
                  <span className="bracket-btn-inner" />
                  DEPLOY ACTIVE STACK NOW <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  onClick={() => setDrawerOpen(false)}
                  className="bracket-btn w-full py-3.5 text-center flex items-center justify-center gap-2 border-accent text-accent hover:bg-accent hover:text-black transition-all font-bold text-xs"
                >
                  <span className="bracket-btn-inner" />
                  GET COMPLETE STACK (FREE PILOT) <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <p className="text-[9px] text-center text-white/40 uppercase tracking-wider">
                Instant 1-Line Embed Script · No Credit Card Required
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
