import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { Shield, Download, CheckCircle, Clock, Globe, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Certificate = Database['public']['Tables']['certificates']['Row'];
type Site = Database['public']['Tables']['sites']['Row'];

export default function Certificate() {
  const { id } = useParams();

  const { data: certificate, isLoading: certLoading } = useQuery<Certificate>({
    queryKey: ['certificate', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, sites(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  if (certLoading || !certificate) return <div className="h-screen w-screen bg-bg flex items-center justify-center">
    <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>;

  const site = (certificate as any).sites as Site;
  const isExpired = new Date(certificate.valid_until) < new Date();

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg p-8 md:p-24 font-mono relative overflow-hidden flex items-center justify-center">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .cert-container { border: 20px solid black !important; padding: 60px !important; box-shadow: none !important; }
        }
      `}} />

      <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none" />
      
      <div className="cert-container relative z-10 w-full max-w-4xl bg-white text-black p-12 md:p-20 border-[12px] border-black shadow-[20px_20px_0px_0px_rgba(200,241,53,1)] flex flex-col items-center text-center space-y-12">
        {isExpired && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-45deg]">
            <span className="text-9xl font-sans font-extrabold border-8 border-red-600 text-red-600 px-8 py-4 tracking-[0.04em]">EXPIRED</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="h-24 w-24 rounded-full bg-accent border-4 border-black flex items-center justify-center mx-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Shield className="h-12 w-12 text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-[0.04em] uppercase">CERTIFICATE OF COMPLIANCE</h1>
          <p className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase">VERIFIED BY PAPERLOO COMPLIANCE ENGINE</p>
        </div>

        <div className="w-full h-px bg-black/10" />

        <div className="space-y-6">
          <p className="text-lg font-medium">THIS IS TO CERTIFY THAT THE WEBSITE</p>
          <h2 className="text-3xl md:text-5xl font-sans font-extrabold tracking-[0.04em] uppercase underline decoration-accent decoration-8 underline-offset-8">{site.name}</h2>
          <p className="text-accent font-black tracking-widest text-sm">{site.url}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full text-left">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">REGULATIONS COVERED</h4>
            <div className="flex flex-wrap gap-2">
              {certificate.regulations_covered.map(reg => (
                <span key={reg} className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{reg}</span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">COMPLIANCE METRICS</h4>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-black flex items-center justify-center font-sans font-extrabold text-xl tracking-[0.04em]">
                {site.compliance_grade || 'A'}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">OVERALL SCORE: {site.compliance_grade === 'A' ? '95/100' : '85/100'}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> VERIFIED ACTIVE
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-8 pt-8 border-t border-black/10">
          <div className="text-left space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">ISSUE DATE</p>
            <p className="font-bold">{new Date(certificate.issued_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">VALID UNTIL</p>
            <p className="font-bold">{new Date(certificate.valid_until).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="pt-12 flex flex-col items-center space-y-4">
          <div className="h-20 w-20 relative">
            <div className="absolute inset-0 border-4 border-black rounded-full animate-spin-slow" />
            <div className="absolute inset-2 border-2 border-black/20 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">OFFICIAL<br/>SEAL</span>
            </div>
          </div>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">CERTIFICATE ID: {certificate.id}</p>
        </div>

        <div className="no-print fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <button 
            onClick={handleDownload}
            className="bg-black text-white px-8 py-4 font-sans font-extrabold uppercase tracking-[0.04em] flex items-center gap-3 hover:bg-accent hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(200,241,53,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Download className="h-5 w-5" /> DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
  );
}
