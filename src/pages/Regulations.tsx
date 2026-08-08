import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Shield, Globe, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Regulation = Database['public']['Tables']['regulations']['Row'];
type Site = Database['public']['Tables']['sites']['Row'];

const JURISDICTION_MAP: Record<string, string> = {
  'GDPR (EU)': 'GDPR',
  'CCPA (California)': 'CCPA',
  'PIPEDA (Canada)': 'PIPEDA',
  'LGPD (Brazil)': 'LGPD',
  'VCDPA (Virginia)': 'VCDPA',
  'PDPA (Thailand)': 'PDPA_TH',
  'PDPA (Turkey)': 'PDPA_TR',
  'POPIA (South Africa)': 'POPIA_ZA',
  'Privacy Act (Australia)': 'PRIVACY_ACT_AU',
  'APPI (Japan)': 'APPI_JP',
  'PDPB (India)': 'PDPB_IN',
  'KVKK (Turkey)': 'KVKK_TR',
  'PDPL (Saudi Arabia)': 'PDPL_SA',
  'Law 25 (Quebec)': 'LAW_25_QC'
};

export default function Regulations() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'amended' | 'pending'>('all');

  const { data: regulations, isLoading: regsLoading } = useQuery<Regulation[]>({
    queryKey: ['regulations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regulations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: sites } = useQuery<Partial<Site>[]>({
    queryKey: ['sites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('jurisdictions')
        .eq('agency_id', user?.id as string);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getAffectedSitesCount = (affectsJurisdictions: string[] | null) => {
    if (!sites || !affectsJurisdictions) return 0;
    return sites.filter(site => {
      if (!site.jurisdictions) return false;
      return site.jurisdictions.some(j => {
        const key = JURISDICTION_MAP[j] || j.split(' ')[0];
        return affectsJurisdictions.includes(key);
      });
    }).length;
  };

  if (regsLoading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-surface rounded" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-24 bg-surface rounded border border-white/5" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 font-mono">
      <div className="space-y-4">
        <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">REGULATION MONITORING</h2>
        <p className="text-muted text-xs tracking-[0.15em] uppercase">TRACKING GLOBAL PRIVACY LAWS AND ACCESSIBILITY MANDATES ON YOUR SITES.</p>
      </div>

      {/* ADA & WCAG 2.1 AA Accessibility Banner */}
      <div className="bg-accent/10 border-2 border-accent/40 p-8 rounded-2xl relative overflow-hidden space-y-4 shadow-[0_0_30px_rgba(200,241,53,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="bg-accent text-black font-black text-[9px] px-2.5 py-1 uppercase tracking-widest rounded-md">
                ACCESSIBILITY STANDARDS
              </span>
              <span className="text-accent text-xs font-mono font-bold tracking-widest uppercase">
                ADA TITLE III & WCAG 2.1 AA MANAGEMENT
              </span>
            </div>
            <h3 className="text-2xl font-sans font-extrabold uppercase tracking-tight text-white">
              Comprehensive Web Accessibility Conformance
            </h3>
            <p className="text-xs text-white/80 leading-relaxed uppercase tracking-wider">
              Enhance web accessibility for all users. Paperloo provides WCAG 2.1 AA compliant toolbars, generates VPAT 2.4 accessibility statements, and supports alternative format request workflows.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="/accessibility-defense" 
              className="bracket-btn py-3.5 px-6 text-center text-xs font-black uppercase tracking-wider"
            >
              <span className="bracket-btn-inner"></span>
              ACCESSIBILITY CENTER
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {regulations?.filter(r => statusFilter === 'all' || r.status === statusFilter).map((reg) => {
          const affectedCount = getAffectedSitesCount(reg.affects_jurisdictions);
          
          return (
            <div 
              key={reg.id}
              className="bg-surface border border-white/10 p-8 group relative overflow-hidden transition-all hover:border-accent/30"
            >
              <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "h-12 w-12 rounded-none flex items-center justify-center border",
                    reg.status === 'active' ? "border-green-500/20 bg-green-500/5 text-green-500" :
                    reg.status === 'amended' ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-500" :
                    "border-red-500/20 bg-red-500/5 text-red-500"
                  )}>
                    <Shield className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-sans font-extrabold tracking-tight uppercase">{reg.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border",
                        reg.status === 'active' ? "border-green-500/30 text-green-500" :
                        reg.status === 'amended' ? "border-yellow-500/30 text-yellow-500" :
                        "border-red-500/30 text-red-500"
                      )}>
                        {reg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        {reg.jurisdiction}
                      </span>
                      <span>EFFECTIVE: {reg.effective_date}</span>
                      <span>UPDATED: {reg.last_updated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">AFFECTS MY SITES</p>
                    <p className={cn(
                      "text-2xl font-sans font-extrabold",
                      affectedCount > 0 ? "text-accent" : "text-white/20"
                    )}>
                      {affectedCount}
                    </p>
                  </div>
                  
                  <div className="h-12 w-px bg-white/10 hidden md:block" />
                  
                  <button className="bracket-btn py-3 px-6 text-[10px]">
                    <span className="bracket-btn-inner"></span>
                    VIEW DETAILS
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-3">
                <Info className="h-4 w-4 text-muted shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed uppercase tracking-wider">
                  {reg.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-6 border border-white/5 bg-white/[0.01]">
        <button 
          onClick={() => setStatusFilter('all')}
          className={cn("flex items-center gap-3 px-4 py-2 border transition-colors", statusFilter === 'all' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white')}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">ALL LAWS</span>
        </button>
        <button 
          onClick={() => setStatusFilter('active')}
          className={cn("flex items-center gap-3 px-4 py-2 border transition-colors", statusFilter === 'active' ? 'border-green-500/50 bg-green-500/5' : 'border-transparent hover:bg-white/5')}
        >
          <div className="w-3 h-3 bg-green-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">STABLE / ACTIVE</span>
        </button>
        <button 
          onClick={() => setStatusFilter('amended')}
          className={cn("flex items-center gap-3 px-4 py-2 border transition-colors", statusFilter === 'amended' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-transparent hover:bg-white/5')}
        >
          <div className="w-3 h-3 bg-yellow-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">RECENTLY AMENDED</span>
        </button>
        <button 
          onClick={() => setStatusFilter('pending')}
          className={cn("flex items-center gap-3 px-4 py-2 border transition-colors", statusFilter === 'pending' ? 'border-red-500/50 bg-red-500/5' : 'border-transparent hover:bg-white/5')}
        >
          <div className="w-3 h-3 bg-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">MAJOR CHANGES PENDING</span>
        </button>
      </div>
    </div>
  );
}
