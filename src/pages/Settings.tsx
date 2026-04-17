import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Building2, Upload, Trash2, ShieldAlert, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id as string)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { error } = await (supabase
        .from('profiles') as any)
        .update(updates)
        .eq('id', user?.id as string);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Settings updated');
    },
  });

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agency-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agency-assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ logo_url: publicUrl })
        .eq('id', user?.id as string);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This will delete all your data and client sites. This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase.rpc('delete_user_data');
      if (error) throw error;
      
      await signOut();
      toast.success('Account deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading || !profile) return <div className="animate-pulse space-y-12">
    <div className="h-64 bg-surface rounded-[10px]" />
    <div className="h-64 bg-surface rounded-[10px]" />
  </div>;

  return (
    <div className="max-w-3xl space-y-12">
      <div className="space-y-2">
        <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em]">SETTINGS</h2>
        <p className="text-muted text-sm tracking-[0.15em]">MANAGE YOUR AGENCY PROFILE AND PREFERENCES.</p>
      </div>

      {/* Agency Profile */}
      <div className="bg-surface border border-white/10 p-10 space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-[10px] bg-accent/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-extrabold tracking-[0.04em]">AGENCY PROFILE</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">PUBLIC INFORMATION</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-10">
            <div className="relative group">
              <div className="h-24 w-24 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center overflow-hidden">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[10px]">
                <Upload className="h-5 w-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={uploadLogo} disabled={uploading} />
              </label>
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">AGENCY NAME</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  defaultValue={profile.agency_name || ''} 
                  onBlur={(e) => updateMutation.mutate({ agency_name: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xl focus:border-accent outline-none transition-colors uppercase" 
                  placeholder="ACME CREATIVE" 
                />
                {updateMutation.isPending && <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin self-center" />}
                {updateMutation.isSuccess && <Check className="h-5 w-5 text-accent self-center" />}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted">EMAIL ADDRESS</label>
            <p className="text-lg font-medium text-muted py-2">{profile.email || 'N/A'}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">EMAIL CANNOT BE CHANGED</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-surface border border-white/10 p-10 space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-[10px] bg-accent/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-extrabold tracking-[0.04em]">PREFERENCES</h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">APP BEHAVIOR</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* White Label */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm tracking-wider">WHITE LABEL MODE</h4>
                {profile.plan === 'starter' && (
                  <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-[8px] font-black text-accent uppercase tracking-widest">AGENCY PLAN</span>
                )}
              </div>
              <p className="text-xs text-muted font-light">REMOVE PAPERLOO BRANDING FROM CLIENT PORTALS AND DOCS.</p>
            </div>
            <button 
              onClick={() => {
                if (profile.plan === 'starter') {
                  toast.error('White labeling is only available on Agency and Enterprise plans.', {
                    action: {
                      label: 'Upgrade',
                      onClick: () => navigate('/billing')
                    }
                  });
                  return;
                }
                updateMutation.mutate({ white_label_enabled: !profile.white_label_enabled });
              }}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                profile.white_label_enabled ? "bg-accent" : "bg-white/10",
                profile.plan === 'starter' && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-black transition-all",
                profile.white_label_enabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-sm tracking-wider">WEEKLY EMAIL DIGEST</h4>
              <p className="text-xs text-muted font-light">RECEIVE A SUMMARY OF YOUR COMPLIANCE STATUS EVERY MONDAY.</p>
            </div>
            <button 
              onClick={() => updateMutation.mutate({ weekly_digest_enabled: !profile.weekly_digest_enabled })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                profile.weekly_digest_enabled ? "bg-accent" : "bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-black transition-all",
                profile.weekly_digest_enabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          {/* Review Interval */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm tracking-wider">REVIEW INTERVAL</h4>
              <p className="text-xs text-muted font-light">HOW OFTEN SHOULD DOCUMENTS BE REVIEWED (DAYS).</p>
            </div>
            <select 
              defaultValue={profile.review_interval_days || 90}
              onChange={(e) => updateMutation.mutate({ review_interval_days: parseInt(e.target.value) })}
              className="w-full bg-black border border-white/10 p-3 text-sm focus:border-accent outline-none transition-colors"
            >
              <option value={30}>30 DAYS</option>
              <option value={60}>60 DAYS</option>
              <option value={90}>90 DAYS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface border border-red-500/20 p-10 bg-red-500/[0.02] space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-[10px] bg-red-500/10 flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-extrabold tracking-[0.04em] text-red-500">DANGER ZONE</h3>
            <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest">IRREVERSIBLE ACTIONS</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="space-y-1">
            <h4 className="font-bold text-sm tracking-wider">DELETE ACCOUNT</h4>
            <p className="text-xs text-muted font-light">PERMANENTLY REMOVE ALL YOUR DATA, SITES, AND DOCUMENTS. THIS CANNOT BE UNDONE.</p>
          </div>
          <button 
            onClick={deleteAccount}
            className="bracket-btn border-red-500/30 text-red-500 hover:bg-red-500/10 py-2 px-6"
          >
            <span className="bracket-btn-inner"></span>
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
