import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { FileText, Copy, ExternalLink, RefreshCw, Eye, Code, X, History, Plus, Trash2, Download, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI } from "@google/genai";

// Lazy-load Gemini to prevent top-level initialization errors
let genAI: any = null;
const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in the settings.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

type Site = Database['public']['Tables']['sites']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type DocumentVersion = Database['public']['Tables']['document_versions']['Row'];
type CustomClause = Database['public']['Tables']['custom_clauses']['Row'];

const DOC_TYPES = [
  { id: 'privacy_policy', label: 'Privacy Policy' },
  { id: 'terms_of_service', label: 'Terms of Service' },
  { id: 'cookie_policy', label: 'Cookie Policy' },
  { id: 'eula', label: 'EULA' },
  { id: 'acceptable_use', label: 'Acceptable Use' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'return_policy', label: 'Return Policy' },
  { id: 'accessibility_statement', label: 'Accessibility Statement' },
];

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'French' },
  { id: 'ar', label: 'Arabic' },
  { id: 'es', label: 'Spanish' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'de', label: 'German' },
];

export default function Documents() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showClauseModal, setShowClauseModal] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const { data: site, isLoading: siteLoading } = useQuery<Site>({
    queryKey: ['site', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('sites').select('*').eq('id', id).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('site_id', id as string)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: versions = [] } = useQuery<DocumentVersion[]>({
    queryKey: ['document-versions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('site_id', id as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: customClauses = [] } = useQuery<CustomClause[]>({
    queryKey: ['custom-clauses', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_clauses')
        .select('*')
        .eq('site_id', id as string);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const regenerateMutation = useMutation({
    mutationFn: async (lang?: string) => {
      if (!site) throw new Error("Site not found");
      const language = lang || selectedLanguage;

      const { data: response } = await (supabase.from('questionnaire_responses').select('*').eq('site_id', id as string) as any).maybeSingle();

      const prompt = `Generate a set of legal documents (Privacy Policy, Terms of Service, Cookie Policy, EULA, Acceptable Use, Disclaimer, Return Policy, Accessibility Statement) for a website called "${site.name}" at URL "${site.url}".
      Answers to questionnaire: ${JSON.stringify(response?.answers || {})}
      Language: ${language}
      Format: Return ONLY a valid JSON object where keys are document types and values are HTML content. Do not include markdown code blocks.
      Types: privacy_policy, terms_of_service, cookie_policy, eula, acceptable_use, disclaimer, return_policy, accessibility_statement.
      Ensure the content is professional, legally robust, and formatted with <h1>, <h2>, <p>, and <ul> tags. Add an effective date of ${new Date().toLocaleDateString()}.`;

      const aiResponse = await getAI().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = aiResponse.text;
      if (!text) throw new Error("No response from AI");

      // Extract JSON from text
      let jsonStr = text;
      if (text.includes('```json')) {
        jsonStr = text.split('```json')[1].split('```')[0];
      } else if (text.includes('```')) {
        jsonStr = text.split('```')[1].split('```')[0];
      }
      
      const docContents = JSON.parse(jsonStr.trim());

      for (const [type, content] of Object.entries(docContents)) {
        // Find existing doc
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('*')
          .eq('site_id', id as string)
          .eq('type', type)
          .eq('language', language)
          .maybeSingle();

        if (existingDoc) {
          const doc = existingDoc as any;
          // Versioning
          await supabase.from('document_versions').insert({
            document_id: doc.id,
            site_id: id as string,
            content: doc.content,
            version: doc.version,
            changelog_note: 'AI Regenerated'
          } as any);

          await (supabase
            .from('documents') as any)
            .update({ content: content as string, version: doc.version + 1 } as any)
            .eq('id', doc.id);
        } else {
          await (supabase
            .from('documents') as any)
            .insert({
              site_id: id as string,
              type: type as any,
              content: content as string,
              version: 1,
              language,
              is_active: true
            } as any);
        }
      }

      await (supabase.from('sites') as any).update({ status: 'active', last_reviewed_at: new Date().toISOString() } as any).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['document-versions', id] });
      toast.success('Documents regenerated and versioned');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const addClauseMutation = useMutation({
    mutationFn: async (clause: Partial<CustomClause>) => {
      const { error } = await (supabase.from('custom_clauses') as any).insert({
        site_id: id as string,
        document_type: clause.document_type as string,
        title: clause.title as string,
        content: clause.content as string,
        position: clause.position as any,
        order_index: 0
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-clauses', id] });
      toast.success('Custom clause added');
      setShowClauseModal(null);
    },
  });

  const deleteClauseMutation = useMutation({
    mutationFn: async (clauseId: string) => {
      const { error } = await supabase.from('custom_clauses').delete().eq('id', clauseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-clauses', id] });
      toast.success('Custom clause deleted');
    },
  });

  const copyEmbedCode = (type: string) => {
    const code = `<div id="paperloo-badge" data-site="${id}"></div>\n<script src="${window.location.origin}/badge.js"></script>`;
    navigator.clipboard.writeText(code);
    toast.success('Embed code copied to clipboard');
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (siteLoading || docsLoading || !site) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface rounded-[10px]" />)}
    </div>
  </div>;

  return (
    <div className="space-y-12 font-mono">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, aside, .no-print, button, .bracket-btn { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-only { display: block !important; }
          .document-content { page-break-after: always; padding: 0 !important; border: none !important; }
          .prose { max-width: none !important; }
        }
        .print-only { display: none; }
      `}} />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
            <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">COMPLIANCE DOCUMENTS</h2>
            <p className="text-muted text-sm tracking-[0.15em] uppercase">MANAGE AND DEPLOY LEGAL DOCUMENTS FOR {site?.name}.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-surface border border-white/10 p-3 text-xs focus:border-accent outline-none transition-colors uppercase"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
          <button 
            onClick={() => regenerateMutation.mutate(undefined)}
            disabled={regenerateMutation.isPending}
            className="bracket-btn flex items-center gap-2 py-3 px-6"
          >
            <span className="bracket-btn-inner"></span>
            <RefreshCw className={cn("h-4 w-4", regenerateMutation.isPending && "animate-spin")} />
            REGENERATE ALL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {DOC_TYPES.map((type) => {
          const doc = documents?.find(d => d.type === type.id);
          const docVersions = versions.filter(v => v.document_id === doc?.id);
          const docClauses = customClauses.filter(c => c.document_type === type.id);

          return (
            <div key={type.id} className="bg-surface border border-white/10 p-8 flex flex-col justify-between min-h-[350px] relative overflow-hidden group">
              <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="h-12 w-12 rounded-[10px] bg-accent/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-xl font-sans font-extrabold tracking-[0.04em] uppercase">{type.label}</h4>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                    {doc ? `VERSION ${doc.version} • ACTIVE` : 'NOT GENERATED'}
                  </p>
                </div>

                {doc && (
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                      <span>CUSTOM CLAUSES</span>
                      <span>{docClauses.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                      <span>HISTORY</span>
                      <span>{docVersions.length} VERSIONS</span>
                    </div>
                  </div>
                )}
              </div>

              {doc ? (
                <div className="space-y-3 mt-8 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSelectedDoc(doc.id)}
                      className="bracket-btn py-2 text-[10px] flex items-center justify-center gap-2"
                    >
                      <span className="bracket-btn-inner"></span>
                      <Eye className="h-3 w-3" /> PREVIEW
                    </button>
                    <button 
                      onClick={() => setShowHistory(doc.id)}
                      className="bracket-btn py-2 text-[10px] flex items-center justify-center gap-2"
                    >
                      <span className="bracket-btn-inner"></span>
                      <History className="h-3 w-3" /> HISTORY
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowEmbed(type.id)}
                      className="bracket-btn py-2 text-[10px] flex items-center justify-center gap-2"
                    >
                      <span className="bracket-btn-inner"></span>
                      <Code className="h-3 w-3" /> EMBED
                    </button>
                    <button 
                      onClick={() => setShowClauseModal(type.id)}
                      className="bracket-btn py-2 text-[10px] flex items-center justify-center gap-2"
                    >
                      <span className="bracket-btn-inner"></span>
                      <Plus className="h-3 w-3" /> CLAUSE
                    </button>
                  </div>
                  <button 
                    onClick={handleDownloadPDF}
                    className="bracket-btn w-full py-2 text-[10px] flex items-center justify-center gap-2 border-accent/30 text-accent"
                  >
                    <span className="bracket-btn-inner"></span>
                    <Download className="h-3 w-3" /> DOWNLOAD PDF
                  </button>
                </div>
              ) : (
                <Link to={`/sites/${id}/questionnaire`} className="bracket-btn w-full text-center py-3 text-xs mt-8 relative z-10">
                  <span className="bracket-btn-inner"></span>
                  GENERATE NOW
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedDoc(null)} />
          <div className="relative bg-white text-black w-full max-w-4xl h-full overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="h-16 flex-shrink-0 border-b border-black/10 flex items-center justify-between px-8 bg-gray-50">
              <span className="font-sans font-extrabold uppercase tracking-[0.04em] text-sm text-black">DOCUMENT PREVIEW</span>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-16 prose prose-slate max-w-none uppercase text-sm tracking-wider leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: documents?.find(d => d.id === selectedDoc)?.content || '' }} />
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowHistory(null)} />
          <div className="relative bg-surface border border-white/10 w-full max-w-2xl h-full max-h-[600px] overflow-hidden flex flex-col shadow-2xl">
            <div className="h-16 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-8">
              <span className="font-sans font-extrabold uppercase tracking-[0.04em] text-sm">VERSION HISTORY</span>
              <button onClick={() => setShowHistory(null)} className="text-muted hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {versions.filter(v => v.document_id === showHistory).map((v, idx) => (
                <div key={v.id} className="flex gap-6 relative">
                  {idx !== versions.length - 1 && <div className="absolute left-4 top-8 bottom-0 w-px bg-white/10" />}
                  <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 relative z-10">
                    <span className="text-[10px] font-black">{v.version}</span>
                  </div>
                  <div className="flex-1 space-y-2 pb-8">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold uppercase tracking-tighter">{new Date(v.created_at).toLocaleString()}</p>
                      <button 
                        onClick={() => {
                          // Restore logic
                          toast.info('Restoring version...');
                        }}
                        className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
                      >
                        RESTORE
                      </button>
                    </div>
                    <p className="text-xs text-muted font-light uppercase tracking-widest">
                      {v.changelog_note || `CONTENT LENGTH: ${v.content.length} CHARS`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clause Modal */}
      {showClauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowClauseModal(null)} />
          <div className="relative bg-surface border border-white/10 w-full max-w-lg p-10 shadow-2xl space-y-8">
            <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em] uppercase">ADD CUSTOM CLAUSE</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addClauseMutation.mutate({
                document_type: showClauseModal,
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                position: formData.get('position') as 'beginning' | 'end',
              });
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">CLAUSE TITLE</label>
                <input name="title" required className="w-full bg-transparent border-b border-white/20 py-2 text-sm focus:border-accent outline-none transition-colors uppercase" placeholder="E.G. REFUND POLICY ADDENDUM" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">CONTENT</label>
                <textarea name="content" required rows={4} className="w-full bg-transparent border border-white/20 p-3 text-sm focus:border-accent outline-none transition-colors uppercase" placeholder="ENTER CLAUSE CONTENT..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted">POSITION</label>
                <select name="position" className="w-full bg-black border border-white/20 p-3 text-sm focus:border-accent outline-none transition-colors uppercase">
                  <option value="beginning">BEGINNING</option>
                  <option value="end">END</option>
                </select>
              </div>
              <button type="submit" disabled={addClauseMutation.isPending} className="bracket-btn w-full py-3">
                <span className="bracket-btn-inner"></span>
                {addClauseMutation.isPending ? 'ADDING...' : 'ADD CLAUSE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Embed Modal */}
      {showEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEmbed(null)} />
          <div className="relative bg-surface border border-white/10 w-full max-w-lg p-10 shadow-2xl space-y-8">
            <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em] uppercase">EMBED BADGE</h3>
            <p className="text-muted text-xs tracking-[0.15em] uppercase">COPY THIS SNIPPET TO SHOW THE COMPLIANCE BADGE ON THE CLIENT'S SITE.</p>
            
            <div className="bg-black p-6 border border-white/10 font-mono text-[10px] text-accent break-all relative group">
              <code>{`<div id="paperloo-badge" data-site="${id}"></div>\n<script src="${window.location.origin}/badge.js"></script>`}</code>
              <button 
                onClick={() => copyEmbedCode(showEmbed)}
                className="absolute right-4 top-4 p-2 bg-surface border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="h-3 w-3 text-white" />
              </button>
            </div>

            <button onClick={() => setShowEmbed(null)} className="bracket-btn w-full py-3">
              <span className="bracket-btn-inner"></span>
              DONE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
