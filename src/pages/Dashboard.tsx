import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Globe, FileText, Bell, Plus, ExternalLink, X, ShieldCheck } from 'lucide-react';
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

  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If table doesn't exist yet, return empty but don't crash
      if (error && error.code === '42P01') {
        console.warn('Leads table missing. Dashboard showing fallback data.');
        return [];
      }
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (sitesLoading || alertsLoading || leadsLoading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
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
    { label: 'Total Sites', value: sites?.length || 0, icon: Globe },
    { label: 'Potential Leads', value: leads?.length || 0, icon: ShieldCheck, color: 'text-accent' },
    { label: 'Active Docs', value: docsCount || 0, icon: FileText },
    { label: 'Pending Alerts', value: alerts?.length || 0, icon: Bell, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-12 font-mono">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            style={{ animationDelay: `${index * 100}ms` }}
            className="bg-surface border border-white/10 p-8 flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(200,241,53,0.05)] reveal-up active"
          >
            <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-text-custom transition-colors">{stat.label}</span>
              <stat.icon className={cn("h-4 w-4 transition-all duration-300 group-hover:scale-110", stat.color || "text-accent")} />
            </div>
            <span className="text-6xl font-sans font-extrabold tracking-[0.04em] relative z-10">
              <CountUp value={stat.value} />
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sites Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase italic underline underline-offset-8 decoration-accent/30">RECENT SITES</h3>
            <Link to="/sites" className="bracket-btn py-2 px-4 text-xs font-black">
              <span className="bracket-btn-inner"></span>
              ALL SITES
            </Link>
          </div>

          {sites && sites.length > 0 ? (
            <div className="bg-surface border border-white/10 overflow-hidden reveal-up active shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">SITE NAME</th>
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
                      <td className="px-8 py-5">
                        <p className="font-bold tracking-tight uppercase">{site.name}</p>
                        <p className="text-[10px] text-muted tracking-widest">{site.url}</p>
                      </td>
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
                        <Link to={`/sites/${site.id}`} className="p-2 border border-white/10 hover:border-accent hover:text-accent transition-all inline-block">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
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

        {/* Leads Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase italic">WAITLIST</h3>
            <span className="px-2 py-1 bg-accent/20 border border-accent/30 text-[10px] font-black text-accent uppercase tracking-widest rounded-sm">HOT LEADS</span>
          </div>

          <div className="bg-surface border border-white/10 divide-y divide-white/5 reveal-up active shadow-2xl">
            {leads.length > 0 ? (
              leads.slice(0, 8).map((lead, idx) => (
                <div key={idx} className="p-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-text-custom tracking-tight leading-none group-hover:text-accent transition-colors">{lead.email}</p>
                      <p className="text-[9px] text-muted font-light truncate max-w-[140px] uppercase tracking-wider">{lead.website_url}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-custom whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center space-y-4">
                <p className="text-muted text-[10px] font-bold tracking-[0.3em] uppercase leading-relaxed">No scanner leads captured yet.</p>
                <p className="text-[9px] text-accent/60 uppercase tracking-widest leading-loose">
                  Share your audit tool link to start filling this list with proof for your dad.
                </p>
              </div>
            )}
            
            <div className="p-4 bg-accent/5">
              <button className="text-[10px] font-black text-accent hover:underline uppercase tracking-[0.2em] w-full text-center py-2">
                EXCEL EXPORT (CSV) →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
