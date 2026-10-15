import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Check, CreditCard, Zap, Shield, Crown, AlertCircle, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

const PLANS = [
  {
    id: 'starter',
    name: 'Founder MVP',
    price: '$49',
    period: '/mo',
    badge: 'ACTIVE MVP · MONTHS 0–3',
    description: 'Automated compliance infrastructure for SaaS founders closing seed rounds or satisfying investors.',
    features: [
      'Up to 3 SaaS Sites Monitored',
      'The Web Crawler: Automated Tracker & Cookie Audit',
      'The CMP Script: Fast (<12KB) GDPR Prior-Consent Banner',
      'GDPR Privacy Policy Generator (React / Next.js / WP)',
      'Regional Risk Indicators (GDPR, CCPA, ePrivacy)',
      '50–60%+ Unit Economic Health & Sustainability',
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: 'growth',
    name: 'Growth SaaS',
    price: '$99',
    period: '/mo',
    badge: 'MONTHS 3–6 EXPANSION',
    description: 'For growing SaaS businesses expanding across US state laws and automated pull request workflows.',
    features: [
      'Up to 10 Live SaaS Domains',
      'GitHub Pull Request (PR) Generator (Zero-liability code review)',
      'Multi-State US Law Coverage (CCPA/CPRA, VCDPA, Colorado)',
      'WordPress & Shopify Automated Script Hooks',
      'Continuous Background Risk Crawler Scans',
      'Priority Email & Engineering Support',
    ],
    icon: Shield,
  },
  {
    id: 'agency',
    name: 'Agency White-Label Hub',
    price: '$199',
    period: '/mo + $15/site',
    badge: 'MONTHS 6–9 ROADMAP',
    description: 'Multi-tenant client portal and white-label governance for web & marketing agencies to resell.',
    features: [
      'Unlimited Agency Client Workspaces',
      'Custom White-Label Branding & Client Portals',
      'Client Billing & Reseller Invoicing Management',
      'Agency Sub-Account Admin Roles & Permissions',
      'Enterprise API Webhooks & Batch Site Crawler',
      'Dedicated Account Manager & SLA Guarantee',
    ],
    icon: Crown,
  },
];

export default function Billing() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, agency_name, plan')
        .eq('id', user?.id as string)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ plan: planId as any })
        .eq('id', user?.id as string);
      
      if (error) throw error;
      return { success: true, planId };
    },
    onSuccess: (data) => {
      const planName = PLANS.find(p => p.id === data.planId)?.name;
      toast.success(`${planName} Tier Selected!`);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error: any) => toast.error(error.message),
  });

  const currentPlan = (profile as any)?.plan || 'starter';

  return (
    <div className="space-y-12 font-mono">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Unit Economics Calibrated · $49/mo Minimum Floor
        </div>
        <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">BILLING & SUBSCRIPTION</h2>
        <p className="text-muted text-xs tracking-[0.15em] uppercase">
          AUTOMATED COMPLIANCE INFRASTRUCTURE PRICED WITH HEALTHY MARGINS AND ZERO SURPRISES.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-surface border border-white/10 p-8 relative overflow-hidden group">
        <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">CURRENT ACTIVE TIER</span>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em] uppercase text-accent">
                {PLANS.find(p => p.id === currentPlan)?.name || 'Founder MVP ($49/mo)'}
              </h3>
              <span className="px-2 py-1 bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest">
                ACTIVE PRODUCTION TIER
              </span>
            </div>
            <p className="text-xs text-muted font-sans">
              Unit economics locked: healthy 50–60%+ margin floor with edge-cached CDN scripts.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bracket-btn py-3 px-6 text-xs flex items-center gap-2">
              <span className="bracket-btn-inner"></span>
              <CreditCard className="h-4 w-4" />
              UPDATE PAYMENT METHOD
            </button>
          </div>
        </div>
      </div>

      {/* Execution Timeline (Step 3 Focus) */}
      <div className="bg-black/60 border border-white/10 p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-sans font-black tracking-wide uppercase text-white">
            PAPERLOO EXECUTION TIMELINE & TARGETS
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-surface p-5 border border-accent/40 relative">
            <div className="text-[10px] font-bold text-accent tracking-widest mb-1 uppercase">CURRENT: MONTHS 0–3</div>
            <h4 className="font-sans font-bold text-base text-white uppercase mb-2">The Focused MVP</h4>
            <p className="text-muted leading-relaxed mb-3">
              Selling exclusively to SaaS Founders for $49/mo. 3 Core Pillars: The Web Crawler + CMP Script + GDPR Policy Generator.
            </p>
            <div className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 inline-block">
              TARGET: 20 PAYING SITES
            </div>
          </div>

          <div className="bg-surface p-5 border border-white/10 relative opacity-85">
            <div className="text-[10px] font-bold text-muted tracking-widest mb-1 uppercase">PHASE 2: MONTHS 3–6</div>
            <h4 className="font-sans font-bold text-base text-white uppercase mb-2">Expansion & PR Engine</h4>
            <p className="text-muted leading-relaxed mb-3">
              GitHub Pull Request (PR) generator so customers click approve with zero site break liability. Expanded US State law scanning (CCPA/CPRA, Virginia).
            </p>
            <div className="text-[10px] font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-1 border border-cyan-500/20 inline-block">
              TIER: $99/MO GROWTH SAAS
            </div>
          </div>

          <div className="bg-surface p-5 border border-white/10 relative opacity-70">
            <div className="text-[10px] font-bold text-muted tracking-widest mb-1 uppercase">PHASE 3: MONTHS 6–9</div>
            <h4 className="font-sans font-bold text-base text-white uppercase mb-2">Agency White-Label Hub</h4>
            <p className="text-muted leading-relaxed mb-3">
              Multi-tenant client management for dev and design agencies to white-label and resell compliance infrastructure.
            </p>
            <div className="text-[10px] font-bold text-accent uppercase bg-accent/10 px-2.5 py-1 border border-accent/20 inline-block">
              TIER: $199/MO + $15/SITE
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "bg-surface border p-8 flex flex-col justify-between relative transition-all duration-300",
                plan.popular ? "border-accent shadow-[0_0_30px_rgba(200,241,53,0.15)]" : "border-white/10 hover:border-white/30"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-accent text-black text-[9px] font-black uppercase tracking-widest px-3 py-1">
                  RECOMMENDED FOR SAAS FOUNDERS
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-bold text-accent bg-accent/10 px-2.5 py-0.5 border border-accent/20">
                    {plan.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-sans font-extrabold uppercase">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-sans font-black tracking-tight text-white">{plan.price}</span>
                    <span className="text-muted text-xs">{plan.period}</span>
                  </div>
                  <p className="text-muted text-xs mt-3 leading-relaxed font-sans">{plan.description}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">INCLUDED INFRASTRUCTURE:</p>
                  <ul className="space-y-2.5 text-xs text-white/80">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => updatePlanMutation.mutate(plan.id)}
                  disabled={updatePlanMutation.isPending || isCurrent}
                  className={cn(
                    "bracket-btn w-full py-3 text-xs uppercase tracking-widest transition-all",
                    plan.popular ? "border-accent text-accent" : "",
                    isCurrent ? "opacity-50 cursor-default" : "hover:scale-[1.02]"
                  )}
                >
                  <span className="bracket-btn-inner"></span>
                  {isCurrent ? "CURRENT ACTIVE TIER" : `SELECT ${plan.name.toUpperCase()}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory UPL Legal Notice */}
      <div className="bg-surface border border-white/10 p-6 rounded-lg text-left">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">MANDATORY STATUTORY NOTICE</span>
        </div>
        <p className="text-xs text-muted leading-relaxed uppercase tracking-wider font-mono">
          "Paperloo provides compliance automation software. It does not provide legal advice and is not a law firm. Generated documents are templates and must be reviewed by qualified counsel."
        </p>
      </div>
    </div>
  );
}
