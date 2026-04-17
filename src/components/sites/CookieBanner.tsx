import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Settings, Eye, Code, Save, Upload, Check, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

interface CookieBannerProps {
  siteId: string;
}

export default function CookieBanner({ siteId }: CookieBannerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'embed'>('builder');

  const { data: config, isLoading } = useQuery({
    queryKey: ['banner_config', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner_configs')
        .select('*')
        .eq('site_id', siteId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || {
        position: 'bottom-bar',
        theme: 'dark',
        accept_text: 'Accept All',
        reject_text: 'Reject All',
        manage_text: 'Manage Preferences',
        primary_color: '#6c63ff',
        show_logo: false,
        enable_auto_blocker: false,
        enable_gcm_v2: false
      };
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const { error } = await supabase
        .from('banner_configs')
        .upsert({
          ...newConfig,
          site_id: siteId,
          updated_at: new Date().toISOString()
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner_config', siteId] });
      toast.success('Banner configuration saved');
    },
    onError: (error: any) => toast.error(error.message)
  });

  const embedCode = `<script src="${window.location.origin}/api/paperloo.js?siteId=${siteId}" async></script>`;

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded" />;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-xs font-black text-muted uppercase tracking-widest">LAYOUT & THEME</h4>
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">POSITION</label>
                <div className="grid grid-cols-2 gap-3">
                  {['bottom-bar', 'top-bar', 'bottom-left', 'bottom-right', 'centered-modal'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => saveMutation.mutate({ ...config, position: pos })}
                      className={cn(
                        "p-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                        config.position === pos ? "border-accent bg-accent/5 text-accent" : "border-white/10 hover:border-white/30"
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
                      onClick={() => saveMutation.mutate({ ...config, theme: t })}
                      className={cn(
                        "flex-1 p-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                        config.theme === t ? "border-accent bg-accent/5 text-accent" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">PRIMARY COLOR</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={config.primary_color}
                    onChange={(e) => saveMutation.mutate({ ...config, primary_color: e.target.value })}
                    className="h-10 w-20 bg-transparent border border-white/10 cursor-pointer"
                  />
                  <span className="text-xs font-mono uppercase">{config.primary_color}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black text-muted uppercase tracking-widest">CONTENT</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">ACCEPT BUTTON</label>
                  <input 
                    value={config.accept_text}
                    onChange={(e) => saveMutation.mutate({ ...config, accept_text: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-xs focus:border-accent outline-none uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">REJECT BUTTON</label>
                  <input 
                    value={config.reject_text}
                    onChange={(e) => saveMutation.mutate({ ...config, reject_text: e.target.value })}
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
                    onClick={() => saveMutation.mutate({ ...config, enable_auto_blocker: !config.enable_auto_blocker })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all relative",
                      config.enable_auto_blocker ? "bg-accent" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-black transition-all",
                      config.enable_auto_blocker ? "left-6" : "left-1"
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
                    onClick={() => saveMutation.mutate({ ...config, enable_gcm_v2: !config.enable_gcm_v2 })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all relative",
                      config.enable_gcm_v2 ? "bg-accent" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-black transition-all",
                      config.enable_gcm_v2 ? "left-6" : "left-1"
                    )} />
                  </button>
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
      )}

      {activeTab === 'preview' && (
        <div className="relative aspect-video bg-black border border-white/10 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 scan-lines opacity-10" />
          <p className="text-muted text-[10px] font-bold uppercase tracking-widest">CLIENT SITE PREVIEW</p>
          
          {/* Mock Banner */}
          <div className={cn(
            "absolute p-6 bg-surface border border-white/10 shadow-2xl space-y-4 transition-all duration-500",
            config.position === 'bottom-bar' ? "bottom-0 left-0 right-0 border-x-0 border-b-0" :
            config.position === 'top-bar' ? "top-0 left-0 right-0 border-x-0 border-t-0" :
            config.position === 'bottom-left' ? "bottom-6 left-6 w-80" :
            config.position === 'bottom-right' ? "bottom-6 right-6 w-80" :
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96"
          )}>
            <div className="space-y-2">
              <h6 className="text-xs font-black uppercase tracking-widest">WE VALUE YOUR PRIVACY</h6>
              <p className="text-[10px] text-muted leading-relaxed uppercase tracking-wider">
                WE USE COOKIES TO ENHANCE YOUR BROWSING EXPERIENCE AND ANALYZE OUR TRAFFIC.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-accent transition-colors">
                {config.accept_text}
              </button>
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-colors">
                {config.reject_text}
              </button>
              <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
                {config.manage_text}
              </button>
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
