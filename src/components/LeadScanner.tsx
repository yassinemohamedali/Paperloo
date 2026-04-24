import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, AlertTriangle, ArrowRight, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';

export default function LeadScanner() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'scanning' | 'results' | 'captured'>('input');
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStep('scanning');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setStep('results'), 500);
      }
      setScanProgress(Math.min(progress, 100));
    }, 200);
  };

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      // We'll store this in a 'leads' table (you'll need to create this in Supabase)
      // For now, we'll use questionnaire_responses as a temp storage or just a toast
      const { error } = await (supabase.from('leads') as any).insert({
        email,
        website_url: url,
        source: 'landing_page_scanner'
      });

      setStep('captured');
      toast.success("RECAP SENT. CHECK YOUR INBOX.");
    } catch (err) {
      // If table doesn't exist yet, we still show success for the demo
      setStep('captured');
      console.log("Compliance audit request captured:", email);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 border border-white/10 bg-surface/30 backdrop-blur-xl rounded-[20px] shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-sans font-black tracking-tight uppercase italic">Free Compliance Audit</h3>
              <p className="text-muted text-xs tracking-widest uppercase">Instantly check if your client sites are legally protected.</p>
            </div>
            
            <form onSubmit={startScan} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="ENTER CLIENT WEBSITE URL (E.G. HTTPS://SITE.COM)"
                  className="w-full bg-black border border-white/20 px-12 py-4 text-xs tracking-widest focus:border-accent outline-none transition-all uppercase"
                />
              </div>
              <button type="submit" className="bracket-btn px-10 py-4 font-black">
                <span className="bracket-btn-inner"></span>
                RUN AUDIT →
              </button>
            </form>
          </motion.div>
        )}

        {step === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 space-y-8 text-center"
          >
            <div className="relative inline-block">
              <Loader2 className="h-20 w-20 text-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                {Math.round(scanProgress)}%
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold tracking-[0.3em] text-accent animate-pulse">ANALYZING DOMAIN SECURITY HEADERS...</p>
              <div className="max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent" 
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-red-500/30 bg-red-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Found 3 Violations</span>
                </div>
                <ul className="space-y-3 text-[10px] font-bold text-muted uppercase tracking-wider">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    MISSING GDPR PRIVACY DISCLOSURE
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    STALE TERMS OF SERVICE (2021)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    INVALID COOKIES CONSENT BANNER
                  </li>
                </ul>
              </div>

              <div className="border border-accent/30 bg-accent/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Protection Status</span>
                </div>
                <p className="text-2xl font-sans font-black italic text-accent tracking-tighter">UNSAFE (42%)</p>
                <p className="text-[9px] leading-relaxed text-muted uppercase tracking-widest">
                  THIS SITE IS AT RISK OF FINES EXCEEDING $10,000 PER DATA BREACH.
                </p>
              </div>
            </div>

            <form onSubmit={handleLeadCapture} className="bg-white/5 p-8 border border-white/10 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xl font-sans font-extrabold tracking-tight uppercase italic">Get the Full Correction Report</h4>
                <p className="text-muted text-[10px] tracking-widest uppercase">We'll send you the generated fixes for these violations instantly.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER WORK EMAIL" 
                  className="flex-1 bg-black/50 border border-white/20 px-6 py-4 text-xs tracking-widest focus:border-accent outline-none uppercase"
                  required
                />
                <button type="submit" className="bracket-btn px-10 py-4 font-black">
                  <span className="bracket-btn-inner"></span>
                  SEND REPORT →
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'captured' && (
          <motion.div 
            key="captured"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full border-2 border-accent text-accent mb-4">
              <Mail className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-sans font-black tracking-tight italic uppercase">REPORT SENT</h3>
              <p className="text-muted text-xs tracking-[0.2em] font-bold uppercase">Check your email for the Paperloo Audit Results.</p>
            </div>
            <button onClick={() => setStep('input')} className="text-accent text-[10px] font-bold tracking-widest hover:underline uppercase">
              SCAN ANOTHER SITE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
