import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Globe, Plus, Search, Trash2, ExternalLink, X, Upload, Copy, AlertTriangle, Github } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import Papa from 'papaparse';

type Site = Database['public']['Tables']['sites']['Row'];

function isValidUrl(input: string): boolean {
  const withProtocol = input.startsWith('http://') || input.startsWith('https://')
    ? input
    : `https://${input}`
  
  try {
    const url = new URL(withProtocol)
    return url.hostname.includes('.') && url.hostname.length > 3
  } catch {
    return false
  }
}

function normalizeUrl(input: string): string {
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    return `https://${input}`
  }
  return input
}

const siteSchema = z.object({
  name: z.string().min(2, 'Site name is required'),
  url: z.string()
    .min(1, 'URL is required')
    .transform(val => val.trim())
    .refine(isValidUrl, { message: 'Enter a valid website URL — e.g. acme.com' })
    .transform(normalizeUrl),
  jurisdictions: z.array(z.string()).min(1, 'Select at least one jurisdiction'),
  industryType: z.string().min(2, 'Industry type is required'),
});

type SiteForm = z.infer<typeof siteSchema>;

const JURISDICTIONS = [
  'GDPR (EU)',
  'CCPA (California)',
  'PIPEDA (Canada)',
  'LGPD (Brazil)',
  'VCDPA (Virginia)',
  'PDPA (Thailand)',
  'PDPA (Turkey)',
  'POPIA (South Africa)',
  'Privacy Act (Australia)',
  'APPI (Japan)',
  'PDPB (India)',
  'KVKK (Turkey)',
  'PDPL (Saudi Arabia)',
  'Law 25 (Quebec)'
];

