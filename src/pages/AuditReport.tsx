
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Shield, AlertTriangle, CheckCircle2, ChevronRight, FileText, Globe, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { calculateComplianceScore } from '@/src/lib/compliance';

export default function AuditReport() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: profile } = useQuery<any>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id as string).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: scores = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['all-scores', user?.id],
    queryFn: async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name, compliance_grade').eq('agency_id', user?.id as string);
      const sites = (sitesData as any[]) || [];
      if (sites.length === 0) return [];
      
      const siteIds = sites.map(s => s.id);
      const { data: scoresData } = await supabase
        .from('compliance_scores')
        .select('*, sites(name)')
        .in('site_id', siteIds)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false }); // Fallback for equal timestamps
      
      // Filter to get only the latest score per site_id
      const latestScores: any[] = [];
      const seenSiteIds = new Set();
      
      (scoresData as any[])?.forEach(score => {
        if (!seenSiteIds.has(score.site_id)) {
          latestScores.push(score);
          seenSiteIds.add(score.site_id);
        }
      });

      // Map back to ALL sites so we show 0% for those not yet audited
      return sites.map(site => {
        const scoreEntry = latestScores.find(s => s.site_id === site.id);
        return {
          id: site.id,
          site_id: site.id,
          sites: { name: site.name },
          score: scoreEntry?.score || 0,
          grade: scoreEntry?.grade || 'F',
          breakdown: scoreEntry?.breakdown || {},
          updated_at: scoreEntry?.updated_at || new Date().toISOString()
        };
      });
    },
    enabled: !!user?.id
  });

  const [scanning, setScanning] = React.useState(false);

  const recalculateAll = async () => {
    if (!user?.id) return;
    setScanning(true);
    toast.info('Initiating deep-scan of all infrastructure nodes...');
    
    try {
      const { data: sitesData } = await supabase.from('sites').select('id').eq('agency_id', user.id);
      const sites = (sitesData as any[]) || [];
      
      if (sites.length > 0) {
        // Run sequentially to avoid rate limits if many sites
        for (const site of sites) {
          await calculateComplianceScore(site.id);
        }
        toast.success('Global infrastructure scan complete');
        refetch();
        queryClient.invalidateQueries({ queryKey: ['average-score'] });
      } else {
        toast.error('No sites found to scan');
      }
    } catch (err) {
      console.error(err);
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((acc, curr) => acc + (curr.score || 0), 0) / scores.length)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          {profile?.logo_url ? (
             <img src={profile.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 flex-shrink-0 bg-accent rounded-[6px] flex items-center justify-center p-1">
              <Shield className="h-4 w-4 text-black" />
            </div>
          )}
          <span className="logo text-xl tracking-widest whitespace-nowrap truncate uppercase max-w-[300px]">
            {profile?.agency_name || 'PAPERLOO INFRASTRUCTURE'}
          </span>
        </Link>
        <Link to="/dashboard" className="text-[10px] font-black tracking-widest text-muted hover:text-white">BACK TO DASHBOARD</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20">
                <Shield className="w-3 h-3 text-accent" />
                <span className="text-[9px] font-black tracking-widest text-accent italic">GLOBAL INFRASTRUCTURE AUDIT</span>
              </div>
              <h1 className="text-6xl font-sans font-black tracking-tighter italic">GOVERNANCE <span className="text-accent underline">REPORT.</span></h1>
            </div>
            <button 
              onClick={recalculateAll}
              disabled={scanning}
              className="bracket-btn py-3 px-8 text-[11px] font-black flex items-center gap-3 border-accent text-accent mb-2"
            >
              <span className="bracket-btn-inner"></span>
              <RefreshCw className={cn("h-4 w-4", scanning && "animate-spin")} />
              {scanning ? 'SCANNING DEPLOYMENTS...' : 'RE-AUDIT INFRASTRUCTURE'}
            </button>
          </div>
          <p className="text-muted text-sm tracking-[0.2em] max-w-2xl leading-relaxed">
            DETAILED COMPLIANCE ANALYSIS ACROSS ALL ACTIVE DEPLOYMENT NODES. GENERATED ON {new Date().toLocaleDateString()}.
          </p>
        </header>

        {scanning && (
          <div className="py-24 border border-accent/20 bg-accent/5 flex flex-col items-center justify-center space-y-6 animate-pulse">
            <Activity className="h-12 w-12 text-accent animate-bounce" />
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-black italic tracking-widest">DEEP SCAN IN PROGRESS</h3>
              <p className="text-[10px] text-accent font-bold tracking-[0.3em] uppercase">MAPPING DATA LINEAGE · AUDITING SUBSURFACE PROTOCOLS</p>
            </div>
          </div>
        )}

        {!scanning && scores.length === 0 && (
          <div className="py-32 border border-white/10 bg-surface flex flex-col items-center justify-center space-y-8">
            <Shield className="h-16 w-16 text-white/10" />
            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-black italic tracking-tight uppercase">No Infrastructure Data Found</h3>
              <p className="text-muted text-xs tracking-widest max-w-md uppercase leading-relaxed">You haven't added any sites or generated any documents yet. Start by adding a site to your deployment hub.</p>
            </div>
            <Link to="/sites" className="bracket-btn py-4 px-10 text-xs font-black uppercase">
              <span className="bracket-btn-inner"></span>
              Enter Deployment Hub
            </Link>
          </div>
        )}

        {/* Executive Summary */}
        {!scanning && scores.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface border border-white/10 p-8 space-y-4">
                <p className="text-[10px] text-muted font-bold tracking-widest">AGGREGATE INTEGRITY</p>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-sans font-black tracking-tighter italic text-accent">{averageScore}%</span>
                  <div className="h-10 w-px bg-white/10" />
                  <span className="text-[10px] font-bold text-muted tracking-widest leading-tight">SYSTEM WIDE<br/>AVERAGE</span>
                </div>
              </div>
              <div className="bg-surface border border-white/10 p-8 space-y-4">
                <p className="text-[10px] text-muted font-bold tracking-widest">RISK EXPOSURE</p>
                <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-5xl font-sans font-black tracking-tighter italic",
                      averageScore >= 90 ? "text-green-500" : averageScore >= 70 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {averageScore >= 90 ? 'LOW' : averageScore >= 70 ? 'MOD' : 'HIGH'}
                    </span>
                    <Activity className="h-8 w-8 text-white/10" />
                </div>
              </div>
              <div className="bg-surface border border-white/10 p-8 space-y-4">
                <p className="text-[10px] text-muted font-bold tracking-widest">ACTIVE NODES</p>
                <p className="text-5xl font-sans font-black text-white tracking-tighter italic">{scores.length}</p>
              </div>
            </div>

            {/* Detailed Node Analysis */}
            <section className="space-y-8">
              <h2 className="text-xl font-black italic tracking-widest border-b border-white/10 pb-4">NODE-BY-NODE BREAKDOWN</h2>
              <div className="space-y-4">
                {scores.map((score, i) => (
                  <div key={i} className="bg-surface border border-white/5 p-8 hover:border-accent/30 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black italic tracking-tight">{(score as any).sites?.name}</h3>
                        <p className="text-[9px] text-muted tracking-widest">NODE ID: {score.site_id.substring(0, 12).toUpperCase()} · LAST AUDIT: {new Date(score.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[9px] text-muted font-bold tracking-widest">NODE SCORE</p>
                          <p className="text-3xl font-sans font-black italic tracking-tighter text-accent">{score.score}%</p>
                        </div>
                        <div className={cn(
                          "h-12 w-12 border flex items-center justify-center font-sans font-black text-xl italic",
                          score.grade === 'A' ? "border-green-500 text-green-500" : 
                          score.grade === 'B' ? "border-blue-500 text-blue-500" :
                          "border-red-500 text-red-500"
                        )}>
                          {score.grade}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries((score.breakdown as any) || {}).map(([key, val]: [string, any]) => (
                        <div key={key} className="p-4 bg-black/40 border border-white/5">
                           <p className="text-[8px] text-muted font-bold tracking-widest mb-2">{key.toUpperCase()}</p>
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold tracking-tight">{val.label}</span>
                             <span className={cn(
                               "text-[10px] font-black italic",
                               val.status === 'complete' ? "text-accent" : "text-red-500"
                             )}>
                               {val.score} PTS
                             </span>
                           </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                       <Link to={`/sites/${score.site_id}`} className="text-[9px] font-black tracking-widest text-muted hover:text-accent flex items-center gap-2">
                          MANAGE NODE GOVERNANCE <ChevronRight className="h-3 w-3" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Global Recommendations */}
            <section className="bg-accent p-12 text-black space-y-6">
              <div className="flex items-center gap-4 mb-4">
                  <AlertTriangle className="h-8 w-8" />
                  <h2 className="text-4xl font-sans font-black tracking-tighter italic">INFRASTRUCTURE RECOMMENDATIONS</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black italic border-b border-black/20 pb-2">CRITICAL ACTIONS</h4>
                    <ul className="space-y-2 text-[11px] font-bold leading-relaxed">
                        <li>• DEPLOY MISSING COOKIE POLICIES ACROSS {scores.filter(s => s.score < 80).length} NODES</li>
                        <li>• RE-SYNC JURISDICTIONAL DATA FOR NON-SLA COMPLIANT DEPLOYMENTS</li>
                        <li>• CONDUCT MANDATORY TEAM REVIEW FOR ALL "D" GRADE ASSETS</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black italic border-b border-black/20 pb-2">STRATEGIC UPGRADES</h4>
                    <ul className="space-y-2 text-[11px] font-bold leading-relaxed">
                        <li>• ENABLE GCM v2 FOR ALL E-COMMERCE DEPLOYMENTS</li>
                        <li>• SCALE TO 'AGENCY' PLAN TO UNLOCK WHITE-LABEL AUDIT EXPORTS</li>
                    </ul>
                  </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="p-12 border-t border-white/10 text-center opacity-50">
        <p className="text-[10px] font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} {profile?.agency_name || 'PAPERLOO'} · GOVERNANCE DIVISION
        </p>
      </footer>
    </div>
  );
}
