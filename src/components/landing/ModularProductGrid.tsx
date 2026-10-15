import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Cookie, 
  Scale, 
  FileText, 
  Check, 
  Plus, 
  ExternalLink, 
  Sparkles,
  Zap,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { useComplianceStackStore } from '@/src/store/complianceStackStore';

interface ProductCardData {
  id: string;
  name: string;
  badge: string;
  rating: string;
  description: string;
  jurisdictions: string[];
  features: string[];
  latency: string;
  icon: typeof ShieldCheck;
  iconColor: string;
}

const PRODUCTS: ProductCardData[] = [
  {
    id: 'privacy',
    name: 'Autonomous Privacy Policy Engine',
    badge: 'STATUTORY ESSENTIAL',
    rating: '100% REGULATORY PASS',
    description: 'Dynamic privacy policy generation that scans your live scripts and continuous data flows to update disclosures autonomously.',
    jurisdictions: ['GDPR (EU)', 'CCPA (US)', 'PIPEDA (CA)', 'APPs (AU)'],
    features: [
      'Continuous cookie & telemetry audit',
      'Automated PII inventory categorization',
      'Instant localized translations in 14 languages'
    ],
    latency: '1.2ms Edge CDN Delivery',
    icon: ShieldCheck,
    iconColor: 'text-emerald-400'
  },
  {
    id: 'cookie',
    name: 'Autonomous Consent & Cookie Blocker',
    badge: 'ZERO-CODE INJECTION',
    rating: 'IAB TCF 2.2 CERTIFIED',
    description: 'Ultra-fast script interception engine that automatically blocks third-party trackers before explicit user consent is granted.',
    jurisdictions: ['ePrivacy (EU)', 'CPRA (CA)', 'LGPD (BR)', 'GLOBAL'],
    features: [
      'Prior-consent auto-script blocking',
      'Geo-located consent banners & opt-outs',
      'Zero layout shift (CLS: 0.00)'
    ],
    latency: '0.8ms DOM Injection',
    icon: Cookie,
    iconColor: 'text-accent'
  },
  {
    id: 'terms',
    name: 'SaaS Terms of Service & EULA Suite',
    badge: 'ATTORNEY-VETTED',
    rating: 'COMMERCIAL GRADE',
    description: 'Bulletproof Terms of Service, Acceptable Use Policies, and User Agreements tailored for digital SaaS platforms and high-volume agencies.',
    jurisdictions: ['US Commercial Code', 'UK Common Law', 'EU E-Commerce', 'GLOBAL'],
    features: [
      'Custom binding arbitration clauses',
      'Tiered SLA & liability protection caps',
      'Automatic version history changelog'
    ],
    latency: 'Real-Time Synchronized',
    icon: Scale,
    iconColor: 'text-cyan-400'
  },
  {
    id: 'dpa',
    name: 'Data Processing Agreement (DPA + SCCs)',
    badge: 'ENTERPRISE BINDING',
    rating: 'ARTICLE 28 COMPLIANT',
    description: 'Standard Contractual Clauses (SCCs) and sub-processor tracking for agencies managing European client data on American cloud backends.',
    jurisdictions: ['EU-US Privacy Shield', 'UK IDTA', 'Swiss FADP', 'GLOBAL'],
    features: [
      'Sub-processor real-time notifications',
      'Mutual audit & breach indemnity terms',
      'Digital execution & cryptographic proof'
    ],
    latency: 'Export PDF / JSON / Embed',
    icon: FileText,
    iconColor: 'text-amber-400'
  }
];

