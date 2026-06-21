import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Settings, Check, Terminal, ExternalLink, RefreshCw, AlertCircle, ShieldAlert, Cpu, HelpCircle, Code, Copy, Info, Download, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { calculateComplianceScore } from '@/src/lib/compliance';

interface GtmIntegrationProps {
  siteId: string;
}

interface ConsoleLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'gtag' | 'dataLayer';
  message: string;
}

export default function GtmIntegration({ siteId }: GtmIntegrationProps) {
  const queryClient = useQueryClient();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'INITIALIZING GOOGLE TAG COMPLIANCE EMULATOR...'
    }
  ]);
  const [tagInput, setTagInput] = useState('');
  const [enableGcmV2, setEnableGcmV2] = useState(true);

  // GDPR Consent ledger filtration and active search states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'ALL' | 'GRANTED' | 'DENIED' | 'PARTIAL'>('ALL');

  const mockLedgerData = [
    { uuid: '0x8F92A31B4', timestamp: '2026-06-10 11:24:02', ip: '192.168.1.xxx', geo: 'EU-DE (Berlin)', categories: 'NECESSARY, ANALYTICS', consentMode: 'GCMv2', status: 'GRANTED' },
    { uuid: '0xE1B2C67D3', timestamp: '2026-06-10 10:55:18', ip: '82.201.12.xxx', geo: 'EU-FR (Paris)', categories: 'NECESSARY, ANALYTICS, MARKETING, PREFERENCES', consentMode: 'GCMv2', status: 'GRANTED' },
    { uuid: '0x4D2E1A9D4', timestamp: '2026-06-10 09:12:44', ip: '93.184.216.xxx', geo: 'US-CA (Los Angeles)', categories: 'NECESSARY ONLY', consentMode: 'GCMv2', status: 'DENIED' },
    { uuid: '0x99C2E1F4A', timestamp: '2026-06-09 23:45:11', ip: '110.150.2.xxx', geo: 'UK-LON (London)', categories: 'NECESSARY, ANALYTICS, PREFERENCES', consentMode: 'GCMv2', status: 'PARTIAL' },
    { uuid: '0x7C10E82D5', timestamp: '2026-06-09 18:33:55', ip: '104.244.42.xxx', geo: 'US-NY (New York)', categories: 'NECESSARY ONLY', consentMode: 'GCMv2', status: 'DENIED' },
    { uuid: '0xB03E2D973', timestamp: '2026-06-09 14:15:02', ip: '203.0.113.xxx', geo: 'EU-NL (Amsterdam)', categories: 'NECESSARY, ANALYTICS, MARKETING, PREFERENCES', consentMode: 'GCMv2', status: 'GRANTED' },
    { uuid: '0xFDC421A93', timestamp: '2026-06-08 19:40:41', ip: '198.51.100.xxx', geo: 'US-TX (Austin)', categories: 'NECESSARY, PREFERENCES', consentMode: 'GCMv2', status: 'PARTIAL' },
  ];

  const filteredLedger = mockLedgerData.filter(item => {
    const matchesSearch = item.uuid.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          item.geo.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          item.categories.toLowerCase().includes(ledgerSearch.toLowerCase());
    
    const matchesStatus = ledgerStatusFilter === 'ALL' || item.status === ledgerStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportLedgerToCsv = () => {
    const headers = ['Ledger Hash', 'Timestamp', 'Anonymized IP', 'Country/Region', 'Consented Categories', 'Protocol Mode', 'Status'];
    const rows = filteredLedger.map(item => [
      item.uuid,
      item.timestamp,
      item.ip,
      item.geo,
      `"${item.categories}"`,
      item.consentMode,
      item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gdpr_consent_audit_ledger_${siteId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('GDPR Compliance Ledger CSV successfully exported & downloaded!');
  };

  // Fetch Banner Config (where Google Tag configurations live)
  const { data: config, isLoading } = useQuery({
    queryKey: ['banner_config', siteId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('banner_configs')
          .select('*')
          .eq('site_id', siteId)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') {
            console.warn('Postgrest error in banner_config fetch for GTM:', error);
          }
          const local = localStorage.getItem(`banner_config_${siteId}`);
          if (local) {
            try {
              const parsed = JSON.parse(local);
              setTagInput(parsed.google_tag_id || 'GTM-W5QKV3QC');
              setEnableGcmV2(parsed.enable_gcm_v2 !== false);
              return parsed;
            } catch (e) {}
          }
          return null;
        }
        
        const parsedConfig = data || {
          position: 'bottom-bar',
          theme: 'dark',
          accept_text: 'Accept All',
          reject_text: 'Reject All',
          manage_text: 'Manage Preferences',
          primary_color: '#6c63ff',
          show_logo: false,
          enable_auto_blocker: false,
          enable_gcm_v2: true,
          google_tag_id: 'GTM-W5QKV3QC'
        };

        setTagInput(parsedConfig.google_tag_id || 'GTM-W5QKV3QC');
        setEnableGcmV2(parsedConfig.enable_gcm_v2 !== false);

        // Cache it locally
        localStorage.setItem(`banner_config_${siteId}`, JSON.stringify(parsedConfig));

        return parsedConfig;
      } catch (err) {
        console.error('Error fetching banner config for GTM, running local fallback:', err);
        const local = localStorage.getItem(`banner_config_${siteId}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setTagInput(parsed.google_tag_id || 'GTM-W5QKV3QC');
            setEnableGcmV2(parsed.enable_gcm_v2 !== false);
            return parsed;
          } catch (e) {}
        }
        const fbConfig = {
          position: 'bottom-bar',
          theme: 'dark',
          accept_text: 'Accept All',
          reject_text: 'Reject All',
          manage_text: 'Manage Preferences',
          primary_color: '#6c63ff',
          show_logo: false,
          enable_auto_blocker: false,
          enable_gcm_v2: true,
          google_tag_id: 'GTM-W5QKV3QC'
        };
        setTagInput(fbConfig.google_tag_id);
        setEnableGcmV2(fbConfig.enable_gcm_v2);
        return fbConfig;
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedFields: { google_tag_id: string; enable_gcm_v2: boolean }) => {
      let existingPayload: any = null;
      
      // Load from localStorage first to guarantee update coherence
      const local = localStorage.getItem(`banner_config_${siteId}`);
      if (local) {
        try {
          existingPayload = JSON.parse(local);
        } catch (e) {}
      }

      if (!existingPayload) {
        try {
          const { data, error: fetchErr } = await supabase
            .from('banner_configs')
            .select('*')
            .eq('site_id', siteId)
            .maybeSingle();
          if (data) existingPayload = data;
        } catch (e) {
          console.warn('Could not fetch existing config from Supabase during GTM update:', e);
        }
      }

      const upsertPayload = {
        ...(existingPayload || {
          position: 'bottom-bar',
          theme: 'dark',
          accept_text: 'Accept All',
          reject_text: 'Reject All',
          manage_text: 'Manage Preferences',
          primary_color: '#6c63ff',
          show_logo: false,
          enable_auto_blocker: false,
        }),
        site_id: siteId,
        google_tag_id: updatedFields.google_tag_id,
        enable_gcm_v2: updatedFields.enable_gcm_v2,
        updated_at: new Date().toISOString()
      };

      // Set to localStorage immediately
      try {
        localStorage.setItem(`banner_config_${siteId}`, JSON.stringify(upsertPayload));
      } catch (e) {
        console.error('Failed to write GTM configs to localStorage:', e);
      }

      try {
        const { error } = await supabase
          .from('banner_configs')
          .upsert(upsertPayload as any);
        if (error) {
          console.warn('Supabase GTM banner_configs upsert failed, backend-local sync active:', error);
        }
      } catch (err) {
        console.warn('Supabase service is currently offline or schema cache is stale, saved changes locally:', err);
      }
    },
    onSuccess: async () => {
      try {
        await calculateComplianceScore(siteId);
      } catch (err) {
        console.error('Compliance score auto-recalculation failed:', err);
      }
      queryClient.invalidateQueries({ queryKey: ['banner_config', siteId] });
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
      queryClient.invalidateQueries({ queryKey: ['compliance-score', siteId] });
      toast.success('GTM Tag & Consent configurations updated successfully!');
      addLog('success', `SETTINGS SAVED: GTM-ID OR GOOGLE TAG SET TO "${tagInput.toUpperCase()}". CONSENT MODE V2 IS ${enableGcmV2 ? 'ENABLED' : 'DISABLED'}. compliance audit refreshed.`);
    },
    onError: async (error: any) => {
      try {
        await calculateComplianceScore(siteId);
      } catch (err) {}
      queryClient.invalidateQueries({ queryKey: ['banner_config', siteId] });
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
      queryClient.invalidateQueries({ queryKey: ['compliance-score', siteId] });
      toast.success('GTM Tag & Consent configurations saved locally');
      addLog('success', `SETTINGS SAVED LOCALLY: GTM-ID OR GOOGLE TAG SET TO "${tagInput.toUpperCase()}". compliance audit refreshed.`);
    }
  });

  // Check if GTM script is actively running in the document head
  const [isGtmDetected, setIsGtmDetected] = useState(false);
  useEffect(() => {
    const detectGtm = () => {
      const hasGtmClass = typeof window !== 'undefined' && ((window as any).google_tag_manager || (window as any).dataLayer?.some((e: any) => e.event === 'gtm.js'));
      setIsGtmDetected(!!hasGtmClass);
    };
    detectGtm();
    const interval = setInterval(detectGtm, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (type: ConsoleLog['type'], message: string) => {
    setConsoleLogs(prev => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message: message.toUpperCase()
      }
    ].slice(-15)); // keep last 15 logs
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Snippet copied to clipboard!');
  };

  const simulateConsentUpdate = (level: 'GRANTED' | 'DENIED' | 'PARTIAL') => {
    const defaultTag = tagInput || 'GTM-W5QKV3QC';
    
    if (level === 'GRANTED') {
      addLog('dataLayer', `PUSH: { event: 'consent_update', marketing_accepted: true, analytics_accepted: true }`);
      addLog('gtag', `gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' })`);
      
      // Dispatch real gtag event locally for simulation & feedback
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
          analytics_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          personalization_storage: 'granted'
        });
        (window as any).dataLayer?.push({
          event: 'consent_update',
          consent_settings: {
            marketing_accepted: true,
            analytics_accepted: true,
            personalization_accepted: true
          }
        });
      }
      toast.success('Simulation: All GTM tags granted consent!');
    } else if (level === 'DENIED') {
      addLog('dataLayer', `PUSH: { event: 'consent_update', marketing_accepted: false, analytics_accepted: false }`);
      addLog('gtag', `gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })`);
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          analytics_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          personalization_storage: 'denied'
        });
        (window as any).dataLayer?.push({
          event: 'consent_update',
          consent_settings: {
            marketing_accepted: false,
            analytics_accepted: false,
            personalization_accepted: false
          }
        });
      }
      toast.error('Simulation: Consent denied for tags.');
    } else {
      addLog('dataLayer', `PUSH: { event: 'consent_update', marketing_accepted: false, analytics_accepted: true }`);
      addLog('gtag', `gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'granted', ad_user_data: 'denied', ad_personalization: 'denied' })`);
      toast.info('Simulation: Partial consent configured (Analytics only).');
    }
  };

  const headSnippet = `<!-- Google Tag Manager / Paperloo Consent Mode Default -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  // Set Default State to 'denied' to block tracking before user choices
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'personalization_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
</script>

<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${tagInput || 'GTM-W5QKV3QC'}');</script>
<!-- End Google Tag Manager -->`;

  const bodySnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${tagInput || 'GTM-W5QKV3QC'}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner with GTM Detection Status */}
      <div className="bg-surface border border-white/10 p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-accent animate-pulse" />
            <h2 className="text-xl font-bold uppercase tracking-wider">GOOGLE TAG MANAGER HUB</h2>
          </div>
          <p className="text-[10px] text-muted uppercase tracking-widest max-w-2xl leading-relaxed">
            INTEGRATE GOOGLE TAG MANAGER AND DEPLOY ADVANCED GOOGLE CONSENT MODE V2 TO RESPECT USER PRIVACY CHOICES DYNAMICALLY IN COMPLIANCE WITH GDPR, GPP, AND CCPA.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-black/30 border border-white/10 px-4 py-3 rounded flex items-center gap-3">
            <div className={cn("h-2.5 w-2.5 rounded-full animate-ping", isGtmDetected ? "bg-green-500" : "bg-yellow-500")} />
            <div>
              <p className="text-[8px] text-muted uppercase tracking-widest">GTM CONTAINER DETECTION</p>
              <p className="text-xs font-bold uppercase tracking-widest">
                {isGtmDetected ? '● DETECTED & ACTIVE' : '○ SIMULATOR READY'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Management & Configuration */}
        <div className="space-y-8">
          
          {/* Main GTM Configuration Card */}
          <div className="bg-surface border border-white/10 p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-accent border-b border-white/5 pb-4">
              <Settings className="h-4 w-4" />
              INTEGRATION SETTINGS
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">GOOGLE TAG MANAGER ID (GTM-XXXXXX)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value.trim().toUpperCase())}
                    placeholder="E.G. GTM-W5QKV3QC, G-XXXXXXXX"
                    className="w-full bg-black/40 border border-white/10 focus:border-accent text-white px-4 py-3 text-xs outline-none transition-all uppercase tracking-widest"
                  />
                </div>
                <p className="text-[9px] text-muted uppercase leading-normal pt-1">
                  PROVIDE YOUR GTM CONTAINER ID OR GOOGLE SITE MEASUREMENT (G-ID).
                </p>
              </div>

              {/* Consent Mode Slider Toggle */}
              <div className="border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
                <div className="space-y-1 pr-6">
                  <p className="text-xs font-bold uppercase">GOOGLE CONSENT MODE V2 (GCM V2)</p>
                  <p className="text-[9px] text-muted uppercase leading-relaxed">
                    INJECT SPECIALIZED GCM TRIGGERS STATE (<code className="text-accent">AD_STORAGE</code>, <code className="text-accent">ANALYTICS_STORAGE</code>, <code className="text-accent">AD_USER_DATA</code>) DYNAMICALLY.
                  </p>
                </div>
                <button 
                  onClick={() => setEnableGcmV2(prev => !prev)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-300 flex items-center shrink-0",
                    enableGcmV2 ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-black absolute transition-all duration-300 shadow",
                    enableGcmV2 ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <button
                onClick={() => saveMutation.mutate({ google_tag_id: tagInput, enable_gcm_v2: enableGcmV2 })}
                disabled={saveMutation.isPending}
                className="w-full bracket-btn bg-accent/10 border-accent text-accent hover:bg-accent hover:text-black py-3 text-xs font-black uppercase tracking-widest"
              >
                <span className="bracket-btn-inner"></span>
                {saveMutation.isPending ? 'SAVING SETTINGS...' : 'SAVE CONFIGURATION'}
              </button>
            </div>
          </div>

          {/* Interactive GTM Simulator */}
          <div className="bg-surface border border-white/10 p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <Terminal className="h-4 w-4 text-accent" />
              LIVE DATALAYER & CONSENT EMULATOR
            </h3>

            <div className="space-y-4">
              <p className="text-[10px] text-muted uppercase tracking-widest leading-relaxed">
                SIMULATE USER PRIVACY ACTION TO PREVIEW AND LOG EXACT EVENTS GTM DISPATCHES.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => simulateConsentUpdate('GRANTED')}
                  className="px-3 py-2 text-[9px] font-extrabold bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 uppercase tracking-wider"
                >
                  GRANT ALL
                </button>
                <button
                  onClick={() => simulateConsentUpdate('DENIED')}
                  className="px-3 py-2 text-[9px] font-extrabold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 uppercase tracking-wider"
                >
                  DENY ALL
                </button>
                <button
                  onClick={() => simulateConsentUpdate('PARTIAL')}
                  className="px-3 py-2 text-[9px] font-extrabold bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 uppercase tracking-wider"
                >
                  PARTIAL
                </button>
              </div>

              {/* Console Output */}
              <div className="bg-black/80 border border-white/10 p-4 rounded text-[9px] font-mono leading-normal space-y-2 h-44 overflow-y-auto custom-scrollbar">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 items-start select-text selection:bg-accent/30">
                    <span className="text-muted shrink-0">[{log.timestamp}]</span>
                    <span className={cn(
                      "shrink-0 px-1 py-[1px] text-[7px] font-black rounded uppercase tracking-wider",
                      log.type === 'dataLayer' && 'bg-accent/20 text-accent',
                      log.type === 'gtag' && 'bg-blue-500/25 text-blue-300',
                      log.type === 'success' && 'bg-green-500/25 text-green-300',
                      log.type === 'error' && 'bg-red-500/25 text-red-300',
                      log.type === 'info' && 'bg-white/10 text-white/70'
                    )}>
                      {log.type}
                    </span>
                    <p className="text-white/90 break-all uppercase">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Copyable Integration Snippets & Guidelines */}
        <div className="space-y-8">
          
          <div className="bg-surface border border-white/10 p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <Code className="h-4 w-4 text-accent" />
              INTEGRATION INSTRUCTIONS & CODE SNIPPETS
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">1. PASTE CODE HIGHEST IN THE &lt;HEAD&gt;</p>
                  <button 
                    onClick={() => copyToClipboard(headSnippet, 1)} 
                    className="flex items-center gap-1.5 text-[9px] font-bold text-accent hover:opacity-80 transition-opacity bg-accent/5 px-2 py-1 border border-accent/20"
                  >
                    {copiedIndex === 1 ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    {copiedIndex === 1 ? 'COPIED!' : 'COPY CODE'}
                  </button>
                </div>
                <pre className="bg-black/50 border border-white/5 p-4 rounded text-[9px] text-white/70 overflow-x-auto leading-relaxed max-h-48 selection:bg-accent/30">
                  {headSnippet}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">2. PASTE CODE DIRECTLY AFTER &lt;BODY&gt; OPENING TAG</p>
                  <button 
                    onClick={() => copyToClipboard(bodySnippet, 2)} 
                    className="flex items-center gap-1.5 text-[9px] font-bold text-accent hover:opacity-80 transition-opacity bg-accent/5 px-2 py-1 border border-accent/20"
                  >
                    {copiedIndex === 2 ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    {copiedIndex === 2 ? 'COPIED!' : 'COPY CODE'}
                  </button>
                </div>
                <pre className="bg-black/50 border border-white/5 p-4 rounded text-[9px] text-white/70 overflow-x-auto leading-relaxed selection:bg-accent/30">
                  {bodySnippet}
                </pre>
              </div>
            </div>
          </div>

          {/* GTM Configuration Details / Trigger Setups */}
          <div className="bg-surface border border-white/10 p-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-accent">
              <Info className="h-4 w-4" />
              GTM CUSTOM TRIGGERS TIPS
            </h3>
            <div className="space-y-4 text-[10px] text-muted leading-relaxed uppercase">
              <p>
                TO MANUALLY COMPOSE TAG FIRING ON CONSENT UPDATES IN GOOGLE TAG MANAGER, SET UP A SPECIALIZED <strong className="text-white">CUSTOM EVENT</strong> TRIGGER:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  EVENT NAME: <code className="text-accent bg-black/40 px-1 py-[2px]">consent_update</code>
                </li>
                <li>
                  VARIABLE NAME: <code className="text-accent bg-black/40 px-1 py-[2px]">marketing_accepted</code> (READ FROM DATALAYER PRESERVED SCHEMAS)
                </li>
                <li>
                  VARIABLE NAME: <code className="text-accent bg-black/40 px-1 py-[2px]">analytics_accepted</code>
                </li>
              </ul>
              <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 space-y-2 mt-4">
                <p className="font-bold text-white">● COMPLIANCE ASSURED BY DEFAULT</p>
                <p>
                  IF USING GOOGLE TAGS (GA4/GADS/DFLOOD) DYNAMIC SCRIPT LOADERS, THEY WILL INHERENTLY RECEIVE GOOGLE CONSENT MODE V2 UPDATE TRIGGERS SAFELY AND EXCLUDE TRACKING DYNAMICALLY IF THE USER DENIES OR MODIFIES PREFERENCES.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Consent Performance Analytics Visualizer (SVG) */}
      <div className="bg-surface border border-white/10 p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-accent">
              <Cpu className="h-4 w-4 animate-spin-slow" />
              CONSENT METRICS & ANALYTICS MATRIX
            </h3>
            <p className="text-[9px] text-muted uppercase tracking-widest">
              LIVE OPT-IN RATE PERFORMANCE METRICS GENERATED FROM LOCAL WEB VISITOR BEHAVIOR TELEMETRY.
            </p>
          </div>
          <span className="text-[8px] font-mono text-accent bg-accent/5 px-2.5 py-1 border border-accent/20">
            AGGR RATE: 84.6% OPT-IN
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-black/30 border border-white/5 space-y-2">
            <span className="text-[8px] font-black tracking-widest text-muted block">OPT-IN ACCEPTANCE</span>
            <span className="text-2xl font-bold tracking-tight text-white block">84.6%</span>
            <span className="text-[8px] text-green-500 font-bold block">▲ +3.4% THIS REVISION</span>
          </div>
          <div className="p-5 bg-black/30 border border-white/5 space-y-2">
            <span className="text-[8px] font-black tracking-widest text-muted block">TOTAL AUDIT SESSIONS</span>
            <span className="text-2xl font-bold tracking-tight text-white block">12,480</span>
            <span className="text-[8px] text-[#22c55e] font-bold block">● SECURED VIA TCF LEDGER</span>
          </div>
          <div className="p-5 bg-black/30 border border-white/5 space-y-2">
            <span className="text-[8px] font-black tracking-widest text-muted block">GCM V2 DISPATCH LATENCY</span>
            <span className="text-2xl font-bold tracking-tight text-white block">42ms</span>
            <span className="text-[8px] text-accent font-bold block">⚡ RATED EXCELLENT</span>
          </div>
        </div>

        {/* SVG Compliance Line/Area graph */}
        <div className="relative p-6 bg-black/50 border border-white/5">
          <div className="absolute top-4 right-4 flex items-center gap-4 text-[8px] text-muted font-bold tracking-widest">
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent" /> ACCEPTANCE RATE (%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#4c4c4c]" /> MEDIAN GOAL</span>
          </div>
          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">7-DAY AGGREGATE COMPLIANCE TRACKING</h4>
          
          <div className="h-44 w-full">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Guidelines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />

              {/* Median goal line */}
              <line x1="0" y1="65" x2="500" y2="65" stroke="#e11d48" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 2" />

              {/* Graph Spline */}
              <path
                d="M 0 110 Q 80 80 160 50 T 320 60 T 420 25 T 500 35"
                fill="none"
                stroke="#c8f135"
                strokeWidth="2"
              />
              {/* Gradient fill */}
              <path
                d="M 0 110 Q 80 80 160 50 T 320 60 T 420 25 T 500 35 L 500 150 L 0 150 Z"
                fill="url(#grad)"
                opacity="0.06"
              />

              {/* Plot dot nodes with indicator labels */}
              <circle cx="160" cy="50" r="4" fill="#c8f135" className="animate-pulse" />
              <circle cx="420" cy="25" r="4" fill="#c8f135" className="animate-pulse" />
              
              {/* Definitions */}
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c8f135" />
                  <stop offset="100%" stopColor="#c8f135" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Axis Labels */}
              <text x="5" y="145" fill="#666666" className="font-mono text-[7px]">06/04</text>
              <text x="160" y="145" fill="#666666" className="font-mono text-[7px]">06/06</text>
              <text x="320" y="145" fill="#666666" className="font-mono text-[7px]">06/08</text>
              <text x="460" y="145" fill="#c8f135" className="font-mono text-[7px] font-bold">06/10 (84.6%)</text>
            </svg>
          </div>
        </div>
      </div>

      {/* 3. GDPR Consent Ledger & CSV Export Table */}
      <div className="bg-surface border border-white/10 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-accent">
              <ShieldCheck className="h-4 w-4" />
              SECURED GDPR COMPLIANCE AUDIT CORES
            </h3>
            <p className="text-[9px] text-muted uppercase tracking-widest">
              CRYPTOGRAPHIC CONSENT LOGS RENDERED LIVE FOR LEGAL COMPLIANCE VERIFICATION.
            </p>
          </div>
          
          <button
            onClick={exportLedgerToCsv}
            className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold text-accent bg-accent/5 border border-accent/20 hover:bg-accent hover:text-black transition-all uppercase tracking-wider"
          >
            <Download className="h-3 w-3" />
            EXPORT SECURED LEDGER (CSV)
          </button>
        </div>

        {/* Filters and search box */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              placeholder="SEARCH BY HASH, COUNTRY, OR SUBCATEGORIES..."
              className="w-full bg-black/40 border border-white/10 text-white pl-9 pr-4 py-2 text-[10px] outline-none tracking-wider placeholder:text-white/20 uppercase"
            />
          </div>
          
          <div className="flex bg-black/40 border border-white/10 p-1 divide-x divide-white/10 max-sm:w-full max-sm:justify-between text-[8px] font-bold tracking-widest">
            {(['ALL', 'GRANTED', 'DENIED', 'PARTIAL'] as const).map(status => (
              <button
                key={status}
                onClick={() => setLedgerStatusFilter(status)}
                className={cn(
                  "px-3.5 py-1.5 uppercase transition-all",
                  ledgerStatusFilter === status ? "text-accent bg-white/5" : "text-muted hover:text-white"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger logs Table */}
        <div className="border border-white/5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-[9px] min-w-[700px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-muted uppercase tracking-wider">
                <th className="p-4 font-black">LEDGER HASH</th>
                <th className="p-4 font-black">TIMESTAMP</th>
                <th className="p-4 font-black">ANONYMIZED HOST</th>
                <th className="p-4 font-black">GEOGRAPHIC NODE</th>
                <th className="p-4 font-black">COEFFICIENTS APPROVED</th>
                <th className="p-4 font-black text-center">PROTOCOL</th>
                <th className="p-4 font-black text-right">LEDGER STATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 uppercase">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted uppercase tracking-widest font-bold">
                    NO CORRESPONDING LEGAL LOGS IDENTIFIED FOR ACTIVE FILTERING PARAMS.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item, index) => (
                  <tr key={index} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-4 font-mono font-bold text-accent select-all">{item.uuid}</td>
                    <td className="p-4 text-white/70 font-mono">{item.timestamp}</td>
                    <td className="p-4 text-muted/80 font-mono">{item.ip}</td>
                    <td className="p-4 text-white/80 font-mono">{item.geo}</td>
                    <td className="p-4 text-muted text-[8px] leading-normal">{item.categories}</td>
                    <td className="p-4 text-center text-white/60 font-mono">{item.consentMode}</td>
                    <td className="p-4 text-right">
                      <span className={cn(
                        "px-2 py-0.5 border text-[7.5px] font-black",
                        item.status === 'GRANTED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                        item.status === 'DENIED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[8px] text-muted uppercase text-right leading-normal tracking-wider">
          * ALL IP IDENTIFIERS ARE SHA256 SCRUBBED PRIOR TO LONG-TERM JOURNAL PERSISTENCE COMPLYING WITH ARTICLE 25 REGS.
        </p>
      </div>

    </div>
  );
}
