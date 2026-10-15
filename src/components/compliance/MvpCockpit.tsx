import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Check, 
  GitPullRequest, 
  Terminal, 
  ExternalLink, 
  Sliders, 
  Sparkles, 
  Layers, 
  Download,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import PaperlooLogo from '@/src/components/ui/PaperlooLogo';

export default function MvpCockpit() {
  // State for active tab / interactive preview
  const [activeTab, setActiveTab] = useState<'crawler' | 'generator' | 'cmp'>('crawler');

  // Pillar 1: Web Crawler State
  const [targetUrl, setTargetUrl] = useState('https://app.metasignal.io');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);

  // Pillar 2: GDPR Policy Generator State
  const [companyName, setCompanyName] = useState('MetaSignal Inc.');
  const [contactEmail, setContactEmail] = useState('legal@metasignal.io');
  const [dataCollection, setDataCollection] = useState({
    analytics: true,
    authentication: true,
    paymentProcessing: true,
    aiModelTelemetry: false,
  });
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [prCreated, setPrCreated] = useState(false);

  // Pillar 3: CMP Cookie Banner State
  const [cmpPreferences, setCmpPreferences] = useState({
    strictlyNecessary: true,
    analytics: true,
    marketing: false,
  });
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Scan handler
  const handleRunScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl) return;
    setIsScanning(true);
    setHasScanned(false);

    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
      toast.success('Site scan complete. Regional risk indicators updated.');
    }, 1200);
  };

  const handleCopyPolicy = () => {
    const policyText = `# PRIVACY POLICY (GDPR & CCPA COMPLIANT TEMPLATE)
Last Updated: ${new Date().toLocaleDateString()}
Entity: ${companyName}
Contact: ${contactEmail}

## MANDATORY LEGAL NOTICE
Paperloo provides compliance automation software. It does not provide legal advice and is not a law firm. Generated documents are templates and must be reviewed by qualified counsel.

1. DATA COLLECTION & PURPOSES
Under Regulation (EU) 2016/679 (GDPR), we process personal data based on legitimate interest and performance of a contract.
- Identifiers: IP addresses, account credentials, and email coordinates.
- Telemetry: Product analytics and session health indicators.

2. THIRD-PARTY DATA PROCESSORS
We utilize compliant subprocessors bound by standard contractual clauses (SCCs) for cloud hosting, authentication, and payment handling.

3. DATA SUBJECT RIGHTS (GDPR Articles 15-22)
Visitors possess rights to access, rectify, port, or erase their stored telemetry. Requests directed to ${contactEmail} are executed within statutory timelines.`;

    navigator.clipboard.writeText(policyText);
    setCopiedDoc(true);
    toast.success('Privacy Policy template copied to clipboard');
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handleCreateGitHubPR = () => {
    setPrCreated(true);
    toast.success('GitHub Pull Request #14 drafted: "chore: update GDPR compliance & CMP embed"');
    setTimeout(() => setPrCreated(false), 4000);
  };

  const handleCopySnippet = () => {
    const snippet = `<script src="https://cdn.paperloo.io/cmp.js" data-site="site_metasignal_01" async></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    toast.success('CMP 1-line script copied');
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Mandatory UPL Disclaimer Banner */}
      <div className="w-full bg-[#121215] border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-300 font-mono leading-relaxed">
            <span className="font-bold text-amber-400 uppercase tracking-wider mr-2">Mandatory Disclaimer:</span>
            Paperloo provides compliance automation software. It does not provide legal advice and is not a law firm. Generated documents are templates and must be reviewed by qualified counsel.
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700">
          UPL COMPLIANT
        </span>
      </div>

      {/* Main Cockpit Container */}
      <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl md:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#bef264]/10 blur-[100px] pointer-events-none" />

        {/* Header Bar matching video frame 00:04 */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-zinc-800/80 gap-4">
          <div className="flex items-center gap-4">
            <PaperlooLogo size="md" />
            <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
            <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
              SaaS Compliance Cockpit v2.4
            </span>
          </div>

          {/* Segmented Control for the 3 MVP Pillars */}
          <div className="flex items-center p-1 bg-[#18181c] border border-zinc-800 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('crawler')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap",
                activeTab === 'crawler' 
                  ? "bg-[#bef264] text-black shadow-md" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Search className="w-3.5 h-3.5" />
              1. Site Crawler
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap",
                activeTab === 'generator' 
                  ? "bg-[#bef264] text-black shadow-md" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              2. GDPR Policy Generator
            </button>
            <button
              onClick={() => setActiveTab('cmp')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap",
                activeTab === 'cmp' 
                  ? "bg-[#bef264] text-black shadow-md" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              3. CMP Cookie Banner
            </button>
          </div>
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* TAB 1: Real-time Web Crawler & Regional Risk Indicators */}
          {activeTab === 'crawler' && (
            <>
              {/* Left Column: Crawler Input & Tracker Telemetry */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-sans font-bold text-white uppercase tracking-tight">
                        Real-Time Tracker & Cookie Crawler
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Inspect active DOM scripts, marketing pixels, and consent execution vectors.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#bef264] bg-[#bef264]/10 border border-[#bef264]/30 px-2.5 py-1 rounded-full">
                      EDGE RUNNER ACTIVE
                    </span>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleRunScan} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://your-saas-app.com"
                        className="w-full bg-[#18181c] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#bef264] transition-colors"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isScanning}
                      className="bg-[#bef264] hover:bg-[#a3e635] text-black font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Crawling DOM...
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          Initiate Audit
                        </>
                      )}
                    </button>
                  </form>

                  {/* Detected Trackers Table */}
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0c0c0e]">
                    <div className="p-3 bg-[#18181c] border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 font-semibold">
                      <span>DETECTED THIRD-PARTY SCRIPTS</span>
                      <span className="text-zinc-500">PRIOR-CONSENT STATUS</span>
                    </div>

                    <div className="divide-y divide-zinc-800/80 font-mono text-xs">
                      <div className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-white font-medium">Google Analytics 4 (gtag.js)</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          SHIELDED (Consent Mode v2)
                        </span>
                      </div>

                      <div className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-white font-medium">Stripe Elements (payments)</span>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                          ESSENTIAL (Exempt from consent)
                        </span>
                      </div>

                      <div className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-white font-medium">Meta Pixel (fbevents.js)</span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          INTERCEPTED (Awaiting CMP opt-in)
                        </span>
                      </div>

                      <div className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-white font-medium">PostHog Analytics</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          SHIELDED (Cookieless EU proxy)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Sparkline / Mini Trend Graph as seen in video frame 00:03 */}
                  <div className="p-4 bg-[#18181c]/70 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
                        <TrendingUp className="w-3.5 h-3.5 text-[#bef264]" />
                        Crawler Telemetry Throughput (Last 7 Days)
                      </span>
                      <span className="text-[#bef264] font-bold">142 Scans Executed</span>
                    </div>

                    {/* SVG Sparkline Graph */}
                    <div className="h-20 w-full pt-2">
                      <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#bef264" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#bef264" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,60 Q40,55 80,40 T160,25 T240,45 T320,15 T400,20 L400,80 L0,80 Z"
                          fill="url(#graphGradient)"
                        />
                        <path
                          d="M0,60 Q40,55 80,40 T160,25 T240,45 T320,15 T400,20"
                          fill="none"
                          stroke="#bef264"
                          strokeWidth="2.5"
                        />
                        {/* Data points */}
                        <circle cx="80" cy="40" r="3" fill="#bef264" />
                        <circle cx="160" cy="25" r="3" fill="#bef264" />
                        <circle cx="240" cy="45" r="3" fill="#bef264" />
                        <circle cx="320" cy="15" r="3" fill="#bef264" />
                        <circle cx="400" cy="20" r="4" fill="#ffffff" stroke="#bef264" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Regional Risk Indicators (Replacing dangerous 0-100 score) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-sans font-bold text-white uppercase tracking-tight">
                        Regional Risk Indicators
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Statutory risk metrics per sovereign jurisdiction (no false 0–100 scores).
                      </p>
                    </div>
                    <Globe className="w-5 h-5 text-zinc-500" />
                  </div>

                  <div className="space-y-3 font-mono">
                    {/* EU / GDPR Indicator */}
                    <div className="p-3.5 bg-[#18181c] border border-zinc-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          European Union (GDPR)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          LOW RISK
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        Articles 6 & 7 prior-consent enforced. Telemetry scripts held until user opt-in.
                      </p>
                    </div>

                    {/* California / CCPA Indicator */}
                    <div className="p-3.5 bg-[#18181c] border border-zinc-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          California (CCPA / CPRA)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          SCANNED · PASS
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        DNSMSI ("Do Not Sell") opt-out hook mapped. GPC browser signal supported.
                      </p>
                    </div>

                    {/* Australia / APPs Indicator */}
                    <div className="p-3.5 bg-[#18181c] border border-zinc-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Australia (Privacy Act 1988)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        Privacy Officer assigned. OAIC complaint channel and APP 8 transfer notices active.
                      </p>
                    </div>

                    {/* Canada / Quebec Law 25 */}
                    <div className="p-3.5 bg-[#18181c] border border-zinc-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Canada (PIPEDA & Law 25)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          DEFAULT-OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        Quebec Law 25 compliance: Tracking cookies deactivated by default upon page arrival.
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('generator')}
                      className="w-full bg-[#18181c] hover:bg-zinc-800 text-white border border-zinc-700 font-mono text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#bef264]" />
                      Generate GDPR Privacy Policy for this Stack
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: GDPR Privacy Policy Generator (Clean Paper & GitHub PR) */}
          {activeTab === 'generator' && (
            <>
              {/* Left Column: Generator Form Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-sans font-bold text-white uppercase tracking-tight">
                      SaaS Privacy Policy Configurator
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Generate attorney-vetted template disclosures tailored to your active tools.
                    </p>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block text-zinc-400 uppercase tracking-wider text-[10px] mb-1.5 font-bold">
                        Legal Business Entity
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-[#18181c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#bef264]"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase tracking-wider text-[10px] mb-1.5 font-bold">
                        Privacy Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#18181c] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#bef264]"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase tracking-wider text-[10px] mb-2 font-bold">
                        Data Collection Categories
                      </label>
                      <div className="space-y-2">
                        {[
                          { key: 'analytics', label: 'Product Analytics (PostHog, Google Analytics)' },
                          { key: 'authentication', label: 'User Authentication & Profiles (Supabase, Auth0)' },
                          { key: 'paymentProcessing', label: 'Payment Processing (Stripe)' },
                          { key: 'aiModelTelemetry', label: 'AI/LLM Interaction Logs' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 p-2.5 bg-[#18181c] rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                            <input
                              type="checkbox"
                              checked={(dataCollection as any)[item.key]}
                              onChange={(e) => setDataCollection({
                                ...dataCollection,
                                [item.key]: e.target.checked
                              })}
                              className="accent-[#bef264] w-4 h-4 rounded"
                            />
                            <span className="text-zinc-300 text-[11px]">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      onClick={handleCopyPolicy}
                      className="w-full bg-[#bef264] hover:bg-[#a3e635] text-black font-mono font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
                    >
                      {copiedDoc ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedDoc ? 'Copied to Clipboard' : 'Copy Policy Markdown'}
                    </button>

                    <button
                      onClick={handleCreateGitHubPR}
                      disabled={prCreated}
                      className="w-full bg-[#18181c] hover:bg-zinc-800 text-white border border-zinc-700 font-mono font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <GitPullRequest className="w-3.5 h-3.5 text-[#bef264]" />
                      {prCreated ? 'GitHub Pull Request Created!' : 'Create GitHub Pull Request (PR)'}
                    </button>
                    <p className="text-[10px] text-zinc-500 text-center font-mono">
                      Safe workflow: We submit a PR for your team to review and approve. No direct commits to master.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Document Preview (Clean Paper View like video frame 00:03) */}
              <div className="lg:col-span-7">
                <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#bef264]" />
                      <span className="font-mono text-xs font-bold text-white uppercase">
                        Document Preview: PRIVACY_POLICY.md
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      GDPR & CCPA TEMPLATE
                    </span>
                  </div>

                  {/* Document Paper Container */}
                  <div className="flex-1 bg-white text-zinc-900 rounded-xl p-6 sm:p-8 font-sans shadow-inner overflow-y-auto max-h-[440px] text-xs sm:text-sm leading-relaxed space-y-4">
                    <div className="border-b border-zinc-200 pb-3">
                      <h4 className="text-xl font-bold font-sans text-black tracking-tight">
                        Privacy Policy
                      </h4>
                      <p className="text-xs text-zinc-500 font-mono mt-1">
                        Operated by: {companyName} · Contact: {contactEmail}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Last Modified: {new Date().toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-mono">
                      <strong>Legal Disclaimer:</strong> Paperloo provides compliance automation software. It does not provide legal advice and is not a law firm. This document is a template and must be reviewed by qualified counsel.
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-bold text-black text-sm uppercase font-mono tracking-wider">
                        1. Introduction & Statutory Scope
                      </h5>
                      <p className="text-zinc-700">
                        {companyName} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates this software platform. This Privacy Policy outlines our data processing procedures in accordance with the European Union General Data Protection Regulation (Regulation EU 2016/679 - GDPR) and the California Consumer Privacy Act as amended by the CPRA.
                      </p>

                      <h5 className="font-bold text-black text-sm uppercase font-mono tracking-wider pt-2">
                        2. Categories of Information Processed
                      </h5>
                      <p className="text-zinc-700">
                        We process personal data strictly where permitted under lawful bases, including contractual necessity and legitimate commercial interest:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                        {dataCollection.analytics && (
                          <li><strong>Telemetry & Usage Data:</strong> Anonymized interaction logs, browser coordinates, and feature engagement metrics.</li>
                        )}
                        {dataCollection.authentication && (
                          <li><strong>Account Credentials:</strong> Electronic mail addresses, secure authentication tokens, and profile identifiers.</li>
                        )}
                        {dataCollection.paymentProcessing && (
                          <li><strong>Billing Information:</strong> Payment tokens processed directly by PCI-DSS compliant gateways (Stripe). We do not store raw card numbers.</li>
                        )}
                        {dataCollection.aiModelTelemetry && (
                          <li><strong>Inference Logs:</strong> Prompts and completions processed through dedicated, zero-retention enterprise API endpoints.</li>
                        )}
                      </ul>

                      <h5 className="font-bold text-black text-sm uppercase font-mono tracking-wider pt-2">
                        3. Data Subject Rights & Inquiries
                      </h5>
                      <p className="text-zinc-700">
                        Under GDPR Articles 15 through 22, residents of the European Economic Area possess actionable rights including access, rectification, portability, and erasure (&ldquo;Right to be Forgotten&rdquo;). Submit all statutory requests directly to our designated lead at <span className="underline font-medium">{contactEmail}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: Zero-Code CMP Cookie Banner */}
          {activeTab === 'cmp' && (
            <>
              {/* Left Column: Banner Configuration & Embed Snippet */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-sans font-bold text-white uppercase tracking-tight">
                      Zero-Code CMP Cookie Banner
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Fast, ultra-lightweight (&lt;4.2 kB) banner script. Intercepts trackers before user opt-in.
                    </p>
                  </div>

                  {/* 1-Line Embed Snippet */}
                  <div className="space-y-2">
                    <label className="block text-zinc-400 uppercase tracking-wider text-[10px] font-bold font-mono">
                      Embed Code (Add inside &lt;head&gt; of your web app)
                    </label>
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto flex items-center justify-between">
                      <code>&lt;script src=&quot;https://cdn.paperloo.io/cmp.js&quot; data-site=&quot;site_01&quot; async&gt;&lt;/script&gt;</code>
                    </div>
                    <button
                      onClick={handleCopySnippet}
                      className="w-full bg-[#bef264] hover:bg-[#a3e635] text-black font-mono font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {copiedSnippet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedSnippet ? 'Copied Embed Snippet' : 'Copy 1-Line Script'}
                    </button>
                  </div>

                  {/* Banner Toggles Configuration */}
                  <div className="space-y-3 font-mono text-xs pt-2">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Cookie Category Enforcement:
                    </span>

                    <div className="flex items-center justify-between p-3 bg-[#18181c] rounded-xl border border-zinc-800">
                      <div>
                        <span className="text-white font-bold block">Strictly Necessary</span>
                        <span className="text-[10px] text-zinc-500">Security, session auth, routing (Always Active)</span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        LOCKED
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#18181c] rounded-xl border border-zinc-800">
                      <div>
                        <span className="text-white font-bold block">Performance & Analytics</span>
                        <span className="text-[10px] text-zinc-500">PostHog, Google Analytics (Opt-in required in EU)</span>
                      </div>
                      <button
                        onClick={() => setCmpPreferences({ ...cmpPreferences, analytics: !cmpPreferences.analytics })}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative p-0.5",
                          cmpPreferences.analytics ? "bg-[#bef264]" : "bg-zinc-700"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full bg-black transition-transform",
                          cmpPreferences.analytics ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#18181c] rounded-xl border border-zinc-800">
                      <div>
                        <span className="text-white font-bold block">Marketing & Retargeting</span>
                        <span className="text-[10px] text-zinc-500">Meta Pixel, TikTok Pixel (Blocked until consent)</span>
                      </div>
                      <button
                        onClick={() => setCmpPreferences({ ...cmpPreferences, marketing: !cmpPreferences.marketing })}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative p-0.5",
                          cmpPreferences.marketing ? "bg-[#bef264]" : "bg-zinc-700"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full bg-black transition-transform",
                          cmpPreferences.marketing ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Live Banner Simulation */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      Live Visitor Consent Banner Simulation
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      PREVIEW MODE
                    </span>
                  </div>

                  {/* Simulated App Page with Floating Banner */}
                  <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 relative min-h-[300px] flex flex-col justify-end">
                    <div className="absolute top-4 left-4 right-4 text-center space-y-2 opacity-30 select-none">
                      <div className="h-4 w-32 bg-zinc-700 rounded mx-auto" />
                      <div className="h-3 w-48 bg-zinc-800 rounded mx-auto" />
                      <div className="h-24 bg-zinc-900 rounded-lg mx-auto mt-4" />
                    </div>

                    {/* Actual Floating CMP Banner Card */}
                    <div className="relative z-10 bg-[#18181c] border border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
                      <div className="flex items-center gap-2">
                        <PaperlooLogo size="sm" showText={false} />
                        <span className="font-sans font-bold text-xs text-white">Privacy Preferences</span>
                        <span className="ml-auto text-[9px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                          GDPR / CCPA
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-300 font-mono leading-relaxed">
                        We use cookies and telemetry to analyze product usage and enhance user experience. You can customize your preferences or accept all cookies.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                        <button 
                          onClick={() => {
                            setCmpPreferences({ strictlyNecessary: true, analytics: true, marketing: true });
                            toast.success('All cookies accepted');
                          }}
                          className="bg-[#bef264] hover:bg-[#a3e635] text-black font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Accept All
                        </button>
                        <button 
                          onClick={() => {
                            setCmpPreferences({ strictlyNecessary: true, analytics: false, marketing: false });
                            toast.success('Only necessary cookies accepted');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-all"
                        >
                          Reject Non-Essential
                        </button>
                        <button 
                          onClick={() => toast.info('Opened granular category drawer')}
                          className="text-zinc-400 hover:text-white px-2 py-1.5 underline"
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