export default function ModularProductGrid() {
  const { selectedModuleIds, toggleModule, setDrawerOpen } = useComplianceStackStore();
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<Record<string, string>>({
    privacy: 'GDPR (EU)',
    cookie: 'ePrivacy (EU)',
    terms: 'US Commercial Code',
    dpa: 'EU-US Privacy Shield'
  });

  const [activeModalItem, setActiveModalItem] = useState<ProductCardData | null>(null);

  const handleJurisdictionSelect = (cardId: string, jur: string) => {
    setSelectedJurisdictions(prev => ({ ...prev, [cardId]: jur }));
  };

  return (
    <section id="products" className="py-28 px-6 bg-black relative overflow-hidden border-t border-white/10">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Palmo typography & rhythm */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="section-label mb-4 text-accent inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              MODULAR COMPLIANCE ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black tracking-tighter uppercase text-white leading-none">
              THE <span className="text-accent italic drop-shadow-[0_0_20px_rgba(200,241,53,0.3)]">PAPERLOO</span> CATALOGUE
            </h2>
            <p className="text-white/60 text-xs sm:text-sm font-mono tracking-wider mt-3 max-w-xl uppercase">
              Select policies to arm for your web properties. Toggle jurisdictions and inspect live technical specifications.
            </p>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="self-start md:self-auto bracket-btn py-3 px-6 text-xs text-accent border-accent hover:bg-accent/20 flex items-center gap-2 group transition-all"
          >
            <span className="bracket-btn-inner" />
            OPEN COMPLIANCE STACK ({selectedModuleIds.length})
          </button>
        </div>

        {/* Product Cards Grid (Palmo 3-column / 2-column responsive layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {PRODUCTS.map((product) => {
            const isSelected = selectedModuleIds.includes(product.id);
            const Icon = product.icon;
            const activeJur = selectedJurisdictions[product.id] || product.jurisdictions[0];

            return (
              <div
                key={product.id}
                className={`group relative rounded-3xl p-6 sm:p-8 bg-surface border transition-all duration-300 flex flex-col justify-between shadow-xl ${
                  isSelected 
                    ? 'border-accent/80 shadow-[0_0_25px_rgba(200,241,53,0.15)] bg-surface-2' 
                    : 'border-white/15 hover:border-white/40 hover:-translate-y-1.5'
                }`}
              >
                {/* Top status bar & badge */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-accent bg-accent/15 border border-accent/30 px-3 py-1 rounded-full uppercase">
                      {product.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                      {product.rating}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${product.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-white uppercase group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        Latency: {product.latency}
                      </p>
                    </div>
                  </div>

                  <p className="text-white/70 text-xs leading-relaxed font-sans mb-6">
                    {product.description}
                  </p>

                  {/* Pack Selector Pills (Palmo Radio Buttons pattern) */}
                  <div className="mb-6 space-y-2">
                    <span className="text-[9px] text-white/50 tracking-widest uppercase block font-bold font-mono">
                      Target Legal Jurisdiction:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.jurisdictions.map((jur) => {
                        const isJurActive = activeJur === jur;
                        return (
                          <button
                            key={jur}
                            type="button"
                            onClick={() => handleJurisdictionSelect(product.id, jur)}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full transition-all border ${
                              isJurActive
                                ? 'bg-white text-black border-white shadow-md'
                                : 'bg-black/50 text-white/70 border-white/15 hover:border-white/40 hover:text-white'
                            }`}
                          >
                            {jur}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-4 border-t border-white/10 mb-6">
                    {product.features.map((feat, fidx) => (
                      <div key={fidx} className="flex items-center gap-2 text-[11px] text-white/80 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Controls (Add to basket toggle & view spec) */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toggleModule(product.id);
                      setDrawerOpen(true);
                    }}
                    className={`w-full sm:w-auto py-2.5 px-6 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isSelected
                        ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-accent/10 border border-accent/40 text-accent hover:bg-accent hover:text-black'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ARMED IN STACK
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        ADD TO STACK
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalItem(product)}
                    className="text-[11px] text-white/60 hover:text-accent font-mono underline transition-colors flex items-center gap-1 py-1"
                  >
                    View Specs <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal / Specification Drawer when "View Specs" is clicked */}
      {activeModalItem && (
        <div 
          className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer"
          onClick={() => setActiveModalItem(null)}
        >
          <div 
            className="max-w-lg w-full bg-[#0d0d0d] border border-white/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white font-mono cursor-default relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-bold text-accent tracking-widest uppercase">
                {activeModalItem.badge}
              </span>
              <button 
                onClick={() => setActiveModalItem(null)}
                className="text-white/60 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-sans font-black uppercase text-white">
                {activeModalItem.name}
              </h3>
              <p className="text-xs text-white/70 font-sans leading-relaxed">
                {activeModalItem.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/70 border border-white/10 space-y-2 text-xs">
              <div className="text-[10px] text-white/40 tracking-wider uppercase font-bold">
                Generated SDK Header Preview:
              </div>
              <code className="block text-emerald-400 text-[11px] overflow-x-auto whitespace-pre font-mono">
{`// Paperloo Regulatory Policy Hook
import { PaperlooClient } from '@paperloo/sdk';
const policy = new PaperlooClient({
  siteId: "ag_live_992",
  jurisdiction: "${selectedJurisdictions[activeModalItem.id] || 'GDPR'}",
  autoSync: true
});`}
              </code>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  toggleModule(activeModalItem.id);
                  setActiveModalItem(null);
                  setDrawerOpen(true);
                }}
                className="bracket-btn py-2.5 px-6 text-xs text-accent border-accent hover:bg-accent hover:text-black"
              >
                <span className="bracket-btn-inner" />
                {selectedModuleIds.includes(activeModalItem.id) ? 'REMOVE FROM STACK' : 'ADD TO STACK NOW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
