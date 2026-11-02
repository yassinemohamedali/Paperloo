import React, { useState } from 'react';
import { Search, Loader2, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, Copy, FileSpreadsheet, Sparkles, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DetectedCookieItem } from '@/src/data/clauseLibrary';

interface CookieScannerModalProps {
  siteUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyCookies: (cookies: DetectedCookieItem[]) => void;
  currentCookies?: DetectedCookieItem[];
}

const TRACKER_SIGNATURES: Array<{
  pattern: RegExp;
  name: string;
  provider: string;
  category: 'Necessary' | 'Analytics' | 'Marketing' | 'Preferences';
  expiry: string;
  purpose: string;
}> = [
  { pattern: /^_ga/i, name: '_ga', provider: 'Google Analytics', category: 'Analytics', expiry: '2 years', purpose: 'Counts site visitors and views' },
  { pattern: /^_gid/i, name: '_gid', provider: 'Google Analytics', category: 'Analytics', expiry: '24 hours', purpose: 'Identifies user sessions' },
  { pattern: /^_fbp/i, name: '_fbp', provider: 'Meta (Facebook)', category: 'Marketing', expiry: '90 days', purpose: 'Measures ad conversions and retargeting' },
  { pattern: /^_gcl_/i, name: '_gcl_au', provider: 'Google Ads', category: 'Marketing', expiry: '90 days', purpose: 'Measures Google Ads conversions' },
  { pattern: /^__stripe/i, name: '__stripe_mid', provider: 'Stripe', category: 'Necessary', expiry: '1 year', purpose: 'Fraud prevention and payment security' },
  { pattern: /^_hj/i, name: '_hjSession', provider: 'Hotjar', category: 'Analytics', expiry: '30 mins', purpose: 'Helps see how visitors use the website' },
  { pattern: /^(session|phpsessid|connect\.sid|token)/i, name: 'session_id', provider: 'Your Website', category: 'Necessary', expiry: 'Session', purpose: 'Keeps users logged in safely' },
  { pattern: /^pl_consent/i, name: 'pl_consent', provider: 'Paperloo', category: 'Necessary', expiry: '12 months', purpose: 'Saves your cookie consent choices' }
];

