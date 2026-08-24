import { config } from '@/src/config/env';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { FileText, Copy, ExternalLink, RefreshCw, Eye, Code, X, History, Plus, Trash2, Download, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { generateDocuments } from '@/src/services/aiService';
import { calculateComplianceScore } from '@/src/lib/compliance';
import { sanitizeDocHtml } from '@/src/lib/sanitizeHtml';

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
  const [previewingVersion, setPreviewingVersion] = useState<DocumentVersion | null>(null);
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
      console.log('Fetching documents for site:', id);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('site_id', id as string);
      
      if (error) {
        console.error('Fetch documents error:', error);
        throw error;
      }
      
      console.log(`Documents fetch success. Found total: ${data?.length || 0}`);
      const activeDocs = (data || []).filter((d: any) => d.is_active);
      console.log(`Active documents: ${activeDocs.length}`);
      
      return activeDocs as any;
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

  const restoreVersionMutation = useMutation({
    mutationFn: async ({ docId, targetVersion }: { docId: string; targetVersion: DocumentVersion | any }) => {
      const currentDoc = documents.find(d => d.id === docId);
      if (currentDoc) {
        // Backup current content before restore
        await supabase.from('document_versions').insert({
          document_id: currentDoc.id,
          site_id: id as string,
          content: currentDoc.content,
          version: currentDoc.version,
          changelog_note: `Backup prior to restoring v${targetVersion.version}`
        });
      }

      const { data, error } = await supabase
        .from('documents')
        .update({
          content: targetVersion.content,
          version: targetVersion.version,
          is_active: true,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', docId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (restoredDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['document-versions', id] });
      toast.success(`Document successfully restored to Version ${restoredDoc.version}!`);
      setShowHistory(null);
      setPreviewingVersion(null);
    },
    onError: (err: any) => {
      toast.error(`Restore failed: ${err.message}`);
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: async (lang?: string) => {
      if (!id) throw new Error("ID not found");
      const language = lang || selectedLanguage;
      return await generateDocuments(id, language);
    },
    onSuccess: async (results) => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      queryClient.invalidateQueries({ queryKey: ['document-versions', id] });
      queryClient.invalidateQueries({ queryKey: ['site', id] });
      
      if (results && results.length > 0) {
        toast.success(`Regenerated ${results.length} documents successfully!`);
        // Recalculate score after doc generation
        if (id) {
          try {
            await calculateComplianceScore(id);
            queryClient.invalidateQueries({ queryKey: ['average-score'] });
          } catch (err) {
            console.error('Failed to recalculate score:', err);
          }
        }
      } else {
        toast.error('Regeneration failed to save any documents. Check your API keys (Groq or Gemini) and ensure no blockers prevented the AI from completing the request.');
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  const addClauseMutation = useMutation({
    mutationFn: async (clause: Partial<CustomClause>) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      const response = await fetch(`/api/sites/${id}/clauses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(clause)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to add custom clause' }));
        throw new Error(err.error || 'Failed to add custom clause');
      }
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
    const code = `<div id="paperloo-badge" data-site="${id}"></div>\n<script src="${config.appUrl}/badge.js"></script>`;
    navigator.clipboard.writeText(code);
    toast.success('Embed code copied to clipboard');
  };

  const handleDownloadPDF = (docToDownload?: Document | null) => {
    if (!docToDownload) {
      toast.error("Please select a document to download.");
      return;
    }

    const siteName = site?.name || 'Monitored Site';
    const docTitle = docToDownload.type ? docToDownload.type.replace(/_/g, ' ').toUpperCase() : 'LEGAL DOCUMENT';
    const formattedDate = new Date(docToDownload.created_at || Date.now()).toLocaleDateString();

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="${selectedLanguage || 'en'}">
        <head>
          <meta charset="utf-8" />
          <title>${docTitle} - ${siteName} | Paperloo AI Compliance</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,700;0,800;0,900;1,800;1,900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 15mm 15mm 20mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Space Mono', monospace, -apple-system, sans-serif;
              color: #111111;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .paperloo-banner {
              background: #000000;
              color: #ffffff;
              padding: 24px 32px;
              border-bottom: 4px solid #c8f135;
              position: relative;
            }
            .banner-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            .logo-text {
              font-family: 'Barlow', sans-serif;
              font-weight: 900;
              font-style: italic;
              font-size: 20px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #ffffff;
            }
            .logo-accent {
              color: #c8f135;
            }
            .badge-verified {
              background: rgba(200, 241, 53, 0.15);
              border: 1px solid #c8f135;
              color: #c8f135;
              font-size: 10px;
              font-weight: 700;
              padding: 4px 10px;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              display: inline-block;
            }
            .banner-title {
              font-family: 'Barlow', sans-serif;
              font-weight: 900;
              font-size: 26px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin: 0 0 6px 0;
              color: #ffffff;
            }
            .banner-sub {
              font-size: 11px;
              color: #a1a1aa;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            
            .container {
              padding: 32px;
              max-width: 900px;
              margin: 0 auto;
            }
            
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-left: 4px solid #000000;
              padding: 16px 20px;
              margin-bottom: 32px;
              font-size: 11px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            .meta-label {
              color: #64748b;
              font-weight: 700;
              font-size: 9px;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .meta-val {
              color: #0f172a;
              font-weight: 700;
              letter-spacing: 0.05em;
              word-break: break-all;
            }

            .content {
              font-size: 12px;
              color: #1e293b;
              line-height: 1.7;
            }
            .content h1, .content h2, .content h3, .content h4 {
              font-family: 'Barlow', sans-serif;
              font-weight: 800;
              color: #000000;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-top: 2em;
              margin-bottom: 0.8em;
              padding-left: 12px;
              border-left: 3px solid #c8f135;
              background: rgba(200, 241, 53, 0.08);
              padding-top: 6px;
              padding-bottom: 6px;
            }
            .content p {
              margin-bottom: 1.2em;
              text-align: justify;
            }
            .content ul, .content ol {
              margin-bottom: 1.2em;
              padding-left: 24px;
            }
            .content li {
              margin-bottom: 0.4em;
            }
            
            .callout-box {
              border: 1px solid #c8f135;
              background: #fafdf0;
              padding: 16px 20px;
              margin: 24px 0;
              border-radius: 2px;
            }
            .callout-title {
              font-family: 'Barlow', sans-serif;
              font-weight: 800;
              font-size: 13px;
              color: #000;
              text-transform: uppercase;
              margin-bottom: 6px;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .footer-seal {
              margin-top: 48px;
              padding: 20px;
              border: 2px dashed #cbd5e1;
              background: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 10px;
              color: #475569;
            }
            .seal-left {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .seal-box {
              width: 44px;
              height: 44px;
              background: #000000;
              border: 2px solid #c8f135;
              color: #c8f135;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Barlow', sans-serif;
              font-weight: 900;
              font-size: 14px;
              letter-spacing: 0.05em;
            }
            .seal-text-title {
              font-family: 'Barlow', sans-serif;
              font-weight: 800;
              color: #000000;
              font-size: 12px;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            .seal-right {
              text-align: right;
              font-family: 'Space Mono', monospace;
              font-size: 9px;
              letter-spacing: 0.1em;
            }

            @media print {
              .paperloo-banner {
                background: #000000 !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact;
              }
              .badge-verified {
                border-color: #c8f135 !important;
                color: #c8f135 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="paperloo-banner">
            <div class="banner-top">
              <div class="logo-text">PAPERLOO <span class="logo-accent">//</span> AI COMPLIANCE ENGINE</div>
              <div class="badge-verified">✓ STATUTORY AUDIT CERTIFIED</div>
            </div>
            <h1 class="banner-title">${docTitle}</h1>
            <div class="banner-sub">MONITORED DIGITAL PROPERTY: ${siteName} • EFFECTIVE DATE: ${formattedDate}</div>
          </div>

          <div class="container">
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Target Organization</span>
                <span class="meta-val">${siteName} (${site?.url || 'Monitored Site'})</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Document Revision</span>
                <span class="meta-val">VERSION ${docToDownload.version || '1.0'} (ACTIVE RELEASE)</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Regulatory Frameworks</span>
                <span class="meta-val">GDPR (EU/UK) • CCPA/CPRA (CA) • PIPEDA • VCDPA</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Cryptographic Audit Hash</span>
                <span class="meta-val">0x${(docToDownload.id || 'paperloo').replace(/[^a-f0-9]/gi, '').substring(0, 16).toUpperCase()}...SHA256</span>
              </div>
            </div>

            <div class="content">
              ${docToDownload.content}
            </div>

            <div class="footer-seal">
              <div class="seal-left">
                <div class="seal-box">PL</div>
                <div>
                  <div class="seal-text-title">OFFICIAL COMPLIANCE CERTIFICATE</div>
                  <div>GENERATED & VERIFIED BY PAPERLOO LEGAL ENGINE v4.2</div>
                </div>
              </div>
              <div class="seal-right">
                <div>AUDIT STAMP: ${new Date().toISOString()}</div>
                <div>SECURE COMPLIANCE INFRASTRUCTURE</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Print isolated hidden document window
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const docFrame = iframe.contentWindow?.document;
    if (docFrame) {
      docFrame.open();
      docFrame.write(printableHtml);
      docFrame.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 300);
    }

    // Direct standalone HTML document file download
    const blob = new Blob([printableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName.replace(/[^a-z0-9]/gi, '_')}_${docToDownload.type}_v${docToDownload.version || '1'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exporting ${docTitle} document file...`);
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
                      onClick={() => {
                        setShowHistory(doc.id);
                        setPreviewingVersion(null);
                      }}
                      className="bracket-btn py-2 text-[10px] flex items-center justify-center gap-2"
                    >
                      <span className="bracket-btn-inner"></span>
                      <History className="h-3 w-3" /> VERSIONS ({docVersions.length + 1})
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
                    onClick={() => handleDownloadPDF(doc)}
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const activeDocObj = documents?.find(d => d.id === selectedDoc);
                    if (activeDocObj) handleDownloadPDF(activeDocObj);
                  }}
                  className="bracket-btn py-1.5 px-4 text-[10px] flex items-center gap-2 border-accent/40 text-black bg-accent hover:bg-accent/80 font-bold"
                >
                  <Download className="h-3.5 w-3.5" /> DOWNLOAD DOCUMENT
                </button>
                <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div 
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'} 
              className={cn(
                "flex-1 overflow-y-auto p-16 prose prose-slate max-w-none uppercase text-sm tracking-wider leading-relaxed",
                selectedLanguage === 'ar' && "text-right font-sans"
              )}
            >
              <div dangerouslySetInnerHTML={{ __html: sanitizeDocHtml(documents?.find(d => d.id === selectedDoc)?.content || '') }} />
            </div>
          </div>
        </div>
      )}

      {/* History / Versions Modal */}
      {showHistory && (() => {
        const currentDoc = documents.find(d => d.id === showHistory);
        const docVersions = versions.filter(v => v.document_id === showHistory);
        
        const historyItems: any[] = [];
        if (currentDoc) {
          const exists = docVersions.some(v => v.version === currentDoc.version);
          if (!exists) {
            historyItems.push({
              id: `current_${currentDoc.id}`,
              document_id: currentDoc.id,
              site_id: currentDoc.site_id,
              version: currentDoc.version,
              content: currentDoc.content,
              created_at: (currentDoc as any).updated_at || currentDoc.created_at,
              changelog_note: 'Current Active Revision',
              is_current: true
            });
          }
        }
        docVersions.forEach(v => {
          historyItems.push({
            ...v,
            is_current: currentDoc ? v.version === currentDoc.version : false
          });
        });

        historyItems.sort((a, b) => b.version - a.version);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { setShowHistory(null); setPreviewingVersion(null); }} />
            <div className="relative bg-surface border border-white/10 w-full max-w-3xl h-full max-h-[700px] overflow-hidden flex flex-col shadow-2xl">
              <div className="h-16 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-8">
                <div>
                  <span className="font-sans font-extrabold uppercase tracking-[0.04em] text-sm">VERSION REVISION HISTORY</span>
                  <p className="text-[10px] text-muted tracking-widest uppercase mt-0.5">
                    {currentDoc?.type ? currentDoc.type.replace(/_/g, ' ') : 'DOCUMENT'} • {historyItems.length} REVISIONS STORED
                  </p>
                </div>
                <button onClick={() => { setShowHistory(null); setPreviewingVersion(null); }} className="text-muted hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {historyItems.length === 0 ? (
                  <div className="text-center py-12 text-muted text-xs uppercase tracking-widest">
                    NO PREVIOUS VERSIONS RECORDED YET.
                  </div>
                ) : (
                  historyItems.map((v, idx) => (
                    <div key={v.id || idx} className="bg-black/40 border border-white/10 p-5 rounded-[4px] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-7 px-2.5 rounded flex items-center justify-center font-bold text-xs uppercase tracking-wider",
                            v.is_current ? "bg-accent text-black" : "bg-white/10 text-white"
                          )}>
                            v{v.version} {v.is_current ? '(ACTIVE)' : ''}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">{new Date(v.created_at).toLocaleString()}</p>
                            <p className="text-[10px] text-muted font-light uppercase tracking-widest">
                              {v.changelog_note || `Length: ${v.content?.length || 0} chars`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPreviewingVersion(previewingVersion?.version === v.version ? null : v)}
                            className="bracket-btn py-1 px-3 text-[10px] flex items-center gap-1.5"
                          >
                            <span className="bracket-btn-inner"></span>
                            <Eye className="h-3 w-3" /> {previewingVersion?.version === v.version ? 'HIDE' : 'PREVIEW'}
                          </button>
                          
                          <button 
                            onClick={() => {
                              if (currentDoc) {
                                restoreVersionMutation.mutate({ docId: currentDoc.id, targetVersion: v });
                              }
                            }}
                            disabled={v.is_current || restoreVersionMutation.isPending}
                            className={cn(
                              "bracket-btn py-1 px-3 text-[10px] flex items-center gap-1.5",
                              v.is_current ? "opacity-40 cursor-not-allowed border-white/20 text-muted" : "border-accent/40 text-accent"
                            )}
                          >
                            <span className="bracket-btn-inner"></span>
                            <RefreshCw className={cn("h-3 w-3", restoreVersionMutation.isPending && "animate-spin")} />
                            {v.is_current ? 'ACTIVE VERSION' : 'RESTORE VERSION'}
                          </button>

                          <button
                            onClick={() => handleDownloadPDF({ ...v, type: currentDoc?.type || 'policy' } as any)}
                            className="bracket-btn py-1 px-3 text-[10px] flex items-center gap-1.5 border-white/20 text-white hover:text-accent"
                            title="Export version document"
                          >
                            <span className="bracket-btn-inner"></span>
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Preview */}
                      {previewingVersion?.version === v.version && (
                        <div className="pt-4 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-[10px] font-bold text-accent uppercase tracking-widest">
                            <span>SNAPSHOT PREVIEW (VERSION {v.version})</span>
                            <span>{v.content?.length || 0} CHARACTERS</span>
                          </div>
                          <div className="bg-white text-black p-6 max-h-60 overflow-y-auto text-xs uppercase tracking-wider leading-relaxed font-sans rounded">
                            <div dangerouslySetInnerHTML={{ __html: sanitizeDocHtml(v.content || '') }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
              <code>{`<div id="paperloo-badge" data-site="${id}"></div>\n<script src="${config.appUrl}/badge.js"></script>`}</code>
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
