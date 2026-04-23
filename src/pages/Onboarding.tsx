import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Globe, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const JURISDICTIONS = ['GDPR (EU)', 'CCPA (California)', 'PIPEDA (Canada)', 'LGPD (Brazil)', 'VCDPA (Virginia)'];

export default function Onboarding() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  const [agencyName, setAgencyName] = useState('');
  const [siteCount, setSiteCount] = useState('');
  const [siteData, setSiteData] = useState({
    name: '',
    url: '',
    jurisdictions: [] as string[]
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // Update profile - ensure we have at least a default name
      const finalAgencyName = agencyName.trim() || 'My Agency';
      
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({ 
          agency_name: finalAgencyName
        } as any)
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // Create first site if data provided
      if (siteData.name && siteData.url) {
        const { error: siteError } = await (supabase
          .from('sites') as any)
          .insert({
            agency_id: user.id,
            name: siteData.name,
            url: siteData.url,
            jurisdictions: siteData.jurisdictions,
            status: 'pending'
          } as any);
        
        if (siteError) throw siteError;
      }
    },
    onSuccess: async () => {
      // Use await to ensure invalidation is processed
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding-check'] });
      
      toast.success('Onboarding complete! Welcome to Paperloo.');
      // Small delay to ensure state propagates
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const nextStep = () => setStep(s => s + 1);
  const skip = () => completeOnboardingMutation.mutate();

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-2xl space-y-12 relative z-10">
        {/* Progress Bar */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 transition-colors duration-500 ${i <= step ? 'bg-accent' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">WELCOME TO PAPERLOO</h2>
                <p className="text-muted text-xs tracking-[0.15em] uppercase">STEP 1: WHAT'S YOUR AGENCY NAME?</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Building2 className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted group-focus-within:text-accent transition-colors" />
                  <input 
                    type="text" 
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 pl-8 py-4 text-xl focus:border-accent outline-none transition-colors uppercase" 
                    placeholder="ACME CREATIVE" 
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={nextStep}
                  disabled={!agencyName}
                  className="bracket-btn flex-1 py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="bracket-btn-inner"></span>
                  NEXT STEP
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={skip} className="text-muted text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                  SKIP
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">SCALE ASSESSMENT</h2>
                <p className="text-muted text-xs tracking-[0.15em] uppercase">STEP 2: HOW MANY CLIENT SITES DO YOU MANAGE?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['1-5', '6-15', '16-30', '30+'].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSiteCount(count)}
                    className={`p-6 border text-left transition-all ${siteCount === count ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <span className="text-xl font-sans font-extrabold tracking-widest">{count}</span>
                    <p className="text-[10px] text-muted uppercase tracking-widest mt-1">CLIENT SITES</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={nextStep}
                  disabled={!siteCount}
                  className="bracket-btn flex-1 py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="bracket-btn-inner"></span>
                  NEXT STEP
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={skip} className="text-muted text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                  SKIP
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">FIRST DEPLOYMENT</h2>
                <p className="text-muted text-xs tracking-[0.15em] uppercase">STEP 3: ADD YOUR FIRST CLIENT SITE</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SITE NAME</label>
                  <input 
                    type="text" 
                    value={siteData.name}
                    onChange={(e) => setSiteData({...siteData, name: e.target.value})}
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase" 
                    placeholder="CLIENT PROJECT A" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SITE URL</label>
                  <input 
                    type="text" 
                    value={siteData.url}
                    onChange={(e) => setSiteData({...siteData, url: e.target.value})}
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase" 
                    placeholder="EXAMPLE.COM" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">JURISDICTIONS</label>
                  <div className="grid grid-cols-2 gap-3">
                    {JURISDICTIONS.map(j => (
                      <label key={j} className="flex items-center gap-3 p-3 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                        <input
                          type="checkbox"
                          checked={siteData.jurisdictions.includes(j)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSiteData({...siteData, jurisdictions: [...siteData.jurisdictions, j]});
                            } else {
                              setSiteData({...siteData, jurisdictions: siteData.jurisdictions.filter(x => x !== j)});
                            }
                          }}
                          className="accent-accent"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{j}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={() => completeOnboardingMutation.mutate()}
                  disabled={completeOnboardingMutation.isPending}
                  className="bracket-btn flex-1 py-4 flex items-center justify-center gap-2"
                >
                  <span className="bracket-btn-inner"></span>
                  {completeOnboardingMutation.isPending ? 'FINALIZING...' : 'COMPLETE SETUP'}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button onClick={skip} className="text-muted text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                  SKIP
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
