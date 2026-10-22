import React, { useState } from 'react';
import { 
  Terminal, 
  Code, 
  PlusCircle, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Sliders, 
  Check, 
  Copy, 
  ExternalLink,
  Play,
  RotateCw,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgentToolsConsole() {
  const [activeTab, setActiveTab] = useState<'add_site' | 'questionnaire' | 'cookie_banner' | 'gtm' | 'audit' | 'all_tools'>('add_site');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [siteName, setSiteName] = useState('Acme SaaS Platform');
  const [siteUrl, setSiteUrl] = useState('https://acme-saas.com');
  const [platform, setPlatform] = useState('nextjs');

  const [companyName, setCompanyName] = useState('Acme Technologies Inc.');
  const [contactEmail, setContactEmail] = useState('privacy@acme-saas.com');
  const [jurisdictions, setJurisdictions] = useState(['GDPR (EU)', 'CCPA (California)']);

  const [bannerTheme, setBannerTheme] = useState('dark');
  const [bannerPosition, setBannerPosition] = useState('bottom');
  const [accentColor, setAccentColor] = useState('#c8f135');

  const [gtmId, setGtmId] = useState('GTM-ACME2026');
  const [auditUrl, setAuditUrl] = useState('https://acme-saas.com');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const runMcpTool = async (toolName: string, args: any) => {
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        })
      });
      const data = await res.json();
      if (data.result?.content?.[0]?.text) {
        try {
          setOutput(JSON.parse(data.result.content[0].text));
        } catch {
          setOutput(data.result.content[0].text);
        }
      } else {
        setOutput(data);
      }
      toast.success(`MCP Tool '${toolName}' executed successfully!`);
    } catch (err: any) {
      setOutput({ error: err.message || 'Execution failed' });
      toast.error(`Execution error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-2/80 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>NATIVE MODEL CONTEXT PROTOCOL (MCP) INTERFACE</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans font-black text-white">
            Autonomous Agent Tools Console
          </h3>
          <p className="text-white/60 text-sm mt-1">
            Test and trigger live compliance tools supported by the Streamable HTTP server at <code className="text-accent font-mono text-xs">/api/mcp</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a 
            href="/server.json" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white/80 hover:text-accent hover:border-accent/40 transition-all font-mono"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>server.json</span>
          </a>
          <a 
            href="/openapi.json" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white/80 hover:text-accent hover:border-accent/40 transition-all font-mono"
          >
            <Code className="w-3.5 h-3.5" />
            <span>openapi.json</span>
          </a>
          <a 
            href="/llms.txt" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white/80 hover:text-accent hover:border-accent/40 transition-all font-mono"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>llms.txt</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-6 border-b border-white/10 no-scrollbar">
        {[
          { id: 'add_site', label: '1. Add Site', icon: PlusCircle },
          { id: 'questionnaire', label: '2. Questionnaire & Docs', icon: FileText },
          { id: 'cookie_banner', label: '3. Cookie Banner & GCM v2', icon: Sliders },
          { id: 'gtm', label: '4. GTM Integration', icon: Layers },
          { id: 'audit', label: '5. Compliance Audit', icon: ShieldCheck },
          { id: 'all_tools', label: 'All 14 Tools Catalog', icon: Terminal }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setOutput(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-accent text-black shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                  : 'bg-black/40 text-white/70 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          {activeTab === 'add_site' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Website Name</label>
                <input 
                  type="text" 
                  value={siteName} 
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Domain URL</label>
                <input 
                  type="text" 
                  value={siteUrl} 
                  onChange={e => setSiteUrl(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Platform</label>
                <select 
                  value={platform} 
                  onChange={e => setPlatform(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                >
                  <option value="nextjs">Next.js / React</option>
                  <option value="wordpress">WordPress</option>
                  <option value="webflow">Webflow</option>
                  <option value="shopify">Shopify</option>
                  <option value="custom">Custom Web Stack</option>
                </select>
              </div>

              <button
                onClick={() => runMcpTool('add_site', { name: siteName, url: siteUrl, platform, jurisdictions: ['GDPR', 'CCPA'] })}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
                <span>Call add_site via MCP</span>
              </button>
            </div>
          )}

          {activeTab === 'questionnaire' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Company Legal Name</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Privacy Contact Email</label>
                <input 
                  type="email" 
                  value={contactEmail} 
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2 pt-1">
                <span className="block text-xs font-mono text-white/70">Data Collection Vectors</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span>Cookies & Trackers</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span>Google Analytics 4</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span>User Accounts</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span>Stripe Payments</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => runMcpTool('get_questionnaire_schema', {})}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-white/10 border border-white/15 text-white font-mono text-xs hover:bg-white/15 transition-all text-center"
                >
                  Get Schema
                </button>
                <button
                  onClick={() => runMcpTool('generate_docs_questionnaire', {
                    company_name: companyName,
                    website_url: siteUrl,
                    contact_email: contactEmail,
                    jurisdictions: ['GDPR', 'CCPA'],
                    collects_cookies: true,
                    uses_google_analytics: true,
                    processes_payments: true
                  })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all text-center"
                >
                  Synthesize Policies
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cookie_banner' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Banner Theme</label>
                <select 
                  value={bannerTheme} 
                  onChange={e => setBannerTheme(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                >
                  <option value="dark">Dark Theme (Recommended)</option>
                  <option value="light">Light Theme</option>
                  <option value="glassmorphism">Glassmorphism Blur</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Position</label>
                <select 
                  value={bannerPosition} 
                  onChange={e => setBannerPosition(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                >
                  <option value="bottom">Bottom Full Width</option>
                  <option value="bottom_right">Bottom Right Floating Card</option>
                  <option value="bottom_left">Bottom Left Floating Card</option>
                  <option value="center_modal">Center Strict Modal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Accent Button Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={accentColor} 
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={accentColor} 
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => runMcpTool('configure_cookie_banner', {
                    siteId: 'site_paperloo_sandbox',
                    theme: bannerTheme,
                    position: bannerPosition,
                    accent_color: accentColor,
                    enable_gcm_v2: true,
                    auto_block_trackers: true
                  })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-white/10 border border-white/15 text-white font-mono text-xs hover:bg-white/15 transition-all text-center"
                >
                  Save Config
                </button>
                <button
                  onClick={() => runMcpTool('get_cookie_banner_script', {
                    siteId: 'site_paperloo_sandbox',
                    framework: 'html'
                  })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all text-center"
                >
                  Get Embed Code
                </button>
              </div>
            </div>
          )}

          {activeTab === 'gtm' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">GTM Container ID</label>
                <input 
                  type="text" 
                  value={gtmId} 
                  onChange={e => setGtmId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-accent"
                />
              </div>
              <div className="bg-black/40 border border-white/10 p-3.5 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-accent font-mono">Google Consent Mode v2 Defaults:</span>
                <p className="text-white/70 leading-relaxed">
                  Default state sets <code className="text-accent">ad_storage</code>, <code className="text-accent">analytics_storage</code>, <code className="text-accent">ad_user_data</code>, and <code className="text-accent">ad_personalization</code> to <code className="text-red-400">denied</code> until explicit user opt-in.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => runMcpTool('configure_gtm_integration', {
                    siteId: 'site_paperloo_sandbox',
                    gtm_container_id: gtmId,
                    trigger_events: true
                  })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-white/10 border border-white/15 text-white font-mono text-xs hover:bg-white/15 transition-all text-center"
                >
                  Configure GTM
                </button>
                <button
                  onClick={() => runMcpTool('get_gtm_container_setup', {
                    siteId: 'site_paperloo_sandbox',
                    gtm_container_id: gtmId
                  })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all text-center"
                >
                  Get GTM Snippets
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Target Website URL to Audit</label>
                <input 
                  type="text" 
                  value={auditUrl} 
                  onChange={e => setAuditUrl(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => runMcpTool('scan_cookies', { url: auditUrl })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-white/10 border border-white/15 text-white font-mono text-xs hover:bg-white/15 transition-all text-center"
                >
                  Scan Cookies
                </button>
                <button
                  onClick={() => runMcpTool('audit_site', { url: auditUrl, deep_scan: true })}
                  disabled={loading}
                  className="flex-1 py-3 px-3 rounded-xl bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all text-center"
                >
                  Run Full Audit
                </button>
              </div>
            </div>
          )}

          {activeTab === 'all_tools' && (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {[
                { name: 'add_site', desc: 'Provision & monitor new domain' },
                { name: 'delete_site', desc: 'Remove site and records' },
                { name: 'list_sites', desc: 'List all properties & grades' },
                { name: 'get_site', desc: 'Fetch full site configuration' },
                { name: 'get_questionnaire_schema', desc: 'Get legal questionnaire fields' },
                { name: 'generate_docs_questionnaire', desc: 'Synthesize Privacy, Terms, Cookies' },
                { name: 'audit_site', desc: 'Multi-vector domain audit' },
                { name: 'configure_cookie_banner', desc: 'Configure banner layout & GCM v2' },
                { name: 'get_cookie_banner_script', desc: 'Generate embed script snippet' },
                { name: 'configure_gtm_integration', desc: 'Link GTM with Consent Mode v2' },
                { name: 'get_gtm_container_setup', desc: 'GTM triggers and snippets' },
                { name: 'scan_cookies', desc: 'Inventory trackers & legal bases' },
                { name: 'generate_dpa', desc: 'Generate GDPR Article 28 DPA' },
                { name: 'verify_compliance', desc: 'Issue verifiable certificate & badge' }
              ].map(t => (
                <button
                  key={t.name}
                  onClick={() => runMcpTool(t.name, { siteId: 'site_paperloo_sandbox', url: 'https://paperloo.vercel.app', name: 'Paperloo' })}
                  className="w-full text-left p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-accent/40 flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-white group-hover:text-accent">{t.name}</span>
                    <p className="text-[10px] text-white/50">{t.desc}</p>
                  </div>
                  <Play className="w-3 h-3 text-white/30 group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Output Panel */}
        <div className="lg:col-span-7 bg-black/80 border border-white/15 rounded-2xl p-5 flex flex-col justify-between min-h-[380px] font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/60">JSON-RPC 2.0 Response Inspector</span>
            </div>
            {output && (
              <button
                onClick={() => copyToClipboard(JSON.stringify(output, null, 2))}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 py-4 overflow-x-auto max-h-[340px] text-white/90">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
                <RotateCw className="w-6 h-6 animate-spin text-accent" />
                <span>Executing Model Context Protocol method...</span>
              </div>
            ) : output ? (
              <pre className="whitespace-pre font-mono text-[11px] leading-relaxed text-emerald-300">
                {JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40">
                <Terminal className="w-8 h-8 mb-3 text-white/20" />
                <p>Select any tool action on the left to execute live against <code className="text-accent">/api/mcp</code></p>
                <p className="text-[10px] mt-1 text-white/30">Autonomous agents can connect directly via Streamable HTTP</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
            <span>Transport: Streamable HTTP</span>
            <span className="text-accent font-bold">14 Tools Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
