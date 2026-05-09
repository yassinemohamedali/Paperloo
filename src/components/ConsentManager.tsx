
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, ExternalLink, ChevronRight } from 'lucide-react';
import { SmartScanner } from '../services/scannerService';

interface ConsentState {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
}

export default function ConsentManager() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');
  const [consent, setConsent] = useState<ConsentState>({
    ad_storage: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasConsent = localStorage.getItem('pl_consent_v2');
      if (!hasConsent) setShow(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = async (type: 'ALL' | 'CUSTOM' | 'REJECT') => {
    let finalState = { ...consent };
    
    if (type === 'ALL') {
      finalState = {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted'
      };
    } else if (type === 'REJECT') {
      finalState = {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted'
      };
    }

    // SIGNAL GOOGLE CONSENT MODE V2
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', finalState);
    }

    // LOG TO AUDIT DATABASE
    await SmartScanner.recordConsentLog('demo-site-001', finalState);
    
    localStorage.setItem('pl_consent_v2', JSON.stringify(finalState));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[999] md:max-w-2xl md:left-auto"
        >
          <div className="bg-black border border-white/10 p-6 md:p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent/20">
              <div className="h-full bg-accent w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-white font-sans font-black tracking-tighter text-xl uppercase mb-2 italic">
                  Infrastructure Governance <span className="text-accent underline decoration-1">Active</span>
                </h3>
                <p className="text-muted text-xs tracking-[0.1em] leading-relaxed uppercase">
                  This deployment utilizes Paperloo Infrastructure to manage global data disclosures. 
                  We synchronize your governance preferences across our low-latency compliance network.
                </p>
              </div>
            </div>

            {mode === 'ADVANCED' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4 mb-8 border-t border-white/5 pt-6"
              >
                {[
                  { id: 'ad_storage', label: 'MARKETING & ADVERTISING', desc: 'Allows cookies for ad personalization via IAB TCF.' },
                  { id: 'analytics_storage', label: 'STATISTICAL ANALYSIS', desc: 'Aggregated metrics for system performance monitoring.' },
                  { id: 'personalization_storage', label: 'USER PERSONALIZATION', desc: 'Remembers environment configurations.' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-white mb-1">{item.label}</p>
                      <p className="text-[9px] text-muted tracking-wider uppercase">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setConsent(prev => ({ ...prev, [item.id]: prev[item.id as keyof ConsentState] === 'granted' ? 'denied' : 'granted' }))}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors duration-300",
                        consent[item.id as keyof ConsentState] === 'granted' ? "bg-accent" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 rounded-full bg-black transition-all duration-300",
                        consent[item.id as keyof ConsentState] === 'granted' ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setMode(mode === 'SIMPLE' ? 'ADVANCED' : 'SIMPLE')}
                  className="text-[9px] font-bold tracking-[0.2em] text-muted hover:text-accent transition-colors flex items-center gap-2 uppercase"
                >
                  {mode === 'SIMPLE' ? 'Detailed Configuration' : 'Standard View'}
                  <ChevronRight className="w-3 h-3" />
                </button>
                <a href="/legal" target="_blank" className="text-[9px] font-bold tracking-[0.2em] text-muted hover:text-accent transition-colors flex items-center gap-2 uppercase">
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => handleAction('REJECT')}
                  className="px-6 py-3 border border-white/10 text-[9px] font-bold tracking-widest hover:bg-white/5 transition-all text-white w-full sm:w-auto uppercase"
                >
                  Decline
                </button>
                <button 
                  onClick={() => handleAction('ALL')}
                  className="px-8 py-3 bg-accent text-black text-[9px] font-black tracking-widest hover:bg-[#b0d52a] shadow-[0_0_20px_rgba(200,241,53,0.3)] transition-all w-full sm:w-auto uppercase"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
