import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Bell, CheckCircle2, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

type AlertWithSite = Database['public']['Tables']['alerts']['Row'] & {
  sites: { name: string } | null;
};

export default function Alerts() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<AlertWithSite[]>({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*, sites(name)')
        .eq('agency_id', user?.id as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any) || [];
    },
    enabled: !!user?.id,
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('alerts') as any)
        .update({ resolved: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert marked as resolved');
    },
  });

  if (isLoading) return <div className="animate-pulse space-y-6">
    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface rounded-[10px]" />)}
  </div>;

  const pendingAlerts = alerts?.filter(a => !a.resolved) || [];
  const resolvedAlerts = alerts?.filter(a => a.resolved) || [];

  return (
    <div className="max-w-4xl space-y-12">
      <div className="space-y-2">
        <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em]">Compliance Alerts</h2>
        <p className="text-muted-custom font-light">Stay updated on regulation changes affecting your client sites.</p>
      </div>

      {/* Pending Alerts */}
      <div className="space-y-6">
        <h3 className="text-xs font-sans font-extrabold uppercase tracking-[0.04em] text-muted-custom flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-accent" />
          Action Required ({pendingAlerts.length})
        </h3>
        
        {pendingAlerts.length > 0 ? (
          <div className="space-y-4">
            {pendingAlerts.map((alert) => (
              <div key={alert.id} className="glass-panel p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-custom" />
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.04em] text-muted-custom">
                        {(alert.sites as any)?.name}
                      </span>
                    </div>
                    <p className="font-medium text-text-custom">{alert.message}</p>
                    <p className="text-xs text-muted-custom font-light">
                      Received {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => resolveMutation.mutate(alert.id)}
                  className="btn-ghost py-2 px-4 text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolve
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel py-16 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-custom/20" />
            <p className="text-muted-custom font-light">All clear! No pending alerts.</p>
          </div>
        )}
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-sans font-extrabold uppercase tracking-[0.04em] text-muted-custom">Resolved</h3>
          <div className="space-y-3">
            {resolvedAlerts.map((alert) => (
              <div key={alert.id} className="glass-panel p-4 flex items-center justify-between opacity-50 grayscale">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-4 w-4 text-green-custom" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium line-through">{alert.message}</p>
                    <p className="text-[10px] text-muted-custom">Resolved on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