export default function Sites() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub Integration State
  const [githubAuth, setGithubAuth] = useState<{ token: string; username: string; isSandbox: boolean } | null>(() => {
    try {
      const saved = localStorage.getItem('paperloo_github_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [githubRepos, setGithubRepos] = useState<Array<{ id: number; name: string; url: string; language: string }>>([]);
  const [githubReposLoading, setGithubReposLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Record<number, boolean>>({});
  const [isImportingGithub, setIsImportingGithub] = useState(false);

  // Listen to message for popup auth callback or URL query params on mount
  useEffect(() => {
    // 1. Popup messages
    const handleOauthMessage = (event: MessageEvent) => {
      // Security validate
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const authData = {
          token: event.data.token,
          username: event.data.username,
          isSandbox: !!event.data.isSandbox
        };
        setGithubAuth(authData);
        localStorage.setItem('paperloo_github_auth', JSON.stringify(authData));
        toast.success(`Connected search cluster to GitHub@${authData.username.toUpperCase()}`);
      }
    };

    // 2. URL parameters fallback (for sandboxed iframe direct redirect)
    const searchParams = new URLSearchParams(window.location.search);
    const githubToken = searchParams.get('github_token');
    const githubUser = searchParams.get('github_user');
    const isSandboxQuery = searchParams.get('is_sandbox') === 'true';

    if (githubToken && githubUser) {
      // Clean up URL parameters from history
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

      const authData = {
        token: githubToken,
        username: githubUser,
        isSandbox: isSandboxQuery
      };
      setGithubAuth(authData);
      localStorage.setItem('paperloo_github_auth', JSON.stringify(authData));
      toast.success(`Connected search cluster to GitHub@${githubUser.toUpperCase()}`);
    }

    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, []);

  // Fetch repositories once authenticated
  useEffect(() => {
    if (githubAuth) {
      fetchGithubRepos(githubAuth.token, githubAuth.isSandbox);
    } else {
      setGithubRepos([]);
      setSelectedRepos({});
    }
  }, [githubAuth]);

  const fetchGithubRepos = async (token: string, isSandbox: boolean) => {
    setGithubReposLoading(true);
    try {
      const res = await fetch(`/api/github/repos?token=${token}&isSandbox=${isSandbox}`);
      if (res.ok) {
        const repos = await res.json();
        setGithubRepos(repos);
        const initial: Record<number, boolean> = {};
        if (repos.length > 0) initial[repos[0].id] = true;
        if (repos.length > 1) initial[repos[1].id] = true;
        setSelectedRepos(initial);
      } else {
        toast.error('Failed to query design repositories');
      }
    } catch {
      toast.error('Network error querying Github repos');
    } finally {
      setGithubReposLoading(false);
    }
  };

  const handleGithubConnect = async () => {
    try {
      const stateParam = encodeURIComponent(window.location.pathname);
      const res = await fetch(`/api/auth/github/url?state=${stateParam}`);
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      
      let authWindow: Window | null = null;
      try {
        authWindow = window.open(
          url,
          'github_oauth_popup',
          'width=600,height=750,location=no,status=no,menubar=no'
        );
      } catch (err) {
        console.warn("window.open blocked or threw error in sandbox:", err);
      }

      if (!authWindow) {
        // Fallback to direct redirect for sandboxed iframe
        window.location.href = url;
      }
    } catch {
      toast.error('Failed to initialize connector stream');
    }
  };

  const handleGithubDisconnect = () => {
    setGithubAuth(null);
    localStorage.removeItem('paperloo_github_auth');
    toast.info('Disconnected from GitHub');
  };

  const handleToggleRepo = (id: number) => {
    setSelectedRepos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleImportSelectedRepos = async () => {
    const reposToImport = githubRepos.filter(r => selectedRepos[r.id]);
    if (reposToImport.length === 0) return;

    // Check limits
    const plan = (profile as any)?.plan || 'starter';
    const limit = plan === 'starter' ? 3 : plan === 'agency' ? 20 : Infinity;
    if (sites.length + reposToImport.length > limit) {
      toast.error(`Exceeds ${plan} plan capacity (${limit} max). Please adjust choice or upgrade.`, {
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/billing')
        }
      });
      return;
    }

    setIsImportingGithub(true);
    try {
      const res = await fetch('/api/github/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          repos: reposToImport
        })
      });

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ['sites'] });
        toast.success(`Success! Auto-imported and configured ${reposToImport.length} sites directly.`);
        setGithubAuth(null);
        localStorage.removeItem('paperloo_github_auth');
      } else {
        toast.error('Auto-import command aborted by server');
      }
    } catch {
      toast.error('Failed negotiating import sequence');
    } finally {
      setIsImportingGithub(false);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, agency_name, logo_url, plan')
        .eq('id', user?.id as string)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: sites = [], isLoading } = useQuery<Site[]>({
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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sites, search]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SiteForm>({
    resolver: zodResolver(siteSchema),
    defaultValues: { jurisdictions: [] },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SiteForm) => {
      const { data: newSite, error } = await supabase
        .from('sites')
        .insert({
          agency_id: user?.id as string,
          name: data.name,
          url: data.url,
          jurisdictions: data.jurisdictions,
          industry_type: data.industryType,
          status: 'pending',
        } as any)
        .select()
        .single();
      if (error) throw error;
      return newSite;
    },
    onSuccess: (newSite: any) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site added successfully!');
      setIsAdding(false);
      reset();
      if (newSite) navigate(`/sites/${newSite.id}/questionnaire`);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (site: Site) => {
      const plan = (profile as any)?.plan || 'starter';
      const limit = plan === 'starter' ? 3 : plan === 'agency' ? 20 : Infinity;
      
      if (sites.length >= limit) {
        throw new Error(`Limit reached for ${plan} plan.`);
      }

      const { data: newSite, error } = await supabase
        .from('sites')
        .insert({
          agency_id: user?.id as string,
          name: `${site.name} (COPY)`,
          url: site.url,
          jurisdictions: site.jurisdictions,
          industry_type: site.industry_type,
          status: 'pending',
        } as any)
        .select()
        .single();
      if (error) throw error;
      return newSite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site duplicated');
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (sitesToImport: any[]) => {
      const plan = (profile as any)?.plan || 'starter';
      const limit = plan === 'starter' ? 3 : plan === 'agency' ? 20 : Infinity;
      
      if (sites.length + sitesToImport.length > limit) {
        throw new Error(`Import exceeds limit for ${plan} plan.`);
      }

      const { error } = await (supabase
        .from('sites') as any)
        .insert(sitesToImport.map(s => ({
          agency_id: user?.id as string,
          name: s.name,
          url: normalizeUrl(s.url),
          jurisdictions: s.jurisdictions?.split(',').map((j: string) => j.trim()) || ['GDPR (EU)'],
          industry_type: s.industry || 'General',
          status: 'pending'
        } as any)));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Sites imported successfully');
    },
    onError: (error: any) => toast.error(`Import failed: ${error.message}`),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validSites = results.data.filter((s: any) => s.name && s.url);
        if (validSites.length === 0) {
          toast.error('No valid sites found in CSV. Required columns: name, url');
          return;
        }
        bulkImportMutation.mutate(validSites);
      },
      error: (error) => toast.error(`CSV Error: ${error.message}`)
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Site deleted');
      setDeleteId(null);
    },
  });

  const filteredSites = sites?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSite = () => {
    const plan = (profile as any)?.plan || 'starter';
    const limit = plan === 'starter' ? 3 : plan === 'agency' ? 20 : Infinity;
    
    if (sites.length >= limit) {
      toast.error(`You've reached the limit for the ${plan} plan. Upgrade to add more sites.`, {
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/billing')
        }
      });
      return;
    }
    setIsAdding(true);
  };

  return (
    <div className="space-y-12 font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="SEARCH SITES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface border border-white/10 pl-12 pr-4 py-4 w-full focus:border-accent outline-none transition-all text-xs uppercase tracking-widest"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={handleGithubConnect}
            className="bracket-btn flex items-center gap-2 py-3 px-6 text-[#c8f135] hover:border-[#c8f135] transition-all"
          >
            <span className="bracket-btn-inner"></span>
            <Github className="h-4 w-4" />
            CONNECT GITHUB
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bracket-btn flex items-center gap-2 py-3 px-6"
          >
            <span className="bracket-btn-inner"></span>
            <Upload className="h-4 w-4" />
            IMPORT CSV
          </button>
          <button onClick={handleAddSite} className="bracket-btn flex items-center gap-2 py-3 px-6 border-accent text-accent">
            <span className="bracket-btn-inner"></span>
            <Plus className="h-4 w-4" />
            ADD NEW SITE
          </button>
        </div>
      </div>

      {githubAuth && (
        <div className="bg-surface/90 border border-[#c8f135]/30 p-8 relative overflow-hidden space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 p-2 font-mono text-[9px] bg-[#c8f135]/10 text-[#c8f135] uppercase tracking-wider border-l border-b border-[#c8f135]/30">
            GITHUB CLUSTER Connected {githubAuth.isSandbox ? "(SANDBOX ACTIVE)" : ""}
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#c8f135]">
                <Github className="h-5 w-5" />
                <h3 className="font-sans font-extrabold text-lg uppercase tracking-wider">CONNECTED To GITHUB@{githubAuth.username.toUpperCase()}</h3>
              </div>
              <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                Paperloo has discovered the following active sites. Toggle them and auto-deploy compliance banners.
              </p>
            </div>
            <button 
              onClick={handleGithubDisconnect}
              className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest"
            >
              DISCONNECT ACCOUNT
            </button>
          </div>

          {githubReposLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c8f135] border-t-transparent" />
              <p className="text-[10px] text-muted uppercase tracking-widest">AUTO-DISCOVERING SITES & REPOS...</p>
            </div>
          ) : githubRepos.length === 0 ? (
            <p className="text-xs text-muted py-4 uppercase tracking-widest text-center">NO DISCOVERED REPOS AVAILABLE.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {githubRepos.map(repo => {
                  const isChecked = !!selectedRepos[repo.id];
                  return (
                    <div 
                      key={repo.id} 
                      onClick={() => handleToggleRepo(repo.id)}
                      className={cn(
                        "p-4 border cursor-pointer select-none transition-all duration-200 flex items-start gap-3",
                        isChecked 
                          ? "border-[#c8f135] bg-[#c8f135]/5" 
                          : "border-white/10 bg-black/20 hover:border-white/25"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}} 
                        className="accent-[#c8f135] mt-1 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider truncate text-white">{repo.name}</p>
                        <p className="text-[9px] text-[#c8f135] mt-0.5 tracking-wider truncate uppercase">{repo.url}</p>
                        <span className="inline-block px-1.5 py-0.5 bg-white/5 border border-white/10 text-[8px] text-muted tracking-widest mt-2 uppercase font-black">
                          {repo.language}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const all: Record<number, boolean> = {};
                      githubRepos.forEach(r => { all[r.id] = true; });
                      setSelectedRepos(all);
                    }}
                    className="text-[10px] font-bold text-muted hover:text-white uppercase tracking-widest"
                  >
                    SELECT ALL
                  </button>
                  <button 
                    onClick={() => setSelectedRepos({})}
                    className="text-[10px] font-bold text-muted hover:text-white uppercase tracking-widest"
                  >
                    DESELECT ALL
                  </button>
                </div>
                <button 
                  onClick={handleImportSelectedRepos}
                  disabled={isImportingGithub || Object.values(selectedRepos).filter(Boolean).length === 0}
                  className="bracket-btn py-3 px-6 border-accent text-accent disabled:opacity-50"
                >
                  <span className="bracket-btn-inner"></span>
                  {isImportingGithub 
                    ? "AUTO-GENERATING BANNER SYSTEMS..." 
                    : `INTEGRATE & AUTO-DEPLOY ${Object.values(selectedRepos).filter(Boolean).length} SITES`
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-surface border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSites?.map((site, idx) => (
            <div 
              key={site.id} 
              style={{ transitionDelay: `${idx * 50}ms` }}
              className="bg-surface border border-white/10 p-8 group relative flex flex-col justify-between min-h-[250px] overflow-hidden reveal-up hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(200,241,53,0.05)]"
            >
              <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-[10px] bg-accent/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => duplicateMutation.mutate(site)} className="p-2 text-muted hover:text-accent transition-colors" title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </button>
                    <Link to={`/sites/${site.id}`} className="p-2 text-muted hover:text-accent transition-colors" title="Manage">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button onClick={() => setDeleteId(site.id)} className="p-2 text-muted hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase truncate">{site.name}</h4>
                  <p className="text-[10px] text-muted truncate font-bold uppercase tracking-widest mt-1">{site.url}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5 relative z-10">
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
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    {site.status}
                  </span>
                </div>
                <Link to={`/sites/${site.id}/documents`} className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">
                  DOCUMENTS
                </Link>
              </div>

              {/* Stale Warning */}
              {site.compliance_grade === 'F' && (
                <div className="absolute top-4 right-4 text-red-500 animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAdding(false)} />
          <div className="relative bg-surface border border-white/10 w-full max-w-lg p-10 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <button onClick={() => setIsAdding(false)} className="absolute right-6 top-6 text-muted hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">ADD NEW SITE</h3>
            
            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SITE NAME</label>
                <div className="relative group">
                  <input {...register('name')} className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase" placeholder="MY CLIENT SITE" />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-focus-within:w-full" />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SITE URL</label>
                <div className="relative group">
                  <input {...register('url')} className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase" placeholder="EXAMPLE.COM" />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-focus-within:w-full" />
                </div>
                {errors.url && <p className="text-[10px] text-red-500 mt-1">{errors.url.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">INDUSTRY TYPE</label>
                <div className="relative group">
                  <input {...register('industryType')} className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase" placeholder="E-COMMERCE, SAAS, BLOG..." />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-focus-within:w-full" />
                </div>
                {errors.industryType && <p className="text-[10px] text-red-500 mt-1">{errors.industryType.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">APPLICABLE JURISDICTIONS</label>
                <div className="grid grid-cols-2 gap-3">
                  {JURISDICTIONS.map(j => (
                    <label key={j} className="flex items-center gap-3 p-3 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        value={j}
                        {...register('jurisdictions')}
                        className="accent-accent"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{j}</span>
                    </label>
                  ))}
                </div>
                {errors.jurisdictions && <p className="text-[10px] text-red-500 mt-1">{errors.jurisdictions.message}</p>}
              </div>

              <button type="submit" disabled={createMutation.isPending} className="bracket-btn w-full py-4 mt-4">
                <span className="bracket-btn-inner"></span>
                {createMutation.isPending ? 'ADDING SITE...' : 'ADD SITE & START'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDeleteId(null)} />
          <div className="relative bg-surface border border-white/10 w-full max-w-sm p-12 text-center space-y-8 animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
            <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em] uppercase">ARE YOU SURE?</h3>
            <p className="text-muted text-xs tracking-[0.15em] uppercase leading-relaxed">THIS WILL PERMANENTLY DELETE THE SITE AND ALL ITS COMPLIANCE DOCUMENTS.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="bracket-btn flex-1 py-3">
                <span className="bracket-btn-inner"></span>
                CANCEL
              </button>
              <button onClick={() => deleteMutation.mutate(deleteId)} className="bracket-btn flex-1 py-3 border-red-500 text-red-500">
                <span className="bracket-btn-inner"></span>
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
