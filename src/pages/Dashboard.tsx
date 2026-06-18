import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Globe, Bell, ExternalLink, ShieldCheck, Zap, Database as DbIcon, Fingerprint } from 'lucide-react';
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
      try {
        if (sites.length === 0) return 0;
        const { data, error } = await supabase
          .from('compliance_scores')
          .select('site_id, score')
          .in('site_id', sites.map(s => s.id))
          .order('site_id', { ascending: true })
          .order('updated_at', { ascending: false });
        
        if (error) {
          // If table is missing, try to estimate from sites table grade
          const scoresFromGrades = (sites || []).map(site => {
            const grade = (site as any).compliance_grade || 'F';
            if (grade === 'A') return 92;
            if (grade === 'B') return 78;
            if (grade === 'C') return 52;
            if (grade === 'D') return 35;
            return 12;
          });
          return sites.length > 0 ? Math.round(scoresFromGrades.reduce((a, b) => a + b, 0) / sites.length) : 0;
        }

        if (!data || data.length === 0) {
           // Try estimating from document counts if no scores found in table
           const liveScores = await Promise.all(sites.map(async (site) => {
             const { data: docs } = await supabase.from('documents').select('type').eq('site_id', site.id);
             const docList = (docs || []) as any[];
             
             const hasPrivacy = docList.some(d => {
               const t = (d.type || '').toLowerCase();
               return t.includes('privacy') || t.includes('policie');
             });
             const hasTerms = docList.some(d => {
               const t = (d.type || '').toLowerCase();
               return t.includes('terms') || t.includes('service') || t.includes('tos');
             });
             const hasCookie = docList.some(d => {
               const t = (d.type || '').toLowerCase();
               return t.includes('cookie');
             });
             
             const docCount = [hasPrivacy, hasTerms, hasCookie].filter(Boolean).length;
             if (docCount === 3) return 92;
             if (docCount === 2) return 65;
             if (docCount === 1) return 35;
             return 15;
           }));
           return Math.round(liveScores.reduce((a, b) => a + b, 0) / sites.length);
        }

        const latestScores: number[] = [];
        const seenSiteIds = new Set();
        
        (data as any[])?.forEach(row => {
          if (!seenSiteIds.has(row.site_id)) {
            latestScores.push(row.score || 0);
            seenSiteIds.add(row.site_id);
          }
        });

        // Add dummy scores for sites that haven't been audited yet but exist on Dashboard
        sites.forEach(site => {
          if (!seenSiteIds.has(site.id)) {
            const grade = (site as any).compliance_grade || 'F';
            let fallback = 12;
            if (grade === 'A') fallback = 92;
            else if (grade === 'B') fallback = 78;
            else if (grade === 'C') fallback = 52;
            else if (grade === 'D') fallback = 35;
            latestScores.push(fallback);
          }
        });

        if (latestScores.length === 0) return 0;
        const total = latestScores.reduce((acc, curr) => acc + curr, 0);
        return Math.round(total / latestScores.length);
      } catch (err) {
        console.error('Average score calculation failed:', err);
        return 0;
      }
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

          {/* Risk Tracker */}
          <div className="bg-surface border border-white/10 p-8 reveal-up active delay-100">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-sans font-black tracking-widest uppercase italic">Live Risk Tracker</h4>
              <div className="flex items-center gap-2 text-[9px] font-bold text-red-500 animate-pulse">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                RISK MONITOR ACTIVE
              </div>
            </div>
            
            <div className="space-y-4">
              {alerts.length === 0 ? (
                 <p className="text-[10px] text-muted tracking-widest uppercase">No pending risk alerts.</p>
              ) : (
                alerts.slice(0, 5).map((log, i) => {
                  const logSite = sites.find(s => s.id === log.site_id);
                  const isHighRisk = log.type === 'review_needed';
                  return (
                    <div key={log.id || i} className="flex flex-col gap-2 p-4 border border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] text-muted font-bold tracking-tighter w-16">
                           {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className={cn("w-8 h-8 bg-white/5 flex items-center justify-center", isHighRisk ? "text-red-400" : "text-yellow-400")}>
                          {isHighRisk ? <Fingerprint className="w-4 h-4 transition-colors" /> : <Zap className="w-4 h-4 transition-colors" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                             {log.type.replace('_', ' ')}
                             <span className={cn("text-[9px] px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10", isHighRisk ? "text-red-400" : "text-yellow-400")}>
                               {isHighRisk ? 'HIGH' : 'MEDIUM'}
                             </span>
                           </p>
                           <p className="text-[9px] text-muted tracking-wider truncate">
                             {logSite?.domain || 'Global'} - {log.message}
                           </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
    </div>
  );
}
