import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Globe, ArrowRight, ArrowLeft, CheckCircle2, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

const JURISDICTIONS = [
  { id: 'GDPR (EU & UK)', label: 'GDPR (EU & UK)', desc: 'General Data Protection Regulation' },
  { id: 'CCPA / CPRA (California)', label: 'CCPA / CPRA (California)', desc: 'California Consumer Privacy Act' },
  { id: 'PIPEDA (Canada)', label: 'PIPEDA (Canada)', desc: 'Personal Information Protection' },
  { id: 'POPIA (South Africa)', label: 'POPIA (South Africa)', desc: 'Protection of Personal Information' },
  { id: 'LGPD (Brazil)', label: 'LGPD (Brazil)', desc: 'Lei Geral de Proteção de Dados' },
  { id: 'VCDPA (Virginia)', label: 'VCDPA (Virginia)', desc: 'Virginia Consumer Data Protection' },
  { id: 'Privacy Act (Australia)', label: 'Privacy Act (Australia)', desc: 'Australian Privacy Principles' },
  { id: 'Law 25 (Quebec)', label: 'Law 25 (Quebec)', desc: 'Modernizing Legislative Provisions' },
];

const SITE_TIERS = [
  { count: '1-5', title: 'Boutique Agency', desc: '1 to 5 client websites managed' },
  { count: '6-15', title: 'Growth Agency', desc: '6 to 15 client websites managed' },
  { count: '16-30', title: 'Scale Agency', desc: '16 to 30 client websites managed' },
  { count: '30+', title: 'Enterprise Partner', desc: '30+ client websites & white-label' },
];

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
    jurisdictions: ['GDPR (EU & UK)', 'CCPA / CPRA (California)'] as string[]
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

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
            url: siteData.url.startsWith('http') ? siteData.url : `https://${siteData.url}`,
            jurisdictions: siteData.jurisdictions,
            status: 'pending'
          } as any);
        
        if (siteError) throw siteError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding-check'] });
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      
      toast.success('Onboarding complete. Welcome to Paperloo.');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 400);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const nextStep = () => {
    if (step === 1 && !agencyName.trim()) {
      toast.error("Please enter your agency name to continue.");
      return;
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
  };
  
  const skip = () => completeOnboardingMutation.mutate();

  const toggleJurisdiction = (j: string) => {
    setSiteData(prev => {
      const exists = prev.jurisdictions.includes(j);
      return {
        ...prev,
        jurisdictions: exists 
          ? prev.jurisdictions.filter(x => x !== j)
          : [...prev.jurisdictions, j]
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-xl mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-white">Paperloo</span>
              <span className="text-xs text-slate-400 block font-normal">Agency Onboarding</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-400">Step {step} of 3</span>
            <span className="text-xs text-slate-500 block">
              {step === 1 ? 'Agency Profile' : step === 2 ? 'Portfolio Scale' : 'First Domain'}
            </span>
          </div>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden flex gap-1 p-0.5">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-300",
                i <= step ? "bg-emerald-500" : "bg-slate-800"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome to Paperloo
                </h1>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  Establish your agency workspace to manage client compliance policies, cookie consent banners, and statutory audits from a single unified portal.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Agency or Organization Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                  <input 
                    type="text" 
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full h-12 rounded-lg border border-slate-800 bg-slate-900/90 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-400/40 placeholder:font-normal focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-colors" 
                    placeholder="e.g. Apex Digital Interactive" 
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500">
                  This will appear on your internal team dashboard and client report exports.
                </p>
              </div>

              {/* Grouped Action Navigation - Constrained within max-w-xl */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={skip}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Configure later
                </button>
                <button 
                  type="button"
                  onClick={nextStep}
                  disabled={!agencyName.trim()}
                  className="bracket-btn-accent px-6 py-2.5 flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Portfolio Scale Assessment
                </h1>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  How many client websites or web applications does your agency actively deploy and maintain?
                </p>
              </div>

              {/* Interactive Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {SITE_TIERS.map((tier) => {
                  const isSelected = siteCount === tier.count;
                  return (
                    <button
                      key={tier.count}
                      type="button"
                      onClick={() => setSiteCount(tier.count)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between",
                        isSelected 
                          ? "bg-slate-800/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20" 
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-lg font-bold text-white tracking-tight">
                          {tier.count} <span className="text-xs font-normal text-slate-400">Sites</span>
                        </span>
                        {/* Radio / Check Indicator Dot */}
                        <div className={cn(
                          "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                          isSelected 
                            ? "border-emerald-500 bg-emerald-500 text-white" 
                            : "border-slate-700 bg-slate-900"
                        )}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{tier.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{tier.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Grouped Action Navigation */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={skip}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Skip
                  </button>
                  <button 
                    type="button"
                    onClick={nextStep}
                    disabled={!siteCount}
                    className="bracket-btn-accent px-6 py-2.5 flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Add Initial Client Property
                </h1>
                <p className="text-sm text-slate-400 font-normal leading-relaxed">
                  Enter your first client website to generate compliance policies and establish real-time regulatory monitoring.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Client Website Name
                  </label>
                  <input 
                    type="text" 
                    value={siteData.name}
                    onChange={(e) => setSiteData({...siteData, name: e.target.value})}
                    className="w-full h-11 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 text-sm text-slate-100 placeholder:text-slate-400/40 placeholder:font-normal focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-colors" 
                    placeholder="e.g. Northwind Health" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Domain URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input 
                      type="text" 
                      value={siteData.url}
                      onChange={(e) => setSiteData({...siteData, url: e.target.value})}
                      className="w-full h-11 rounded-lg border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-slate-400/40 placeholder:font-normal focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-colors" 
                      placeholder="e.g. https://northwindhealth.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Target Legal Frameworks
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {siteData.jurisdictions.length} selected
                    </span>
                  </div>
                  
                  {/* Modern Multi-Select Enterprise Checkbox Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {JURISDICTIONS.map(item => {
                      const isChecked = siteData.jurisdictions.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleJurisdiction(item.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                            isChecked 
                              ? "bg-slate-800/80 border-emerald-500/80 text-white shadow-sm" 
                              : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:border-slate-700"
                          )}
                        >
                          <div className={cn(
                            "h-4 w-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors",
                            isChecked 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "border-slate-700 bg-slate-950/50"
                          )}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-medium block truncate text-slate-200">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {item.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Grouped Action Navigation */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={skip}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Skip
                  </button>
                  <button 
                    type="button"
                    onClick={() => completeOnboardingMutation.mutate()}
                    disabled={completeOnboardingMutation.isPending}
                    className="bracket-btn-accent px-6 py-2.5 flex items-center gap-2"
                  >
                    {completeOnboardingMutation.isPending ? (
                      <span>Initializing...</span>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
