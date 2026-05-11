import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Globe, FileText, Bell, Plus, ExternalLink, X, Activity, ShieldCheck, Zap, Database as DbIcon, Fingerprint, Cpu, Lock, Network, Share2, Layers, EyeOff, Scale, Server, Shield } from 'lucide-react';
import { ADVANCED_FEATURES } from '@/src/services/infrastructureService';
import { cn } from '@/src/lib/utils';

type Site = Database['public']['Tables']['sites']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

const CountUp = ({ value, duration = 1500 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const nextCount = Math.floor(easeOut * value);
      
      if (nextCount !== countRef.current) {
        countRef.current = nextCount;
        setCount(nextCount);
      }

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{count}</>;
};

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: sites = [], isLoading: sitesLoading } = useQuery<Site[]>({
    queryKey: ['sites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('agency_id', user?.id as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('agency_id', user?.id as string)
        .eq('resolved', false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: docsCount = 0 } = useQuery({
    queryKey: ['docs-count', user?.id, sites.length],
    queryFn: async () => {
      if (sites.length === 0) return 0;
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .in('site_id', sites.map(s => s.id));
      if (error) throw error;
      return count || 0;
    },
    enabled: !!sites.length,
  });

  const { data: averageScore = 0 } = useQuery({
    queryKey: ['average-score', user?.id, sites.length],
    queryFn: async () => {
      if (sites.length === 0) return 0;
      const { data, error } = await supabase
        .from('compliance_scores')
        .select('score')
        .in('site_id', sites.map(s => s.id));
      
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      const total = (data as { score: number | null }[]).reduce((acc, curr) => acc + (curr.score || 0), 0);
      return Math.round(total / data.length);
    },
    enabled: !!sites.length,
  });

  if (sitesLoading || alertsLoading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-surface border border-white/5 rounded-none relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-surface border border-white/5 shimmer" />
          <div className="h-64 bg-surface border border-white/5 shimmer" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Global Deployments', value: sites?.length || 0, icon: Globe },
    { label: 'Governance Nodes', value: docsCount || 0, icon: DbIcon },
    { label: 'Risk Indices', value: alerts?.length || 0, icon: Bell, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-12 font-mono">
      {/* Infrastructure Overview */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                style={{ animationDelay: `${index * 100}ms` }}
                className="bg-surface border border-white/10 p-6 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-accent transition-all duration-500 reveal-up active"
              >
                <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">{stat.label}</span>
                  <stat.icon className={cn("h-4 w-4", stat.color || "text-accent")} />
                </div>
                <span className="text-5xl font-sans font-black tracking-tighter relative z-10 italic">
                  <CountUp value={stat.value} />
                </span>
              </div>
            ))}
          </div>

          {/* Activity Feed / System Logs */}
          <div className="bg-surface border border-white/10 p-8 reveal-up active delay-100">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-sans font-black tracking-widest uppercase italic">Infrastructure Activity Log</h4>
              <div className="flex items-center gap-2 text-[9px] font-bold text-accent animate-pulse">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                LIVE SYNC ACTIVE
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { time: '14:22:01', event: 'Consent Hashed', detail: '0x7F2A...B901 (TCF 2.2)', icon: Fingerprint },
                { time: '14:15:45', event: 'Policy Rollout', detail: 'Privacy v2.1 -> nexus.io', icon: Zap },
                { time: '13:58:12', event: 'Compliance Audit', detail: 'GDPR Baseline Verified', icon: ShieldCheck },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <div className="text-[10px] text-muted font-bold tracking-tighter w-16">{log.time}</div>
                  <div className="w-8 h-8 bg-white/5 flex items-center justify-center">
                    <log.icon className="w-4 h-4 text-accent/50 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase">{log.event}</p>
                    <p className="text-[9px] text-muted tracking-wider">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Health Map / Meta-Metrics */}
        <div className="w-full lg:w-1/3 bg-black border border-white/10 p-8 relative overflow-hidden group min-h-[400px]">
          <div className="absolute inset-0 grid-dots opacity-20" />
          <div className="relative z-10">
            <h4 className="text-sm font-sans font-black tracking-widest uppercase italic mb-8">Governance Integrity</h4>
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeDasharray={`${(averageScore / 100) * 283} 283`}
                    className="text-accent shadow-[0_0_20px_rgba(200,241,53,0.5)] transition-all duration-1000" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-sans font-black tracking-tighter italic">
                    <CountUp value={averageScore} />%
                  </span>
                  <span className="text-[9px] font-bold text-muted tracking-widest uppercase">INFRASTRUCTURE HEALTH</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-muted tracking-widest leading-relaxed uppercase">
                  {averageScore >= 90 ? 'Your infrastructure is currently performing within optimal compliance parameters.' : 
                   averageScore >= 70 ? 'Your infrastructure health is stable, but several governance nodes require attention.' :
                   'Critical compliance vulnerabilities detected. Immediate infrastructure review recommended.'}
                </p>
                <Link to="/audit-report" className="text-[9px] font-black tracking-widest text-accent hover:underline uppercase inline-block">
                  View Full Audit Report →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Sites Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-sans font-black tracking-widest uppercase italic mb-4">Active Deployment Hub</h4>
            <Link to="/sites" className="bracket-btn py-2 px-4 text-[9px] font-black">
              <span className="bracket-btn-inner"></span>
              ALL DEPLOYMENTS
            </Link>
          </div>

          {sites && sites.length > 0 ? (
            <div className="bg-surface border border-white/10 overflow-hidden reveal-up active shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">SITE NAME</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">URL</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">GRADE</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sites.slice(0, 5).map((site, idx) => (
                    <tr 
                      key={site.id} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-5 font-bold tracking-tight uppercase">{site.name}</td>
                      <td className="px-8 py-5 text-muted text-xs tracking-wider uppercase">{site.url}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full border flex items-center justify-center font-sans font-extrabold text-xs tracking-[0.04em]",
                            site.compliance_grade === 'A' ? "border-green-500 text-green-500" :
                            site.compliance_grade === 'B' ? "border-blue-500 text-blue-500" :
                            site.compliance_grade === 'C' ? "border-yellow-500 text-yellow-500" :
                            "border-red-500 text-red-500"
                          )}>
                            {site.compliance_grade || 'F'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            to={`/sites/${site.id}/documents`} 
                            className="text-[10px] font-black tracking-widest text-muted hover:text-accent border border-white/10 px-3 py-1.5 hover:border-accent transition-all"
                          >
                            VIEW AUDIT
                          </Link>
                          <Link 
                            to={`/sites/${site.id}`} 
                            className="p-2 border border-white/10 hover:border-accent hover:text-accent transition-all"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-surface border border-white/10 py-16 flex flex-col items-center justify-center text-center space-y-6">
              <p className="text-muted text-[10px] font-bold tracking-[0.3em] uppercase">No active sites monitoried</p>
              <Link to="/sites" className="bracket-btn px-6 py-3 text-xs">
                <span className="bracket-btn-inner"></span>
                DEPLOY FIRST SITE
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ADVANCED INFRASTRUCTURE NODES - THE "ICEBERG" FEATURES */}
      <div className="space-y-6 reveal-up active delay-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-sans font-black tracking-widest uppercase italic border-b-2 border-accent inline-block">Subsurface Protocol Nodes</h4>
            <p className="text-[9px] text-muted font-bold tracking-widest uppercase opacity-50">Infrastructure Integrity Monitoring v4.1</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/20">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-accent uppercase">All Nodes Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {ADVANCED_FEATURES.map((feature) => (
            <div key={feature.id} className="bg-surface border border-white/5 p-6 hover:border-accent/30 transition-all group relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                {feature.category === 'AI_OVERSIGHT' && <Cpu className="w-12 h-12" />}
                {feature.category === 'SECURITY' && <Lock className="w-12 h-12" />}
                {feature.category === 'GOVERNANCE' && <Network className="w-12 h-12" />}
                {feature.category === 'DATA_SOVEREIGNTY' && <Globe className="w-12 h-12" />}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-1 h-1 rounded-full",
                    feature.status === 'ENFORCED' ? "bg-accent shadow-[0_0_8px_rgba(200,241,53,0.8)]" : 
                    feature.status === 'MONITORING' ? "bg-blue-400" : "bg-white/20"
                  )} />
                  <span className="text-[8px] font-black tracking-widest uppercase text-white/50">{feature.category}</span>
                </div>
              </div>

              <h5 className="text-[10px] font-black tracking-tighter uppercase mb-3 italic leading-none">{feature.name}</h5>

              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[8px] font-bold text-accent mb-1 uppercase tracking-widest italic opacity-80">Logic:</p>
                  <p className="text-[9px] text-muted leading-tight uppercase font-medium">{feature.logic}</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[8px] font-bold text-white mb-1 uppercase tracking-widest italic opacity-50">Pitch:</p>
                  <p className="text-[9px] text-muted/60 leading-tight uppercase italic">{feature.pitch}</p>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
