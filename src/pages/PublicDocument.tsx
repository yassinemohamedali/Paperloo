import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { ShieldCheck } from 'lucide-react';

type Document = Database['public']['Tables']['documents']['Row'];

export default function PublicDocument() {
  const { siteId, type } = useParams();

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
  }, [siteId, type]);

  const { data: docData, isLoading, error } = useQuery<Document>({
    queryKey: ['public-doc', siteId, type],
    queryFn: async () => {
      const { data: rawData, error } = await supabase
        .from('documents')
        .select('*, sites(name, url, white_label_name, white_label_logo, agency_id)')
        .eq('site_id', siteId as string)
        .eq('type', type as any)
        .eq('is_active', true)
        .single();
      const data = rawData as any;
      if (error) throw error;

      // Fetch agency profile for white label status
      const { data: profile } = await supabase
        .from('profiles')
        .select('white_label_enabled, agency_name, logo_url')
        .eq('id', data.sites.agency_id)
        .single();

      return { ...data, agency: profile } as any;
    },
    enabled: !!siteId && !!type,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-sans font-extrabold text-black mb-4 tracking-[0.04em]">404</h1>
        <p className="text-gray-500 max-w-md">The requested legal document could not be found or is no longer active.</p>
      </div>
    );
  }

  const site = (docData as any).sites;
  const agency = (docData as any).agency;
  const siteName = site?.name || 'Unknown Site';
  
  const isWhiteLabel = agency?.white_label_enabled;
  const brandName = isWhiteLabel ? (site?.white_label_name || agency?.agency_name || 'Legal Compliance') : 'Paperloo';
  const brandLogo = isWhiteLabel ? (site?.white_label_logo || agency?.logo_url) : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-accent/20 font-mono">
      {/* Header */}
      <header className="border-b border-gray-100 py-6 reveal-up">
        <div className="max-w-3xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-8 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <>
                {!isWhiteLabel && <ShieldCheck className="h-5 w-5 text-accent" />}
                <span className="font-sans font-extrabold text-lg tracking-[0.04em] text-black uppercase">{brandName}</span>
              </>
            )}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            VERIFIED COMPLIANCE
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-8 py-20">
        <div className="mb-16 space-y-4 reveal-up">
          <h1 className="text-5xl font-sans font-extrabold tracking-[0.04em] text-black uppercase leading-none">
            {docData.type.replace(/_/g, ' ')}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-light tracking-widest uppercase">
            <span>EFFECTIVE DATE: {new Date(docData.created_at).toLocaleDateString()}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>VERSION {docData.version}</span>
          </div>
        </div>

        <article className="prose prose-slate prose-lg max-w-none prose-headings:font-sans prose-headings:font-extrabold prose-headings:tracking-[0.04em] prose-headings:text-black prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 uppercase text-sm tracking-wider reveal-up" style={{ transitionDelay: '200ms' }}>
          <div dangerouslySetInnerHTML={{ __html: docData.content }} />
        </article>

        <footer className="mt-32 pt-12 border-t border-gray-100 text-center space-y-4 pb-20 reveal-up" style={{ transitionDelay: '400ms' }}>
          <p className="text-xs text-gray-400 font-light tracking-widest uppercase">
            THIS DOCUMENT WAS GENERATED FOR <strong>{siteName}</strong> {isWhiteLabel ? `BY ${brandName}` : 'BY PAPERLOO'}.
          </p>
          {!isWhiteLabel && (
            <a 
              href="https://paperloo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-accent transition-colors"
            >
              POWERED BY PAPERLOO COMPLIANCE
            </a>
          )}
        </footer>
      </main>
    </div>
  );
}
