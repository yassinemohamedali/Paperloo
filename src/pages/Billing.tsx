import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Check, CreditCard, Zap, Shield, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'Perfect for small agencies starting out.',
    features: [
      'Up to 3 Client Sites',
      'Basic Compliance Monitoring',
      'Standard Document Templates',
      'Email Support',
    ],
    icon: Zap,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$149',
    period: '/mo',
    description: 'The standard for growing agencies.',
    features: [
      'Up to 20 Client Sites',
      'Real-time Compliance Alerts',
      'Custom White-labeling',
      'Priority Support',
      'Advanced Risk Assessment',
    ],
    icon: Shield,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$499',
    period: '/mo',
    description: 'Scale your compliance operations.',
    features: [
      'Unlimited Client Sites',
      'API Access',
      'Dedicated Account Manager',
      'Custom Legal Review',
      'SLA Guarantee',
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
      const resp = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user?.id })
      });
      
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Checkout failed');
      }
      
      const { url } = await resp.json();
      window.location.href = url;
    },
    onSuccess: () => {
      toast.info('Redirecting to checkout...');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const currentPlan = (profile as any)?.plan || 'starter';

  return (
    <div className="space-y-12 font-mono">
      <div className="space-y-4">
        <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">BILLING & SUBSCRIPTION</h2>
        <p className="text-muted text-xs tracking-[0.15em] uppercase">MANAGE YOUR PLAN AND PAYMENT METHODS.</p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-surface border border-white/10 p-8 relative overflow-hidden group">
        <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">CURRENT PLAN</span>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em] uppercase text-accent">{currentPlan}</h3>
              <span className="px-2 py-1 bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest">ACTIVE</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bracket-btn py-3 px-6 text-xs flex items-center gap-2">
              <span className="bracket-btn-inner"></span>
              <CreditCard className="h-4 w-4" />
              UPDATE PAYMENT
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "bg-surface border p-10 flex flex-col relative overflow-hidden transition-all duration-300 group",
              plan.popular ? "border-accent shadow-[0_0_40px_rgba(200,241,53,0.1)]" : "border-white/10 hover:border-white/30",
              currentPlan === plan.id && "ring-2 ring-accent ring-offset-4 ring-offset-bg"
            )}
          >
            <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
            
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-accent text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest">
                MOST POPULAR
              </div>
            )}

            <div className="space-y-6 relative z-10 flex-1">
              <div className="h-12 w-12 rounded-none bg-white/5 flex items-center justify-center mb-8">
                <plan.icon className={cn("h-6 w-6", plan.popular ? "text-accent" : "text-white")} />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-sans font-extrabold tracking-[0.04em]">{plan.price}</span>
                  <span className="text-muted text-xs uppercase tracking-widest">{plan.period}</span>
                </div>
                <p className="text-muted text-xs leading-relaxed uppercase tracking-wider">{plan.description}</p>
              </div>

              <ul className="space-y-4 py-8 border-t border-white/5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-white transition-colors">
                    <Check className="h-3 w-3 text-accent mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => updatePlanMutation.mutate(plan.id)}
              disabled={currentPlan === plan.id || updatePlanMutation.isPending}
              className={cn(
                "bracket-btn w-full py-4 mt-8 relative z-10",
                currentPlan === plan.id ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <span className="bracket-btn-inner"></span>
              {currentPlan === plan.id ? 'CURRENT PLAN' : `UPGRADE TO ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ / Info */}
      <div className="p-12 border border-white/5 bg-white/[0.01] text-center space-y-4">
        <p className="text-muted text-xs tracking-[0.15em] uppercase leading-relaxed max-w-2xl mx-auto">
          NEED A CUSTOM PLAN FOR A LARGE ENTERPRISE? CONTACT OUR SALES TEAM FOR TAILORED SOLUTIONS AND VOLUME DISCOUNTS.
        </p>
        <button className="text-accent text-[10px] font-black uppercase tracking-[0.2em] hover:underline">
          CONTACT SALES →
        </button>
      </div>
    </div>
  );
}
