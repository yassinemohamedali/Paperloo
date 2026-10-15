import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, Zap, Layers, Sparkles, Building, Lock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function PricingAndRoadmap() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: 'POPULAR FOR SAAS FOUNDERS',
      badgeColor: 'bg-[#bef264]/15 text-[#bef264] border-[#bef264]/30',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      period: '/month',
      description: 'The focused MVP compliance engine for SaaS founders closing seed rounds or launching products.',
      features: [
        '1 Monitored Web Property',
        'Real-Time Web Crawler & Tracker Sniffer',
        'Zero-Code CMP Cookie Banner (<4.2 kB)',
        'GDPR Privacy Policy Generator (Markdown & HTML)',
        'GitHub Pull Request (PR) Workflow for Safe Deploys',
        'Regional Risk Indicators (GDPR, CCPA, APPs)',
        'Standard Email Support',
      ],
      ctaText: 'Get Started ($49/mo)',
      ctaVariant: 'primary',
      active: true,
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'MULTI-PRODUCT SAAS',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      price: billingCycle === 'monthly' ? '$99' : '$79',
      period: '/month',
      description: 'Expanded compliance for multi-repo startups and high-traffic consumer web applications.',
      features: [
        'Up to 5 Monitored Web Properties',
        'Continuous Automated Weekly Crawls',
        'Full Multi-Jurisdiction Suite (GDPR, CCPA/CPRA, Law 25)',
        'Automated GitHub Pull Request Generation',
        'Prior-Consent Infraction Alerting',
        'Priority Technical Support',
      ],
      ctaText: 'Start Growth Trial',
      ctaVariant: 'secondary',
      active: true,
    },
    {
      id: 'agency',
      name: 'Agency White-Label Hub',
      badge: 'ROADMAP · MONTH 6+',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      price: '$199',
      period: '/mo + $15/site',
      description: 'Multi-tenant white-labeled compliance portal engineered for web development & marketing agencies.',
      features: [
        'Multi-Client Unified Command Center',
        '100% White-Label (Custom Logo, Colors, Domain)',
        'Client-Facing Read-Only Compliance Portals',
        'Multi-Seat Role-Based Access Control',
        'Bulk Domain Crawler & Reporting',
      ],
      ctaText: 'Join Agency Waitlist',
      ctaVariant: 'waitlist',
      active: false,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-16">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#bef264] uppercase bg-[#bef264]/10 border border-[#bef264]/20 px-3.5 py-1.5 rounded-full inline-block">
          PRICING & UNIT ECONOMICS
        </span>
        <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-white uppercase">
          Predictable Pricing. <br className="hidden sm:block" />
          <span className="text-[#bef264] italic">Zero Retainer Headaches.</span>
        </h2>
        <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Skip $500/hr law firm retainers. Deploy real-time compliance infrastructure starting at $49/mo with continuous monitoring.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <div className="bg-[#18181c] border border-zinc-800 p-1 rounded-xl flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-1.5 rounded-lg font-bold transition-all",
                billingCycle === 'monthly' ? "bg-[#bef264] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={cn(
                "px-4 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                billingCycle === 'annual' ? "bg-[#bef264] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              Annual Billing
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative bg-[#0c0c0e] border rounded-2xl md:rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300",
              plan.id === 'starter' 
                ? "border-[#bef264]/60 shadow-[0_0_30px_rgba(190,242,100,0.15)] ring-1 ring-[#bef264]/30" 
                : "border-zinc-800/90 hover:border-zinc-700"
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-sans font-bold text-white uppercase tracking-tight">
                  {plan.name}
                </h3>
                <span className={cn("text-[9px] font-mono font-bold px-2.5 py-1 rounded-md border", plan.badgeColor)}>
                  {plan.badge}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-sans font-black text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {plan.period}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-3 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="h-px bg-zinc-800/80 w-full" />

              <div className="space-y-3 font-mono text-xs">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  WHAT IS INCLUDED:
                </span>
                <ul className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-zinc-300">
                      <Check className="w-4 h-4 text-[#bef264] shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              {plan.active ? (
                <Link
                  to="/signup"
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 text-center",
                    plan.id === 'starter'
                      ? "bg-[#bef264] hover:bg-[#a3e635] text-black shadow-lg"
                      : "bg-[#18181c] hover:bg-zinc-800 text-white border border-zinc-700"
                  )}
                >
                  {plan.ctaText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => alert("You've been added to the Agency Hub Priority Waitlist!")}
                    className="w-full py-3 px-4 rounded-xl font-mono font-bold text-xs bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    {plan.ctaText}
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center font-mono">
                    Staged release scheduled for Months 6–9.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3-Phase Execution Roadmap Timeline */}
      <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl md:rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#bef264]">
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
              STRATEGIC EXECUTION TIMELINE
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight">
            The 3-Phase Focused Roadmap
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            How Paperloo achieves sustainable unit economics, low burn, and high defensibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Phase 1 */}
          <div className="bg-[#121215] border border-[#bef264]/40 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#bef264] bg-[#bef264]/10 border border-[#bef264]/30 px-2 py-0.5 rounded">
                CURRENT PHASE · MONTHS 0–3
              </span>
              <span className="text-zinc-500 text-[10px]">THE FOUNDER WEDGE</span>
            </div>
            <h4 className="text-base font-bold text-white font-sans uppercase">
              1. The SaaS Founder MVP
            </h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Launch strictly for SaaS founders needing instant compliance to close seed rounds and prevent fines.
            </p>
            <ul className="space-y-1.5 text-zinc-300 text-[11px] pt-1">
              <li>• Real-Time DOM & Cookie Crawler</li>
              <li>• Fast CMP Cookie Banner (&lt;4.2 kB)</li>
              <li>• GDPR Privacy Policy Generator</li>
              <li>• $49/mo Floor (20 Paying Sites Goal)</li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div className="bg-[#121215] border border-zinc-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                PHASE 2 · MONTHS 3–6
              </span>
              <span className="text-zinc-500 text-[10px]">DEVELOPER WORKFLOW</span>
            </div>
            <h4 className="text-base font-bold text-white font-sans uppercase">
              2. Pull Requests & US States
            </h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Deepen developer ergonomics and expand legal compliance to state regulations without breaking live codebases.
            </p>
            <ul className="space-y-1.5 text-zinc-300 text-[11px] pt-1">
              <li>• Automated GitHub Pull Requests (PRs)</li>
              <li>• California (CCPA/CPRA) & Virginia VCDPA</li>
              <li>• WordPress & Shopify 1-Click Plugins</li>
              <li>• Growth Tier ($99/mo) Ramp</li>
            </ul>
          </div>

          {/* Phase 3 */}
          <div className="bg-[#121215] border border-zinc-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                PHASE 3 · MONTHS 6–9
              </span>
              <span className="text-zinc-500 text-[10px]">AGENCY SCALE</span>
            </div>
            <h4 className="text-base font-bold text-white font-sans uppercase">
              3. Agency White-Label Hub
            </h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Unlock enterprise recurring revenue by enabling dev agencies to resell compliance services to their client roster.
            </p>
            <ul className="space-y-1.5 text-zinc-300 text-[11px] pt-1">
              <li>• Multi-tenant client portals</li>
              <li>• Complete custom white-label branding</li>
              <li>• $199/mo + $15/site pricing model</li>
              <li>• Team seats & audit export dossiers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
