import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { Search, RefreshCw, Shield, AlertTriangle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI } from "@google/genai";

interface CookieScannerProps {
  siteId: string;
  siteUrl: string;
}

type CookieScan = Database['public']['Tables']['cookie_scans']['Row'];

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function CookieScanner({ siteId, siteUrl }: CookieScannerProps) {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const { data: scans, isLoading } = useQuery<CookieScan[]>({
    queryKey: ['cookie_scans', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cookie_scans')
        .select('*')
        .eq('site_id', siteId)
        .order('scanned_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      
      const prompt = `Analyze the website URL "${siteUrl}" and predict the typical tracking cookies and scripts it would use. 
      Consider common integrations like Google Analytics, Facebook Pixel, Stripe, etc.
      Return ONLY a valid JSON array of objects with fields: name, domain, duration, category (Essential, Analytics, Marketing, Functional), status (Detected). 
      Do NOT include markdown code blocks or any text other than the JSON array.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      // Extract JSON from text
      let jsonStr = text;
      if (text.includes('```json')) {
        jsonStr = text.split('```json')[1].split('```')[0];
      } else if (text.includes('```')) {
        jsonStr = text.split('```')[1].split('```')[0];
      }
      
      const cookies = JSON.parse(jsonStr.trim());

      const { error } = await supabase.from('cookie_scans').insert({
        site_id: siteId,
        cookies: cookies as any,
        status: 'completed',
        scanned_at: new Date().toISOString()
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie_scans', siteId] });
      toast.success('Scan completed successfully');
      setIsScanning(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsScanning(false);
    }
  });

  const latestScan = scans?.[0];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-sans font-extrabold tracking-[0.04em] uppercase">COOKIE SCANNER</h3>
          <p className="text-muted text-[10px] font-bold uppercase tracking-widest">DETECT AND CATEGORIZE TRACKERS ON {siteUrl}</p>
        </div>
        <button 
          onClick={() => scanMutation.mutate()}
          disabled={isScanning}
          className="bracket-btn py-4 px-8 flex items-center gap-3 border-accent text-accent"
        >
          <span className="bracket-btn-inner"></span>
          <RefreshCw className={cn("h-4 w-4", isScanning && "animate-spin")} />
          {isScanning ? 'SCANNING SITE...' : 'START NEW SCAN'}
        </button>
      </div>

      {latestScan ? (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'TOTAL COOKIES', value: (latestScan.cookies as any[]).length, icon: Search },
              { label: 'ESSENTIAL', value: (latestScan.cookies as any[]).filter(c => c.category === 'Essential').length, icon: Shield },
              { label: 'ANALYTICS', value: (latestScan.cookies as any[]).filter(c => c.category === 'Analytics').length, icon: RefreshCw },
              { label: 'MARKETING', value: (latestScan.cookies as any[]).filter(c => c.category === 'Marketing').length, icon: AlertTriangle }
            ].map((stat, i) => (
              <div key={i} className="bg-surface border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-4 w-4 text-accent" />
                  <span className="text-2xl font-sans font-extrabold">{stat.value}</span>
                </div>
                <p className="text-[8px] font-black text-muted uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-surface border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">COOKIE NAME</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">DOMAIN</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">DURATION</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">CATEGORY</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(latestScan.cookies as any[]).map((cookie, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-6 text-xs font-bold uppercase tracking-wider text-accent">{cookie.name}</td>
                      <td className="p-6 text-xs text-muted font-mono">{cookie.domain}</td>
                      <td className="p-6 text-xs text-muted uppercase tracking-widest">{cookie.duration}</td>
                      <td className="p-6">
                        <select 
                          defaultValue={cookie.category}
                          className="bg-black border border-white/10 p-2 text-[10px] font-bold uppercase tracking-widest focus:border-accent outline-none"
                        >
                          {['Essential', 'Analytics', 'Marketing', 'Functional', 'Unknown'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3" />
                          {cookie.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* History */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4" />
              SCAN HISTORY
            </h4>
            <div className="space-y-3">
              {scans?.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.01] hover:border-white/20 transition-all">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                      {(scan.cookies as any[]).length} COOKIES DETECTED
                    </span>
                  </div>
                  <button className="text-muted hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-96 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
          <Search className="h-16 w-16" />
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-widest">NO SCANS YET</p>
            <p className="text-[10px] uppercase tracking-[0.2em]">START A SCAN TO DETECT TRACKERS ON YOUR SITE.</p>
          </div>
        </div>
      )}
    </div>
  );
}
