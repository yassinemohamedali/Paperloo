
import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Code, Cpu, Globe, ArrowRight, Github } from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/v1/compliance/policy',
    desc: 'Generate a modular legal policy based on industry matrices.',
    params: ['industry', 'jurisdictions[]', 'branding']
  },
  {
    method: 'GET',
    path: '/v1/scan/:siteUrl',
    desc: 'Initiate a headless crawl and categorise cookie trackers.',
    params: ['url', 'deepScan']
  },
  {
    method: 'POST',
    path: '/v1/sites/push',
    desc: 'Inject site context & tracking data directly (Shopify, Wix, Custom).',
    params: ['url', 'platform', 'trackers[]', 'metadata']
  },
  {
    method: 'POST',
    path: '/v1/consent/audit',
    desc: 'Verify a hashed consent log against the Paperloo ledger.',
    params: ['hash', 'timestamp']
  }
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-accent selection:text-black">
      {/* Nav */}
      <nav className="p-8 border-b border-white/10 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <div className="flex items-center gap-6">
          <Link to="/trust" className="text-[10px] font-bold tracking-widest text-muted hover:text-white uppercase">Security</Link>
          <Link to="/signup" className="bracket-btn py-2 px-6 text-xs">
            <span className="bracket-btn-inner"></span>
            GET API KEY
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-12 h-fit lg:sticky lg:top-40">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">Documentation</h4>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-widest text-muted">
              <li className="text-white">Introduction</li>
              <li className="hover:text-accent cursor-pointer">Quickstart</li>
              <li className="hover:text-accent cursor-pointer">Authentication</li>
              <li className="hover:text-accent cursor-pointer">Rate Limits</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">API Reference</h4>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-widest text-muted">
              <li className="hover:text-accent cursor-pointer">Legal Engine</li>
              <li className="hover:text-accent cursor-pointer">Smart Scanner</li>
              <li className="hover:text-accent cursor-pointer">Consent Ledger</li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 space-y-24">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
              <Terminal className="w-3 h-3 text-accent" />
              <span className="text-[9px] font-black tracking-widest text-accent italic uppercase">Infrastructure SDK v2.4.1</span>
            </div>
            <h1 className="text-6xl font-sans font-black tracking-tighter italic uppercase">Developer Portal</h1>
            <p className="text-muted text-lg tracking-[0.1em] max-w-2xl leading-relaxed uppercase">
              Interact with Paperloo's global compliance protocols via our modular REST API and headless scanning infrastructure.
            </p>
          </section>

          {/* Quick Code */}
          <section className="bg-surface border border-white/10 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Code className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-sans font-black tracking-widest uppercase italic border-b border-accent/50 pb-1">Authentication</h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="bg-black/50 p-6 font-mono text-xs text-muted leading-relaxed rounded-lg border border-white/5">
                <code className="block text-white mb-2">$ curl -X POST https://api.paperloo.com/v1/scan \</code>
                <code className="block">  -H "Authorization: Bearer <span className="text-accent">YOUR_PROD_KEY</span>" \</code>
                <code className="block">  -d "url=https://agency-client.com"</code>
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-8">
            <h2 className="text-2xl font-sans font-black tracking-tight uppercase">Endpoints</h2>
            <div className="space-y-6">
              {ENDPOINTS.map((ep, i) => (
                <div key={i} className="p-8 border border-white/5 bg-surface/50 hover:border-white/10 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-accent text-black text-[9px] font-black italic">{ep.method}</span>
                      <code className="text-sm font-bold text-white tracking-widest">{ep.path}</code>
                    </div>
                    <button className="text-[9px] font-bold tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      TRY REQ →
                    </button>
                  </div>
                  <p className="text-[11px] text-muted tracking-widest uppercase mb-4 leading-relaxed">{ep.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {ep.params.map(p => (
                      <span key={p} className="text-[8px] px-2 py-0.5 bg-white/5 text-muted border border-white/5 font-bold">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-accent p-12 text-black space-y-6 text-center">
            <h2 className="text-4xl font-sans font-black tracking-tighter italic uppercase">Ready for Production?</h2>
            <p className="text-sm font-bold tracking-widest uppercase max-w-md mx-auto">
              Deployment keys are issued after mandatory infrastructure verification. Reach out for a pilot key.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup" className="px-8 py-3 bg-black text-white text-[10px] font-black tracking-[0.2em] hover:bg-black/90 transition-all uppercase">
                Apply for Key
              </Link>
              <button className="px-8 py-3 border border-black text-[10px] font-black tracking-[0.2em] hover:bg-black/5 transition-all uppercase flex items-center justify-center gap-2">
                <Github className="w-4 h-4" />
                View SDK
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="p-12 border-t border-white/10 text-center space-y-8">
        <div className="flex justify-center gap-8 text-[10px] text-muted font-bold tracking-widest uppercase">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/partners" className="hover:text-white">Partners</Link>
          <span>© 2026 PAPERLOO INFRASTRUCTURE</span>
        </div>
      </footer>
    </div>
  );
}
