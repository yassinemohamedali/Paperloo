import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Shield, Globe, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Regulation = Database['public']['Tables']['regulations']['Row'];
type Site = Database['public']['Tables']['sites']['Row'];

export default function Regulations() {
  const { user } = useAuthStore();

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
    return sites.filter(site => 
      site.jurisdictions.some(j => affectsJurisdictions.includes(j.split(' ')[0]))
    ).length;
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
        <p className="text-muted text-xs tracking-[0.15em] uppercase">TRACKING GLOBAL PRIVACY LAWS AND THEIR IMPACT ON YOUR SITES.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {regulations?.map((reg) => {
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

      {/* Legend */}
      <div className="flex flex-wrap gap-8 p-8 border border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">STABLE / ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-yellow-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">RECENTLY AMENDED</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">MAJOR CHANGES PENDING</span>
        </div>
      </div>
    </div>
  );
}
