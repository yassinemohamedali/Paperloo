import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { ShieldCheck, Download, ExternalLink, Calendar, Award, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Site = Database['public']['Tables']['sites']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type ComplianceScore = Database['public']['Tables']['compliance_scores']['Row'];

export default function ClientPortal() {
  const { accessToken } = useParams();

  const { data: portalData, isLoading, error } = useQuery({
    queryKey: ['client-portal', accessToken],
    queryFn: async () => {
      // 1. Get site from access token
      const { data: clientUserData, error: clientUserError } = await supabase
        .from('client_users')
        .select('site_id')
        .eq('access_token', accessToken as string)
        .single();
      
      const clientUser = clientUserData as any;
      if (clientUserError || !clientUser) throw clientUserError || new Error('Client user not found');

      // 2. Get site, documents, and score
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('*, agency_id')
        .eq('id', clientUser.site_id)
        .single();
      
      const site = siteData as any;
      if (siteError || !site) throw siteError || new Error('Site not found');

      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('site_id', site.id)
        .eq('is_active', true);

      const { data: score } = await supabase
        .from('compliance_scores')
        .select('*')
        .eq('site_id', site.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: versions } = await supabase
        .from('document_versions')
        .select('*')
        .eq('site_id', site.id)
        .order('created_at', { ascending: false });

      // 3. Get agency profile for white label
      const { data: agency } = await supabase
        .from('profiles')
        .select('white_label_enabled, agency_name, logo_url')
        .eq('id', site.agency_id)
        .single();

      return { site, documents, score, agency, versions: versions || [] };
    },
    enabled: !!accessToken,
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
  }, [portalData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-sans font-extrabold text-black mb-4 uppercase tracking-[0.04em]">ACCESS DENIED</h1>
        <p className="text-gray-500 max-w-md uppercase text-xs tracking-widest">THE ACCESS LINK IS INVALID OR HAS EXPIRED.</p>
      </div>
    );
  }

  const { site, documents, score, agency, versions } = portalData as any;
  const isWhiteLabel = agency?.white_label_enabled;
  const brandName = isWhiteLabel ? (site?.white_label_name || agency?.agency_name || 'Legal Compliance') : 'Paperloo';
  const brandLogo = isWhiteLabel ? (site?.white_label_logo || agency?.logo_url) : null;

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono selection:bg-accent/20">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; }
          .print-only { display: block !important; }
          .document-content { page-break-after: always; }
          .prose { max-width: none !important; }
        }
        .print-only { display: none; }
      `}} />

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-8 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <>
                {!isWhiteLabel && <ShieldCheck className="h-6 w-6 text-accent" />}
                <span className="font-sans font-extrabold text-xl tracking-[0.04em] uppercase">{brandName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPDF}
              className="bracket-btn border-slate-200 text-slate-600 hover:border-accent hover:text-accent py-2 px-4 text-xs"
            >
              <span className="bracket-btn-inner"></span>
              DOWNLOAD ALL (PDF)
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* Header Section */}
        <div className="bg-white border border-slate-200 p-10 flex flex-col md:flex-row justify-between gap-10 reveal-up">
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-sans font-extrabold tracking-[0.04em] uppercase">{site?.name}</h1>
              <a href={site?.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-2 text-sm">
                {site?.url} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">LAST REVIEWED</p>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Calendar className="h-4 w-4 text-accent" />
                  {site?.last_reviewed_at ? new Date(site.last_reviewed_at).toLocaleDateString() : 'NEVER'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">STATUS</p>
                <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                  VERIFIED COMPLIANT
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 bg-slate-50 p-6 border border-slate-200">
            <div className="relative h-24 w-24 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="48" cy="48" r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200"
                />
                <circle
                  cx="48" cy="48" r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={276}
                  strokeDashoffset={276 - (276 * (score?.score || 0)) / 100}
                  className={cn(
                    "transition-all duration-1000",
                    (score?.score || 0) >= 90 ? "text-green-500" :
                    (score?.score || 0) >= 75 ? "text-blue-500" :
                    (score?.score || 0) >= 60 ? "text-yellow-500" : "text-red-500"
                  )}
                />
              </svg>
              <span className="text-3xl font-sans font-extrabold tracking-[0.04em]">
                {score?.grade || 'F'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">COMPLIANCE SCORE</p>
              <p className="text-2xl font-sans font-extrabold tracking-[0.04em]">{score?.score || 0}/100</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase">LEGAL DOCUMENTS</h2>
            <div className="h-px flex-1 bg-slate-200 mx-8" />
          </div>

          <div className="grid gap-8">
            {documents?.map((doc, idx) => (
              <div key={doc.id} style={{ transitionDelay: `${idx * 100}ms` }} className="bg-white border border-slate-200 overflow-hidden document-content reveal-up group hover:border-accent transition-colors duration-500">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 group-hover:bg-accent/5 transition-colors">
                  <div className="space-y-1">
                    <h3 className="text-xl font-sans font-extrabold tracking-[0.04em] uppercase">{doc.type.replace(/_/g, ' ')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VERSION {doc.version} · UPDATED {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="p-2 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-accent"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-10 prose prose-slate max-w-none uppercase text-sm tracking-wider leading-relaxed">
                  {/* Print Header */}
                  <div className="print-only mb-10 border-b-2 border-black pb-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-2xl font-bold">{site?.name}</h1>
                        <p className="text-sm">{site?.url}</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold uppercase">{doc.type.replace(/_/g, ' ')}</h2>
                        <p className="text-sm">EFFECTIVE DATE: {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div dangerouslySetInnerHTML={{ __html: doc.content }} />

                  {/* Print Footer */}
                  <div className="print-only mt-20 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                    GENERATED BY {brandName.toUpperCase()} · paperloo.official@gmail.com
                  </div>
                </div>
              </div>
            ))}

            {(!documents || documents.length === 0) && (
              <div className="bg-white border border-slate-200 p-20 text-center space-y-8 reveal-up">
                <div className="relative w-24 h-24 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-200">
                    <path 
                      d="M50 10 L85 25 V50 C85 70 50 90 50 90 C50 90 15 70 15 50 V25 L50 10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="svg-draw"
                    />
                    <path 
                      d="M35 50 L45 60 L65 40" 
                      fill="none" 
                      stroke="var(--color-accent)" 
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="svg-draw"
                      style={{ animationDelay: '1s' }}
                    />
                  </svg>
                </div>
                <p className="text-slate-400 uppercase text-xs tracking-widest">NO DOCUMENTS HAVE BEEN GENERATED FOR THIS SITE YET.</p>
              </div>
            )}
          </div>

          {/* Changelog Section */}
          <div className="bg-white border border-slate-200 p-10 space-y-8 reveal-up">
            <h3 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase flex items-center gap-4">
              <History className="h-6 w-6 text-accent" />
              WHAT'S CHANGED
            </h3>
            <div className="space-y-6">
              {versions.length > 0 ? (
                versions.slice(0, 5).map(v => (
                  <div key={v.id} className="border-l-2 border-accent pl-6 py-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                      {new Date(v.created_at).toLocaleDateString()} • VERSION {v.version}
                    </p>
                    <p className="text-sm uppercase tracking-wider leading-relaxed">
                      {v.changelog_note || 'GENERAL UPDATES TO COMPLIANCE STANDARDS AND JURISDICTIONAL REQUIREMENTS.'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs uppercase tracking-widest">NO RECENT CHANGES RECORDED.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 pb-20">
          <div className="flex items-center gap-3 opacity-50 grayscale">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-6 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="font-sans font-extrabold text-lg tracking-[0.04em] uppercase">{brandName}</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © 2026 {brandName.toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
          {!isWhiteLabel && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              POWERED BY <ShieldCheck className="h-3 w-3 text-accent" /> PAPERLOO
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
