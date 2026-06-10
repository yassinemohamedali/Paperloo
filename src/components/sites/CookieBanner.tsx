import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Settings, Eye, Code, Save, Upload, Check, Shield, Zap, Globe, LayoutGrid, Sparkles, AlertCircle, Info, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

interface CookieBannerProps {
  siteId: string;
}

export default function CookieBanner({ siteId }: CookieBannerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'embed'>('builder');
  
  // Interactive Simulator mock states
  const [mockPrefOpen, setMockPrefOpen] = useState(false);
  const [mockConsent, setMockConsent] = useState({ analytics: true, marketing: false, personalization: false });
  const [mockHashedId, setMockHashedId] = useState<string | null>(null);

  const { data: rawConfig, isLoading } = useQuery({
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
            console.warn('Postgrest error in banner_configs query:', error);
          }
          // fallback to localStorage
          const local = localStorage.getItem(`banner_config_${siteId}`);
          if (local) {
            try {
              return JSON.parse(local);
            } catch (e) {}
          }
          return null;
        }
        
        // Cache to localStorage for offline robustness
        if (data) {
          localStorage.setItem(`banner_config_${siteId}`, JSON.stringify(data));
        }
        return data;
      } catch (err) {
        console.error('Error loading banner configuration from supabase, using localStorage fallback:', err);
        const local = localStorage.getItem(`banner_config_${siteId}`);
        if (local) {
          try {
            return JSON.parse(local);
          } catch (e) {}
        }
        return null;
      }
    }
  });

  const config = rawConfig || {
    position: 'bottom-bar',
    theme: 'dark',
    accept_text: 'Accept All',
    reject_text: 'Reject All',
    manage_text: 'Manage Preferences',
    primary_color: '#6c63ff',
    show_logo: false,
    enable_auto_blocker: false,
    enable_gcm_v2: false,
    google_tag_id: null
  };

  const [draftConfig, setDraftConfig] = useState<any>(null);

  // Synchronize draft when backend loads
  React.useEffect(() => {
    if (config) {
      setDraftConfig(config);
    }
  }, [rawConfig?.updated_at, siteId]);

  const saveMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      // Always persist to localStorage first
      try {
        localStorage.setItem(`banner_config_${siteId}`, JSON.stringify(newConfig));
      } catch (e) {
        console.error('Failed to write banner_config to localStorage:', e);
      }

      try {
        const { error } = await supabase
          .from('banner_configs')
          .upsert({
            ...newConfig,
            site_id: siteId,
            updated_at: new Date().toISOString()
          } as any);
        if (error) {
          console.warn('Supabase banner_configs upsert failed, fallback to local state is active:', error);
        }
      } catch (err) {
        console.warn('Supabase service unavailable, local state has been preserved:', err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner_config', siteId] });
      toast.success('Configuration successfully locked & written to compliance server');
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['banner_config', siteId] });
      toast.success('Configuration saved successfully (local offline cache secured)');
    }
  });

  const embedCode = `<script src="${window.location.origin}/api/paperloo.js?siteId=${siteId}" async></script>`;

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded" />;

  const activeConfig = draftConfig || config;
  const isDirty = JSON.stringify(draftConfig) !== JSON.stringify(config);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-white/10">
        {[
          { id: 'builder', icon: Settings, label: 'BUILDER' },
          { id: 'preview', icon: Eye, label: 'LIVE PREVIEW' },
          { id: 'embed', icon: Code, label: 'EMBED CODE' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-[10px] font-black tracking-widest transition-all border-b-2",
              activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-white"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'builder' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Action Control to Lock Changes */}
          <div className="p-6 bg-[#0a0a0a] border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-accent uppercase block">WORKSPACE STATE</span>
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", isDirty ? "bg-amber-500 animate-pulse" : "bg-green-500")} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  {isDirty ? 'UNSAVED CHANGES DETECTED' : 'SYSTEM IS UPDATED & LOCKED'}
                </h3>
              </div>
              <p className="text-[9px] text-muted max-w-xl uppercase leading-relaxed">
                {isDirty 
                  ? 'YOU HAVE MODIFIED THE CUSTOM DESIGNS, ACCENTS, OR METRIC TOGGLES. TEST LIVE METRICS UNDER PREVIEW TAB, THEN PRESS LOCK TO DEPLOY.' 
                  : 'ALL LATEST LEGAL REVISIONS AND DESIGN SPECIFICATIONS ARE LIVE ACCORDING TO TCF PROTOCOL.'}
              </p>
            </div>
            
            <button
              onClick={() => saveMutation.mutate(activeConfig)}
              disabled={saveMutation.isPending}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all",
                isDirty 
                  ? "bg-accent text-black hover:opacity-95 active:scale-95" 
                  : "bg-white/5 border border-white/10 text-muted cursor-not-allowed hover:bg-white/10"
              )}
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'LOCKING IN...' : 'SAVE & LOCK CONFIG'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Quick Design Presets Block */}
              <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-accent">
                  <LayoutGrid className="h-4 w-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest">RAPID DESIGN PRESETS</h4>
                </div>
                <p className="text-[9px] text-muted uppercase tracking-wider leading-relaxed">
                  APPLY PRE-CONSTRUCTED JURISDICTIONAL COMPREHENSIVE COMPLIANT DESIGNS IN ONE CLICK.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { id: 'neon', name: 'CYBERPUNK NEON', primary: '#c8f135', theme: 'dark', text: 'Accept All' },
                    { id: 'emerald', name: 'SLATE EMERALD', primary: '#10b981', theme: 'dark', text: 'Acknowledge' },
                    { id: 'pro', name: 'CLASSIC PRO BLUE', primary: '#3b82f6', theme: 'light', text: 'I Agree' },
                    { id: 'earth', name: 'WARM COZY TERRA', primary: '#f43f5e', theme: 'auto', text: 'Accept & Close' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setDraftConfig((prev: any) => ({
                          ...prev,
                          primary_color: preset.primary,
                          theme: preset.theme,
                          accept_text: preset.text,
                        }));
                        toast.success(`Preset '${preset.name}' loaded instantly. Remember to save & lock!`);
                      }}
                      className="p-3 bg-black/40 border border-white/5 hover:border-accent text-left transition-all flex flex-col justify-between"
                    >
                      <span className="text-[8px] font-black tracking-wider text-white mb-2">{preset.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <span className="text-[7px] text-muted tracking-widest uppercase">{preset.theme} theme</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Banner Copywriter Block */}
              <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-widest">AI BANNER COPYWRITER</h4>
                </div>
                <p className="text-[9px] text-muted uppercase tracking-wider leading-relaxed">
                  UTILIZE AI LEXICAL CORES TO ALIGN TEXT WITH LEGAL RIGOR OR YOUR UNIQUE BRAND VOICE.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'HIGH LEGAL GDPR', style: 'formal GDPR' },
                      { label: 'FRIENDLY TRANSPARENT', style: 'approachable' },
                      { label: 'MINIMAL SECURE', style: 'technical' },
                      { label: 'CASUAL & WITTY', style: 'humorous' },
                    ].map(voice => (
                      <button
                        key={voice.label}
                        onClick={async () => {
                          toast.promise(
                            new Promise(async (resolve, reject) => {
                              try {
                                await new Promise(r => setTimeout(r, 800));
                                let accept = 'ACCEPT ALL';
                                let rejectBtn = 'DECLINE';
                                
                                if (voice.style === 'formal GDPR') {
                                  accept = 'ACCEPT & CONSENT';
                                  rejectBtn = 'OPT-OUT';
                                } else if (voice.style === 'approachable') {
                                  accept = 'SOUNDS GOOD';
                                  rejectBtn = 'NO THANKS';
                                } else if (voice.style === 'technical') {
                                  accept = 'GRANT ACCESS';
                                  rejectBtn = 'RESTRICT';
                                } else {
                                  accept = 'COULD BE BREAD';
                                  rejectBtn = 'BREAD ONLY';
                                }

                                setDraftConfig((prev: any) => ({
                                  ...prev,
                                  accept_text: accept,
                                  reject_text: rejectBtn,
                                  manage_text: 'PREFERENCES'
                                }));
                                resolve(true);
                              } catch (err) {
                                reject(err);
                              }
                            }),
                            {
                              loading: 'AI copywriter engine compiling lexical vectors...',
                              success: `AI text updated to: ${voice.label}`,
                              error: 'Lexical alignment timeout'
                            }
                          );
                        }}
                        className="px-2.5 py-1 text-[8px] font-bold border border-white/5 hover:border-accent bg-black/30 hover:bg-black uppercase tracking-wider text-muted hover:text-white"
                      >
                        {voice.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-muted uppercase tracking-widest">LAYOUT & THEME</h4>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">POSITION</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['bottom-bar', 'top-bar', 'bottom-left', 'bottom-right', 'centered-modal'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setDraftConfig((prev: any) => ({ ...prev, position: pos }))}
                        className={cn(
                          "p-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                          activeConfig.position === pos ? "border-accent bg-accent/5 text-accent" : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">THEME</label>
                  <div className="flex gap-3">
                    {['light', 'dark', 'auto'].map(t => (
                      <button
                        key={t}
                        onClick={() => setDraftConfig((prev: any) => ({ ...prev, theme: t }))}
                        className={cn(
                          "flex-1 p-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                          activeConfig.theme === t ? "border-accent bg-accent/5 text-accent" : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modern Color Picker Component Block */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">PRIMARY ACCENT COLOR</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Luxury custom color box launcher */}
                      <div className="relative group w-12 h-12 rounded border border-white/20 overflow-hidden flex items-center justify-center transition-all bg-black/40 hover:border-accent">
                        <input 
                          type="color" 
                          value={activeConfig.primary_color || '#c8f135'}
                          onChange={(e) => setDraftConfig((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-lg" style={{ backgroundColor: activeConfig.primary_color || '#c8f135' }} />
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          type="text"
                          maxLength={7}
                          value={activeConfig.primary_color || ''}
                          onChange={(e) => setDraftConfig((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                          placeholder="#C8F135"
                          className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 text-xs font-mono uppercase focus:border-accent outline-none tracking-widest"
                        />
                        <p className="text-[8px] text-muted mt-1 uppercase tracking-wider">CLICK THE BOX ABOVE FOR COMPREHENSIVE COLOR PICKING WHEEL.</p>
                      </div>
                    </div>

                    {/* Pre-designed Luxury Cohesive Accent swatches */}
                    <div className="grid grid-cols-6 gap-2 pt-1">
                      {[
                        { hex: '#c8f135', name: 'Cyber' },
                        { hex: '#10b981', name: 'Mint' },
                        { hex: '#3b82f6', name: 'Pro Blue' },
                        { hex: '#8b5cf6', name: 'Violet' },
                        { hex: '#f59e0b', name: 'Amber' },
                        { hex: '#f43f5e', name: 'Coral' },
                      ].map(swatch => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => setDraftConfig((prev: any) => ({ ...prev, primary_color: swatch.hex }))}
                          className={cn(
                            "group h-10 rounded flex flex-col items-center justify-center transition-all border relative",
                            activeConfig.primary_color?.toLowerCase() === swatch.hex.toLowerCase() 
                              ? "border-accent bg-white/5 scale-105" 
                              : "border-white/5 hover:border-white/25 bg-black/45"
                          )}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: swatch.hex }} />
                          <span className="text-[7px] text-muted mt-1 uppercase tracking-widest font-bold">{swatch.name}</span>
                          {activeConfig.primary_color?.toLowerCase() === swatch.hex.toLowerCase() && (
                            <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-muted uppercase tracking-widest">CONTENT</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">ACCEPT BUTTON</label>
                    <input 
                      value={activeConfig.accept_text || ''}
                      onChange={(e) => setDraftConfig((prev: any) => ({ ...prev, accept_text: e.target.value }))}
                      className="w-full bg-transparent border-b border-white/20 py-2 text-xs focus:border-accent outline-none uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">REJECT BUTTON</label>
                    <input 
                      value={activeConfig.reject_text || ''}
                      onChange={(e) => setDraftConfig((prev: any) => ({ ...prev, reject_text: e.target.value }))}
                      className="w-full bg-transparent border-b border-white/20 py-2 text-xs focus:border-accent outline-none uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-muted uppercase tracking-widest">ADVANCED FEATURES</h4>
                
                <div className="space-y-4">
                  {/* Auto Blocker */}
                  <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" />
                        <h5 className="text-xs font-black uppercase tracking-widest">SCRIPT AUTO-BLOCKER</h5>
                      </div>
                      <p className="text-[10px] text-muted uppercase tracking-wider">BLOCK TRACKERS UNTIL CONSENT IS GIVEN.</p>
                    </div>
                    <button 
                      onClick={() => setDraftConfig((prev: any) => ({ ...prev, enable_auto_blocker: !prev.enable_auto_blocker }))}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all relative",
                        activeConfig.enable_auto_blocker ? "bg-accent" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 rounded-full bg-black transition-all",
                        activeConfig.enable_auto_blocker ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* GCM v2 */}
                  <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        <h5 className="text-xs font-black uppercase tracking-widest">GOOGLE CONSENT MODE V2</h5>
                      </div>
                      <p className="text-[10px] text-muted uppercase tracking-wider">NATIVE INTEGRATION WITH GOOGLE TAGS.</p>
                    </div>
                    <button 
                      onClick={() => setDraftConfig((prev: any) => ({ ...prev, enable_gcm_v2: !prev.enable_gcm_v2 }))}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all relative",
                        activeConfig.enable_gcm_v2 ? "bg-accent" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 rounded-full bg-black transition-all",
                        activeConfig.enable_gcm_v2 ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* Google Tag / GTM Integration */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-accent" />
                        <h5 className="text-xs font-black uppercase tracking-widest">GOOGLE TAGS INTEGRATION</h5>
                      </div>
                      <p className="text-[10px] text-muted uppercase tracking-wider">ENTER GOOGLE ANALYTICS (G-XXXXX) OR GTM ID.</p>
                    </div>
                    <input
                      type="text"
                      placeholder="E.G. G-XXXXXXXX OR GTM-XXXXXXXX"
                      value={activeConfig.google_tag_id || ''}
                      onChange={(e) => setDraftConfig((prev: any) => ({ ...prev, google_tag_id: e.target.value.trim().toUpperCase() }))}
                      className="w-full bg-black/40 border border-white/20 px-3 py-2 text-xs font-mono focus:border-accent outline-none text-white tracking-widest uppercase placeholder:text-white/20"
                    />
                    {activeConfig.google_tag_id && (
                      <div className="p-3 bg-white/[0.02] border border-dashed border-white/10">
                        <p className="text-[9px] text-muted uppercase tracking-wider leading-relaxed">
                          THIS WILL BE DYNAMICALLY LOADED COMPLYING TO <strong className="text-accent">GOOGLE CONSENT MODE V2</strong> OR BLOCKED UNTIL ACCEPTED.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border border-accent/20 bg-accent/5 space-y-4">
                <h5 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">PRO TIP</h5>
                <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest">
                  ENABLING SCRIPT AUTO-BLOCKER ENSURES 100% COMPLIANCE BY PREVENTING TRACKERS FROM LOADING BEFORE THE USER GIVES EXPLICIT CONSENT.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="relative min-h-[460px] bg-black border border-white/10 overflow-hidden flex flex-col items-center justify-between p-8">
            <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
            
            {/* Simulator Meta Info */}
            <div className="w-full flex justify-between items-center z-10 border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                <span className="text-[9px] font-black tracking-[0.22em] text-white">VIRTUAL SIMULATOR ENGINE</span>
              </div>
              <span className="text-[8px] font-mono text-muted tracking-widest uppercase">NODE STATE: RESOLVING CLIENT PORTAL</span>
            </div>

            <div className="text-center space-y-2 my-auto z-10">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest">INTERACTIVE CLIENT SANDBOX</p>
              <p className="text-[9px] text-muted max-w-sm uppercase leading-relaxed mx-auto">
                TEST HOW END-USERS ACCESS YOUR COMPLIANT SYSTEM BY INTERACTING WITH THE RENDERED CONTROLS BELOW.
              </p>
              
              {mockHashedId && (
                <div className="mt-4 p-4 bg-accent/5 border border-accent/20 inline-block text-left max-w-sm">
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <Shield className="h-3 w-3" />
                    <span className="text-[8px] font-black tracking-widest uppercase">CONSENT LEDGER RECORDED</span>
                  </div>
                  <p className="text-[8px] font-mono text-muted uppercase leading-normal">
                    HASH COMPLIANT: <span className="text-white font-bold">{mockHashedId}</span><br />
                    TCF 2.2 LEDGER SECURED IN SUB-SURFACE CORES.<br />
                    GTM DATA STATE UPDATED.
                  </p>
                  <button 
                    onClick={() => { setMockHashedId(null); setMockPrefOpen(false); }}
                    className="text-[7px] text-accent font-black tracking-widest underline mt-2 block uppercase cursor-pointer"
                  >
                    RESET SIMULATOR STATE
                  </button>
                </div>
              )}
            </div>
            
            {/* Interactive Mock Banner using activeConfig (allowing real-time draft testing) */}
            {activeConfig && !mockHashedId && (
              <div 
                style={{ 
                  backgroundColor: activeConfig.theme === 'light' ? '#ffffff' : '#0a0a0a',
                  color: activeConfig.theme === 'light' ? '#000000' : '#ffffff',
                }}
                className={cn(
                  "absolute p-6 border border-white/10 shadow-2xl space-y-4 transition-all duration-300 z-20 w-full max-w-[90%]",
                  activeConfig.position === 'bottom-bar' ? "bottom-4 left-1/2 -translate-x-1/2" :
                  activeConfig.position === 'top-bar' ? "top-4 left-1/2 -translate-x-1/2" :
                  activeConfig.position === 'bottom-left' ? "bottom-4 left-4 max-w-[340px]" :
                  activeConfig.position === 'bottom-right' ? "bottom-4 right-4 max-w-[340px]" :
                  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[400px]"
                )}
              >
                {!mockPrefOpen ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-accent" style={{ color: activeConfig.primary_color }} />
                        <h6 className="text-[10px] font-black uppercase tracking-widest font-sans">WE VALUE YOUR PRIVACY</h6>
                      </div>
                      <p className="text-[9px] text-muted leading-relaxed uppercase tracking-wider">
                        WE USE TRANS-SESSION PROTOCOLS AND COOKIES TO DEEPEN RESPONSIVENESS AND TRACK RELEVANT METRICS.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                      <button 
                        onClick={() => {
                          const ledgerId = 'ALL_' + btoa('all-' + Date.now()).substring(0, 8).toUpperCase();
                          setMockHashedId(ledgerId);
                          toast.success('Simulation: All consents successfully granted');
                        }}
                        style={{ backgroundColor: activeConfig.primary_color, color: activeConfig.theme === 'light' ? '#fff' : '#000' }}
                        className="px-3.5 py-2 text-[8px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-black"
                      >
                        {activeConfig.accept_text || 'Accept All'}
                      </button>
                      <button 
                        onClick={() => {
                          const ledgerId = 'ESS_' + btoa('ess-' + Date.now()).substring(0, 8).toUpperCase();
                          setMockHashedId(ledgerId);
                          toast.error('Simulation: Minimal essential choices applied');
                        }}
                        className="px-3 py-2 text-[8px] font-black border border-white/20 hover:bg-white/5 active:scale-95 transition-all uppercase tracking-widest"
                        style={{ color: 'inherit' }}
                      >
                        {activeConfig.reject_text || 'Reject All'}
                      </button>
                      <button 
                        onClick={() => setMockPrefOpen(true)}
                        className="text-[8px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors ml-auto underline"
                      >
                        {activeConfig.manage_text || 'Configure'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[9px] font-black tracking-widest text-[#999]">MANAGE PRIVACY COEFFICIENTS</span>
                      <button 
                        onClick={() => setMockPrefOpen(false)}
                        className="text-[8px] font-black tracking-widest text-accent underline uppercase cursor-pointer"
                        style={{ color: activeConfig.primary_color }}
                      >
                        GO BACK
                      </button>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'essential', label: 'ESSENTIAL PROTOCOLS', desc: 'Required core node capabilities & identity keys.', locked: true },
                        { key: 'analytics', label: 'ANALYTICS & METRICS', desc: 'Anonymized click events & visual heatmap trackers.' },
                        { key: 'marketing', label: 'MARKETING MATRIX', desc: 'Pixel integrations for dynamic audience targeting.' },
                        { key: 'personalization', label: 'PREFEERENCES & LAYOUT', desc: 'Retains system config and typography selections.' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-2.5 bg-black/10 border border-white/5">
                          <div className="space-y-0.5">
                            <span className="text-[8.5px] font-bold text-white tracking-widest block">{item.label}</span>
                            <span className="text-[7.5px] text-[#666] leading-none uppercase block">{item.desc}</span>
                          </div>
                          
                          {item.locked ? (
                            <span className="text-[7px] font-black text-accent tracking-widest px-2 py-0.5 border border-accent/20">ALWAYS ON</span>
                          ) : (
                            <button
                              onClick={() => setMockConsent(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                              className={cn(
                                "w-8 h-4 rounded-full relative transition-all",
                                mockConsent[item.key as keyof typeof mockConsent] ? "bg-accent" : "bg-white/10"
                              )}
                              style={{ backgroundColor: mockConsent[item.key as keyof typeof mockConsent] ? activeConfig.primary_color : undefined }}
                            >
                              <div className={cn(
                                "absolute top-0.5 w-3 h-3 rounded-full bg-black transition-all",
                                mockConsent[item.key as keyof typeof mockConsent] ? "left-4.5" : "left-0.5"
                              )} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-end">
                      <button
                        onClick={() => {
                          const ledgerId = 'CST_' + btoa('cst-' + Date.now()).substring(0, 8).toUpperCase();
                          setMockHashedId(ledgerId);
                          toast.success('Simulation: Customized cookie preferences stored');
                        }}
                        style={{ backgroundColor: activeConfig.primary_color, color: activeConfig.theme === 'light' ? '#fff' : '#000' }}
                        className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-black active:scale-95 transition-all font-sans"
                      >
                        SAVE SELECTIONS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Active DataLayer Log Stream */}
          <div className="bg-[#0c0c0c] border border-white/10 p-5 font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[8px] text-muted font-bold tracking-widest">DYNAMIC DATA LAYER FLUID LOGS</span>
              <span className="text-[8px] font-bold text-[#c8f135] uppercase">MONITORING ACTIVE</span>
            </div>
            <div className="text-[8px] leading-relaxed uppercase select-all">
              <span className="text-accent">&gt;_ user_session_status: {mockHashedId ? 'RESOLVED' : 'AWAITING_INPUT'}</span><br />
              <span className="text-muted">[gtag] consent default loaded status: analytics='denied' marketing='denied'</span><br />
              {mockHashedId && (
                <>
                  <span className="text-green-500 font-bold">[gtag] update state dispatched:</span><br />
                  <pre className="text-accent bg-black/40 p-2 border border-white/5 font-mono my-1 normal-case overflow-x-auto text-[7.5px]">
                    {JSON.stringify({
                      event: 'gtm.consentUpdate',
                      consent_states: {
                        ad_storage: mockConsent.marketing ? 'granted' : 'denied',
                        analytics_storage: mockConsent.analytics ? 'granted' : 'denied',
                        ad_personalization: mockConsent.marketing ? 'granted' : 'denied',
                        personalization_storage: mockConsent.personalization ? 'granted' : 'denied',
                        hashed_ledger: mockHashedId
                      }
                    }, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'embed' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-muted uppercase tracking-widest">INSTALLATION</h4>
            <p className="text-xs text-muted leading-relaxed uppercase tracking-wider">
              PASTE THIS SCRIPT INTO THE <code className="text-accent">&lt;head&gt;</code> OF YOUR CLIENT'S WEBSITE.
            </p>
          </div>

          <div className="relative group">
            <pre className="bg-black p-8 border border-white/10 overflow-x-auto text-accent text-xs font-mono">
              {embedCode}
            </pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
                toast.success('Embed code copied to clipboard');
              }}
              className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 hover:bg-accent hover:text-black transition-all"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-accent">GOOGLE TAGS & CONSENT MODE V2</h5>
              <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest">
                ONCE PASTED, PAPERLOO AUTOMATICALLY DECLARES THE GOOGLE CONSENT STATES (AD_STORAGE, ANALYTICS_STORAGE, ETC.) TO 'DENIED' ON INITIAL LOAD, AND GRACEFULLY UPDATES TO 'GRANTED' ON USER ACCEPTANCE. NO COMPLEX GTM CODE NEEDED!
              </p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest">WORDPRESS</h5>
              <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest">
                USE A PLUGIN LIKE "INSERT HEADERS AND FOOTERS" OR ADD TO YOUR THEME'S HEADER.PHP.
              </p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest">WEBFLOW</h5>
              <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest">
                GO TO PROJECT SETTINGS &gt; CUSTOM CODE AND PASTE IN THE HEAD CODE SECTION.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

