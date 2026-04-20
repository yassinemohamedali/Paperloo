import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { Globe, FileText, Settings, ArrowLeft, ExternalLink, RefreshCw, AlertCircle, MessageSquare, Send, ShieldCheck, Trash2, Cookie, Search, Inbox } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { calculateComplianceScore } from '@/src/lib/compliance';
import CookieBanner from '@/src/components/sites/CookieBanner';
import CookieScanner from '@/src/components/sites/CookieScanner';
import DSARInbox from '@/src/components/sites/DSARInbox';

type Site = Database['public']['Tables']['sites']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Comment = Database['public']['Tables']['site_comments']['Row'];

export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'banner' | 'scanner' | 'dsar'>('overview');

  const { data: site, isLoading: siteLoading } = useQuery<Site>({
    queryKey: ['site', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('sites').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('site_id', id).eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_comments')
        .select('*')
        .eq('site_id', id as string)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Real-time comments
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`site-comments-${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'site_comments',
        filter: `site_id=eq.${id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments', id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await (supabase.from('site_comments') as any).insert({
        site_id: id,
        content
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      toast.success('Comment added');
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async () => {
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      const { data, error } = await (supabase
        .from('certificates') as any)
        .insert({
          site_id: id,
          valid_until: validUntil.toISOString(),
          regulations_covered: site?.jurisdictions || ['GDPR']
        } as any)
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast.success('Certificate issued!');
      navigate(`/certificate/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Certificate issuance error:', error);
      toast.error(`Failed to issue certificate: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Site deleted');
      navigate('/sites');
    },
  });

  if (siteLoading || docsLoading || !site) return <div className="animate-pulse space-y-8">
    <div className="h-48 bg-surface rounded-[10px]" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="h-64 bg-surface rounded-[10px]" />
      <div className="h-64 bg-surface rounded-[10px]" />
    </div>
  </div>;

  return (
    <div className="space-y-12 font-mono">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <button onClick={() => navigate('/sites')} className="bracket-btn py-2 px-4 text-[10px] flex items-center gap-2">
          <span className="bracket-btn-inner"></span>
          <ArrowLeft className="h-3 w-3" />
          BACK TO SITES
        </button>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => issueCertificateMutation.mutate()}
            disabled={issueCertificateMutation.isPending}
            className="bracket-btn py-2 px-4 text-[10px] flex items-center gap-2 border-accent text-accent"
          >
            <span className="bracket-btn-inner"></span>
            <ShieldCheck className="h-3 w-3" />
            ISSUE CERTIFICATE
          </button>
          <Link to={`/sites/${id}/questionnaire`} className="bracket-btn py-2 px-4 text-[10px] flex items-center gap-2">
            <span className="bracket-btn-inner"></span>
            <RefreshCw className="h-3 w-3" />
            UPDATE QUESTIONNAIRE
          </Link>
          <button 
            onClick={() => { if(window.confirm('DELETE THIS SITE?')) deleteMutation.mutate() }}
            className="bracket-btn py-2 px-4 text-[10px] text-red-500 border-red-500/20"
          >
            <span className="bracket-btn-inner"></span>
            DELETE SITE
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        {[
          { id: 'overview', icon: Globe, label: 'OVERVIEW' },
          { id: 'banner', icon: Cookie, label: 'COOKIE BANNER' },
          { id: 'scanner', icon: Search, label: 'COOKIE SCANNER' },
          { id: 'dsar', icon: Inbox, label: 'DSAR INBOX' }
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

      {activeTab === 'overview' && (
        <>
          <div className="bg-surface border border-white/10 p-12 flex flex-col md:flex-row justify-between gap-12 relative overflow-hidden">
            <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
            
            <div className="space-y-8 relative z-10">
              <div className="h-16 w-16 rounded-[10px] bg-accent/10 flex items-center justify-center">
                <Globe className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-sans font-extrabold tracking-[0.04em] uppercase">{site?.name}</h1>
                <a href={site?.url} target="_blank" className="text-muted hover:text-accent flex items-center gap-2 text-xs tracking-widest uppercase">
                  {site?.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-end items-start md:items-end gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">COMPLIANCE GRADE</p>
                  <p className="text-4xl font-sans font-extrabold text-accent tracking-[0.04em]">{site?.compliance_grade || 'F'}</p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-accent flex items-center justify-center font-sans font-extrabold text-xl tracking-[0.04em] shadow-[4px_4px_0px_0px_rgba(200,241,53,0.2)]">
                  {site?.compliance_grade === 'A' ? '95' : '85'}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {site?.jurisdictions?.map(j => (
                  <span key={j} className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1 uppercase tracking-widest">
                    {j}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Documents Card */}
            <div className="bg-surface border border-white/10 p-10 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase flex items-center gap-4">
                  <FileText className="h-6 w-6 text-accent" />
                  DOCUMENTS
                </h3>
                <Link to={`/sites/${id}/documents`} className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest">MANAGE</Link>
              </div>
              
              <div className="space-y-4">
                {['privacy_policy', 'terms_of_service', 'cookie_policy'].map(type => {
                  const doc = documents?.find(d => d.type === type);
                  return (
                    <div key={type} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest">{type.replace(/_/g, ' ')}</span>
                      {doc ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">ACTIVE</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">MISSING</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Comments Card */}
            <div className="bg-surface border border-white/10 p-10 flex flex-col h-[500px]">
              <h3 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase flex items-center gap-4 mb-8">
                <MessageSquare className="h-6 w-6 text-accent" />
                TEAM COMMENTS
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <MessageSquare className="h-12 w-12" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">NO COMMENTS YET</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">AGENCY TEAM</span>
                        <span className="text-[8px] text-muted uppercase">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <div className="bg-white/5 p-4 border-l-2 border-accent">
                        <p className="text-xs uppercase tracking-wider leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newComment.trim()) return;
                addCommentMutation.mutate(newComment);
              }} className="flex gap-4">
                <input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="ADD INTERNAL NOTE..."
                  className="flex-1 bg-transparent border-b border-white/20 py-3 text-xs focus:border-accent outline-none transition-colors uppercase"
                />
                <button type="submit" disabled={addCommentMutation.isPending} className="bracket-btn p-3">
                  <span className="bracket-btn-inner"></span>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {activeTab === 'banner' && <CookieBanner siteId={id as string} />}
      {activeTab === 'scanner' && <CookieScanner siteId={id as string} siteUrl={site.url} />}
      {activeTab === 'dsar' && <DSARInbox siteId={id as string} />}
    </div>
  );
}