export default function CookieScannerModal({ siteUrl, isOpen, onClose, onApplyCookies, currentCookies }: CookieScannerModalProps) {
  const [targetUrl, setTargetUrl] = useState(siteUrl || 'https://');
  const [isScanning, setIsScanning] = useState(false);
  const [scanTab, setScanTab] = useState<'url' | 'devtools'>('url');
  const [devToolsInput, setDevToolsInput] = useState('');
  const [detectedCookies, setDetectedCookies] = useState<DetectedCookieItem[]>(currentCookies || []);

  const [scanMessage, setScanMessage] = useState<string>('');
  const [hasScanned, setHasScanned] = useState(false);

  if (!isOpen) return null;

  const handleLiveScan = async () => {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      toast.error('Please enter a website URL to scan.');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let hostname = 'website.com';
    try {
      hostname = new URL(cleanUrl).hostname.replace('www.', '');
    } catch {
      hostname = cleanUrl.replace(/^https?:\/\//, '').split('/')[0] || 'website.com';
    }

    setIsScanning(true);
    setHasScanned(true);

    try {
      let scannedList: any[] = [];
      let serverMessage = '';
      let isReachable = true;

      // 1. Primary: REST scanner /api/v1/compliance/cookies/scan
      try {
        const restRes = await fetch('/api/v1/compliance/cookies/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl })
        });
        if (restRes.ok) {
          const data = await restRes.json();
          scannedList = data.cookie_inventory || data.cookies || [];
          serverMessage = data.message || '';
          if (data.reachable === false) isReachable = false;
        }
      } catch (restErr) {
        console.warn('REST scan error, trying MCP:', restErr);
      }

      // 2. Secondary fallback: MCP tools/call on /api/mcp
      if (scannedList.length === 0 && isReachable) {
        try {
          const mcpRes = await fetch('/api/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method: 'tools/call',
              params: {
                name: 'scan_cookies',
                arguments: { url: cleanUrl }
              }
            })
          });
          if (mcpRes.ok) {
            const mcpData = await mcpRes.json();
            const textContent = mcpData?.result?.content?.[0]?.text;
            if (textContent) {
              const parsed = JSON.parse(textContent);
              scannedList = parsed.cookie_inventory || parsed.cookies || [];
              serverMessage = parsed.message || serverMessage;
              if (parsed.reachable === false) isReachable = false;
            }
          }
        } catch (mcpErr) {
          console.warn('MCP scan error:', mcpErr);
        }
      }

      // Map detected cookies faithfully
      const mapped: DetectedCookieItem[] = scannedList.map((c: any) => ({
        name: c.name || '_cookie',
        provider: c.provider || c.domain || hostname,
        category: (c.category ? c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase() : 'Analytics') as any,
        expiry: c.expiry || c.lifespan || 'Session',
        purpose: c.purpose || c.description || 'Website functionality'
      }));

      setDetectedCookies(mapped);

      if (!isReachable) {
        setScanMessage(`Could not connect to ${hostname}. The website may be offline or unreachable.`);
        toast.warning(`Could not reach ${hostname}. Please verify the domain.`);
      } else if (mapped.length > 0) {
        setScanMessage(`Found ${mapped.length} real cookies and trackers running on ${hostname}.`);
        toast.success(`Found ${mapped.length} cookies on ${hostname}!`);
      } else {
        setScanMessage(`Scan complete: No cookies or third-party trackers detected on ${hostname}.`);
        toast.info(`No cookies or trackers found on ${hostname}.`);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setDetectedCookies([]);
      setScanMessage(`Scan error: Could not reach ${hostname}.`);
      toast.warning(`Could not scan ${hostname}. Check the URL.`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleParseDevTools = () => {
    if (!devToolsInput.trim()) {
      toast.error('Please paste cookie text or JSON from DevTools.');
      return;
    }

    const items: DetectedCookieItem[] = [];

    // Case A: JSON array from DevTools export
    if (devToolsInput.trim().startsWith('[') || devToolsInput.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(devToolsInput);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of list) {
          const cookieName = item.name || item.key || 'cookie';
          const match = TRACKER_SIGNATURES.find(s => s.pattern.test(cookieName));
          items.push({
            name: cookieName,
            provider: item.domain || match?.provider || 'Your Website',
            category: match?.category || 'Analytics',
            expiry: item.expires ? new Date(item.expires * 1000).toLocaleDateString() : (match?.expiry || 'Session'),
            purpose: match?.purpose || 'Website function'
          });
        }
      } catch (e) {
        console.warn('JSON parse fallback:', e);
      }
    }

    // Case B: Raw document.cookie format: "name=value; _ga=GA1.1...; _fbp=..."
    if (items.length === 0) {
      const parts = devToolsInput.split(';');
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx !== -1) {
          const name = part.slice(0, eqIdx).trim();
          if (name) {
            const match = TRACKER_SIGNATURES.find(s => s.pattern.test(name));
            items.push({
              name,
              provider: match?.provider || 'Your Website',
              category: match?.category || 'Analytics',
              expiry: match?.expiry || '12 months',
              purpose: match?.purpose || 'Tracks site visits and preferences'
            });
          }
        }
      }
    }

    if (items.length > 0) {
      setDetectedCookies(items);
      toast.success(`Found ${items.length} cookies!`);
    } else {
      toast.error('Could not find cookies. Paste a valid document.cookie string or JSON array.');
    }
  };

  const removeCookie = (index: number) => {
    setDetectedCookies(prev => prev.filter((_, i) => i !== index));
  };

  const addManualCookie = () => {
    setDetectedCookies(prev => [
      ...prev,
      {
        name: 'my_cookie',
        provider: 'Your Website',
        category: 'Analytics',
        expiry: '12 months',
        purpose: 'Website functionality'
      }
    ]);
  };

  const handleApply = () => {
    onApplyCookies(detectedCookies);
    toast.success(`Saved ${detectedCookies.length} cookies to your Cookie Policy!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8f135]/10 border border-[#c8f135]/30 flex items-center justify-center text-[#c8f135]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Cookie Scanner</h3>
              <p className="text-xs text-zinc-400">Scan your live site to find out what cookies are actually running</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setScanTab('url')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              scanTab === 'url' ? 'bg-[#c8f135] text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Scan Website URL
          </button>
          <button
            onClick={() => setScanTab('devtools')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              scanTab === 'devtools' ? 'bg-[#c8f135] text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Paste DevTools Cookies
          </button>
        </div>

        {/* URL Crawl Tab */}
        {scanTab === 'url' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">Website URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c8f135]"
              />
              <button
                onClick={handleLiveScan}
                disabled={isScanning}
                className="px-5 py-2.5 bg-[#c8f135] hover:bg-[#b8e125] text-black font-semibold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan Site
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Finds Google Analytics, Meta Pixel, Google Ads, Stripe, and login cookies.
            </p>
          </div>
        )}

        {/* DevTools Import Tab */}
        {scanTab === 'devtools' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Paste cookies from DevTools (Application &gt; Cookies or document.cookie)
            </label>
            <textarea
              value={devToolsInput}
              onChange={(e) => setDevToolsInput(e.target.value)}
              placeholder="e.g. _ga=GA1.1.182746.1700; _fbp=fb.1.17000; session_id=xyz987"
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#c8f135]"
            />
            <button
              onClick={handleParseDevTools}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#c8f135]" />
              Parse Cookies
            </button>
          </div>
        )}

        {/* Detected Cookies Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c8f135]" />
              Cookies Found ({detectedCookies.length})
            </h4>
            <button
              onClick={addManualCookie}
              className="text-xs text-[#c8f135] hover:underline flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Cookie Manually
            </button>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-semibold">Cookie Name</th>
                  <th className="p-3 font-semibold">Provider</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Lifespan</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {detectedCookies.map((cookie, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-[#c8f135]">{cookie.name}</td>
                    <td className="p-3 text-zinc-300">{cookie.provider}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        cookie.category === 'Necessary' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        cookie.category === 'Marketing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {cookie.category}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">{cookie.expiry}</td>
                    <td className="p-3">
                      <button
                        onClick={() => removeCookie(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {detectedCookies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-400">
                      {hasScanned ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-zinc-200">{scanMessage}</p>
                          <p className="text-xs text-zinc-500">
                            No trackers were detected in the HTML or HTTP response headers for this website.
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">
                          No cookies scanned yet. Enter your website URL above and click "Scan Site".
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#c8f135]" />
            These cookies will be added to your Cookie Policy and Cookie Banner.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={detectedCookies.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#c8f135] hover:bg-[#b8e125] text-black transition flex items-center gap-2 shadow-lg shadow-[#c8f135]/10 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Cookies to Policy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
