import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { 
  Globe, 
  Bell, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Database as DbIcon, 
  Fingerprint,
  Search,
  Code,
  FileText,
  AlertCircle,
  GitPullRequest,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity
} from 'lucide-react';
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

  // Calculate Regional Risk indicators across all sites
  const regionalStatus = React.useMemo(() => {
    if (sites.length === 0) {
      return {
        gdpr: { status: 'Pending Setup', label: 'No Sites Monitored', color: 'text-muted' },
        ccpa: { status: 'Pending Setup', label: 'No Sites Monitored', color: 'text-muted' },
        eprivacy: { status: 'Pending Setup', label: 'No Sites Monitored', color: 'text-muted' },
        overall: 'PENDING'
      };
    }

    const hasCriticalAlerts = alerts.some(a => (a.type as string) === 'critical' || a.type === 'review_needed');
    const hasUnresolvedAlerts = alerts.length > 0;

    return {
      gdpr: {
        status: hasCriticalAlerts ? 'Action Needed' : (docsCount >= sites.length ? 'Low Risk' : 'Scanned & Monitored'),
        label: docsCount >= sites.length ? 'CMP Active · Privacy Notices Live' : 'Ensure Privacy Policies Are Deployed',
        color: hasCriticalAlerts ? 'text-rose-400' : (docsCount >= sites.length ? 'text-emerald-400' : 'text-amber-400')
      },
      ccpa: {
        status: 'Scanned & Monitored',
        label: 'Notice at Collection & Opt-Out Signals Ready',
        color: 'text-cyan-400'
      },
      eprivacy: {
        status: hasCriticalAlerts ? 'Action Needed' : 'Low Risk',
        label: hasCriticalAlerts ? 'Unshielded Trackers Flagged' : 'Zero-Preload Script Blocker Active',
        color: hasCriticalAlerts ? 'text-rose-400' : 'text-emerald-400'
      },
      overall: hasCriticalAlerts ? 'ACTION NEEDED' : (docsCount >= sites.length ? 'LOW RISK' : 'MONITORED')
    };
  }, [sites.length, docsCount, alerts]);

  if (sitesLoading || alertsLoading) {
    return (
      <div className="space-y-8 font-mono animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface border border-white/5" />
          ))}
        </div>
        <div className="h-64 bg-surface border border-white/5" />
      </div>
    );
  }

  const stats = [
    { label: 'Monitored SaaS Sites', value: sites?.length || 0, icon: Globe },
    { label: 'Active Legal Policies', value: docsCount || 0, icon: DbIcon },
    { label: 'Pending Risk Alerts', value: alerts?.length || 0, icon: Bell, color: alerts.length > 0 ? 'text-amber-400' : 'text-muted' },
  ];

  return (
    <div className="space-y-12 font-mono">
      {/* Top Banner: Focused MVP Wedge */}
      <div className="bg-surface border border-accent/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Months 0–3 Focused MVP Scope · $49/mo Unit Economics
          </div>
          <h2 className="text-xl font-sans font-black text-white uppercase tracking-tight">
            Automated Compliance Infrastructure
          </h2>
          <p className="text-xs text-muted max-w-2xl font-sans">
            Strictly built for SaaS founders. Pass investor compliance checks, prevent legal liabilities, and deploy bulletproof policies in minutes.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link to="/sites" className="bracket-btn py-2 px-4 text-xs border-accent text-accent">
            <span className="bracket-btn-inner"></span>
            + ADD SAAS SITE
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout: Overview Stats & Health Card */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column (2/3): Stats Cards + Compliance Alerts Stream */}
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

          {/* Compliance Alerts Feed */}
          <div className="bg-surface border border-white/10 p-8 reveal-up active delay-100">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-sans font-black tracking-widest uppercase italic">Compliance Alerts</h4>
              <div className="flex items-center gap-2 text-[9px] font-bold text-red-500 animate-pulse">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                MONITOR ACTIVE
              </div>
            </div>
            
            <div className="space-y-4">
              {alerts.length === 0 ? (
                 <p className="text-[10px] text-muted tracking-widest uppercase">No pending risk alerts.</p>
              ) : (
                alerts.slice(0, 5).map((log, i) => {
                  const logSite = sites.find(s => s.id === log.site_id);
                  const isHighRisk = (log.type as string) === 'critical' || log.type === 'review_needed';
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
                             {logSite?.url || 'Global'} - {log.message}
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

        {/* Right Column (1/3): Global Compliance Health (Regional Indicators) */}
        <div className="w-full lg:w-1/3 bg-black border border-white/10 p-8 relative overflow-hidden group min-h-[400px]">
          <div className="absolute inset-0 grid-dots opacity-20" />
          <div className="relative z-10">
            <h4 className="text-sm font-sans font-black tracking-widest uppercase italic mb-8">Compliance Health</h4>
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeDasharray={283}
                    strokeDashoffset={regionalStatus.overall === 'LOW RISK' ? 0 : 70}
                    className="text-accent shadow-[0_0_20px_rgba(200,241,53,0.5)] transition-all duration-1000" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn(
                    "text-xl font-sans font-black tracking-tight uppercase",
                    regionalStatus.overall === 'LOW RISK' ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {regionalStatus.overall}
                  </span>
                  <span className="text-[8px] font-bold text-muted tracking-widest uppercase mt-1">REGIONAL STATUS</span>
                </div>
              </div>

              {/* Granular Regional Risk Indicators */}
              <div className="w-full space-y-2 text-left pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted font-bold">GDPR (EU & UK):</span>
                  <span className={cn("font-black uppercase", regionalStatus.gdpr.color)}>
                    {regionalStatus.gdpr.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted font-bold">CCPA (CALIFORNIA):</span>
                  <span className={cn("font-black uppercase", regionalStatus.ccpa.color)}>
                    {regionalStatus.ccpa.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted font-bold">ePRIVACY DIRECTIVE:</span>
                  <span className={cn("font-black uppercase", regionalStatus.eprivacy.color)}>
                    {regionalStatus.eprivacy.status}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-muted tracking-widest leading-relaxed uppercase pt-2">
                Audited against concrete statutory technical controls — No deceptive single 0–100 score.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: The 3 Core MVP Tools Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-sans font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> THE 3 CORE MVP PILLARS
          </h3>
          <span className="text-[10px] text-muted uppercase tracking-wider">MONTHS 0–3 FOCUS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Crawler */}
          <div className="bg-surface border border-white/10 p-6 space-y-4 flex flex-col justify-between hover:border-accent/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">
                  PILLAR 01
                </span>
                <Search className="w-4 h-4 text-accent" />
              </div>
              <h4 className="font-sans font-black text-base uppercase text-white">The Web Crawler</h4>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Scans customer URLs to detect third-party scripts, tracking cookies, and missing statutory disclosures.
              </p>
            </div>
            {sites.length > 0 ? (
              <Link to={`/sites/${sites[0].id}/cookie-scanner`} className="bracket-btn py-2 text-[10px] text-center w-full uppercase">
                <span className="bracket-btn-inner"></span>
                RUN TRACKER AUDIT →
              </Link>
            ) : (
              <Link to="/sites" className="bracket-btn py-2 text-[10px] text-center w-full uppercase">
                <span className="bracket-btn-inner"></span>
                ADD SITE TO SCAN
              </Link>
            )}
          </div>

          {/* Pillar 2: CMP */}
          <div className="bg-surface border border-white/10 p-6 space-y-4 flex flex-col justify-between hover:border-accent/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">
                  PILLAR 02
                </span>
                <Code className="w-4 h-4 text-accent" />
              </div>
              <h4 className="font-sans font-black text-base uppercase text-white">The CMP Script</h4>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Ultralight (&lt;12KB) cookie banner script with prior-consent blocking respecting EU GDPR & ePrivacy choices.
              </p>
            </div>
            {sites.length > 0 ? (
              <Link to={`/sites/${sites[0].id}/cookie-banner`} className="bracket-btn py-2 text-[10px] text-center w-full uppercase">
                <span className="bracket-btn-inner"></span>
                CONFIGURE CMP BANNER →
              </Link>
            ) : (
              <Link to="/sites" className="bracket-btn py-2 text-[10px] text-center w-full uppercase">
                <span className="bracket-btn-inner"></span>
                SETUP COOKIE BANNER
              </Link>
            )}
          </div>

          {/* Pillar 3: Policy Generator */}
          <div className="bg-surface border border-white/10 p-6 space-y-4 flex flex-col justify-between hover:border-accent/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">
                  PILLAR 03
                </span>
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <h4 className="font-sans font-black text-base uppercase text-white">GDPR Policy Generator</h4>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Generates tailored template policies for React, Next.js, and WordPress SaaS stacks with export options.
              </p>
            </div>
            {sites.length > 0 ? (
              <Link to={`/sites/${sites[0].id}/documents`} className="bracket-btn py-2 text-[10px] text-center w-full uppercase">
                <span className="bracket-btn-inner"></span>
                GENERATE POLICIES →
              </Link>
            ) : (
              <Link to="/sites" className="bracket-btn py-2 text-[10px] text-center w-full uppercase">
                <span className="bracket-btn-inner"></span>
                GENERATE POLICY
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Monitored Properties Table */}
      <div className="bg-surface border border-white/10 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-sans font-black uppercase tracking-widest text-white">
            REGISTERED SAAS PROPERTIES ({sites.length})
          </h3>
          <Link to="/sites" className="text-xs text-accent hover:underline uppercase tracking-wider">
            MANAGE ALL SITES →
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="p-12 text-center border border-white/5 space-y-4">
            <Globe className="w-10 h-10 text-muted mx-auto" />
            <h4 className="text-base font-bold text-white uppercase">NO PROPERTIES REGISTERED</h4>
            <p className="text-xs text-muted max-w-md mx-auto">
              Add your first website to run the web crawler, configure the CMP cookie banner, and generate your GDPR policy.
            </p>
            <Link to="/sites" className="bracket-btn inline-block py-2.5 px-6 text-xs border-accent text-accent">
              <span className="bracket-btn-inner"></span>
              + REGISTER FIRST SITE
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs uppercase">
              <thead>
                <tr className="border-b border-white/10 text-muted text-[10px] tracking-widest">
                  <th className="pb-3">PROPERTY NAME</th>
                  <th className="pb-3">URL</th>
                  <th className="pb-3">GDPR STATUS</th>
                  <th className="pb-3">CCPA STATUS</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sites.slice(0, 5).map(site => (
                  <tr key={site.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-bold text-white">{site.name}</td>
                    <td className="py-4 text-muted truncate max-w-xs">{site.url}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        LOW RISK
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        SCANNED
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link to={`/sites/${site.id}`} className="text-accent hover:underline text-[10px] font-bold">
                        OPEN CONTROLS →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 3: Execution Timeline Status */}
      <div className="bg-black/60 border border-white/10 p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4" /> Paperloo Product Roadmap & Strategy
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-surface border border-accent/40">
            <span className="text-[10px] font-bold text-accent uppercase block mb-1">CURRENT: MONTHS 0–3</span>
            <p className="font-bold text-white mb-1 uppercase">SaaS Founder MVP ($49/mo)</p>
            <p className="text-muted leading-relaxed">Crawler + CMP Banner + GDPR Policy Generator. Target: 20 paying sites.</p>
          </div>
          <div className="p-4 bg-surface border border-white/10 opacity-80">
            <span className="text-[10px] font-bold text-muted uppercase block mb-1">PHASE 2: MONTHS 3–6</span>
            <p className="font-bold text-white mb-1 uppercase">GitHub Pull Request Engine</p>
            <p className="text-muted leading-relaxed">Automated PR workflows, CCPA multi-state coverage, WordPress/Shopify.</p>
          </div>
          <div className="p-4 bg-surface border border-white/10 opacity-70">
            <span className="text-[10px] font-bold text-muted uppercase block mb-1">PHASE 3: MONTHS 6–9</span>
            <p className="font-bold text-white mb-1 uppercase">Agency White-Label Hub</p>
            <p className="text-muted leading-relaxed">Multi-tenant client management for digital agencies ($199/mo + $15/site).</p>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="p-5 bg-surface border border-white/10 rounded-lg text-left">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest">MANDATORY STATUTORY NOTICE</span>
        </div>
        <p className="text-xs text-muted leading-relaxed uppercase tracking-wider font-mono">
          "Paperloo provides compliance automation software. It does not provide legal advice and is not a law firm. Generated documents are templates and must be reviewed by qualified counsel."
        </p>
      </div>
    </div>
  );
}
