import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { Mail, Inbox, CheckCircle2, Clock, Code, Copy, Check, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

interface DSARInboxProps {
  siteId: string;
}

type DSARRequest = Database['public']['Tables']['dsar_requests']['Row'];

export default function DSARInbox({ siteId }: DSARInboxProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inbox' | 'embed'>('inbox');
  const [filter, setFilter] = useState('all');

  const { data: requests, isLoading } = useQuery<DSARRequest[]>({
    queryKey: ['dsar_requests', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dsar_requests')
        .select('*')
        .eq('site_id', siteId)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await (supabase
        .from('dsar_requests') as any)
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsar_requests', siteId] });
      toast.success('Request status updated');
    },
    onError: (error: any) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dsar_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsar_requests', siteId] });
      toast.success('Request deleted');
    }
  });

  const embedCode = `<!-- Paperloo DSAR Form -->
<div id="paperloo-dsar-form"></div>
<script src="${window.location.origin}/api/paperloo.js?siteId=${siteId}" async></script>`.trim();

  const filteredRequests = requests?.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-white/10">
        {[
          { id: 'inbox', icon: Inbox, label: 'REQUEST INBOX' },
          { id: 'embed', icon: Code, label: 'EMBED FORM' }
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

      {activeTab === 'inbox' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted" />
              <div className="flex gap-2">
                {['all', 'pending', 'in-progress', 'completed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1 text-[8px] font-black uppercase tracking-widest border transition-all",
                      filter === f ? "border-accent text-accent bg-accent/5" : "border-white/10 text-muted hover:text-white"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
              {filteredRequests?.length || 0} REQUESTS FOUND
            </p>
          </div>

          <div className="space-y-4">
            {filteredRequests?.length === 0 ? (
              <div className="h-64 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Inbox className="h-12 w-12" />
                <p className="text-[10px] font-bold uppercase tracking-widest">INBOX IS EMPTY</p>
              </div>
            ) : (
              filteredRequests?.map((req) => (
                <div 
                  key={req.id}
                  className="bg-surface border border-white/10 p-8 space-y-6 relative group hover:border-white/20 transition-all"
                >
                  <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-sans font-extrabold tracking-tight uppercase">{req.full_name}</h4>
                        <span className={cn(
                          "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border",
                          req.status === 'pending' ? "border-yellow-500/30 text-yellow-500" :
                          req.status === 'in-progress' ? "border-blue-500/30 text-blue-500" :
                          "border-green-500/30 text-green-500"
                        )}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          {req.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(req.submitted_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <select 
                        value={req.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: req.id, status: e.target.value })}
                        className="bg-black border border-white/10 p-2 text-[10px] font-bold uppercase tracking-widest focus:border-accent outline-none"
                      >
                        <option value="pending">PENDING</option>
                        <option value="in-progress">IN PROGRESS</option>
                        <option value="completed">COMPLETED</option>
                      </select>
                      <button 
                        onClick={() => deleteMutation.mutate(req.id)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-6 space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">REQUEST TYPE: {req.request_type}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed uppercase tracking-wider">
                      {req.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'embed' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-muted uppercase tracking-widest">DSAR FORM INTEGRATION</h4>
            <p className="text-xs text-muted leading-relaxed uppercase tracking-wider">
              PASTE THIS CODE ON YOUR PRIVACY POLICY PAGE TO ALLOW VISITORS TO SUBMIT DATA REQUESTS.
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

          <div className="p-8 border border-accent/20 bg-accent/5 space-y-4">
            <h5 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">AUTOMATED NOTIFICATIONS</h5>
            <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest">
              WE WILL AUTOMATICALLY NOTIFY YOU VIA EMAIL AT <span className="text-white">PAPERLOO.OFFICIAL@GMAIL.COM</span> WHENEVER A NEW REQUEST IS SUBMITTED.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
