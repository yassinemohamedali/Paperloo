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
      // Functional upgrade for demo purposes
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ plan: planId as any })
        .eq('id', user?.id as string);
      
      if (error) throw error;
      return { success: true, planId };
    },
    onSuccess: (data) => {
      const planName = PLANS.find(p => p.id === data.planId)?.name;
      toast.success(`${planName} Plan Activated!`);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
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

      {/* Exclusive Enterprise Aura */}
      <div className="bg-surface border border-accent/20 p-12 text-center space-y-8 relative overflow-hidden group">
        <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
        
        <div className="mx-auto h-16 w-16 bg-accent/10 flex items-center justify-center border border-accent/30 relative z-10">
          <Crown className="h-8 w-8 text-accent" />
        </div>

        <div className="space-y-4 relative z-10 max-w-2xl mx-auto">
          <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em] uppercase text-white">EARLY ACCESS PROGRAM</h3>
          <p className="text-muted text-xs leading-relaxed uppercase tracking-wider">
            AUTOMATED CHECKOUT SESSIONS ARE TEMPORARILY PAUSED. PAPERLOO IS CURRENTLY OPERATING AS AN EXCLUSIVE, INVITE-ONLY ENTERPRISE ENGINE.
            <br/><br/>
            YOUR CURRENT ACCOUNT HAS BEEN GRANTED PROVISIONAL INFRASTRUCTURE ACCESS DURING THIS PRE-RELEASE PHASE.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/5">
           <button className="bracket-btn py-4 px-12 text-xs font-black text-accent border-accent">
              <span className="bracket-btn-inner"></span>
              REQUEST ENTERPRISE UPGRADE
            </button>
        </div>
      </div>
    </div>
  );
}
