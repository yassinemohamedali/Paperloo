
import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Terminal, Box, Lock, Database, Search } from 'lucide-react';

const ENDPOINTS = [
  {
    category: 'Legal Generation',
    items: [
      { method: 'POST', path: '/v1/generate/policy', desc: 'Generate a standard or custom legal policy.' },
      { method: 'GET', path: '/v1/documents/:docId', desc: 'Retrieve a specific document version.' }
    ]
  },
  {
    category: 'Scanning',
    items: [
      { method: 'POST', path: '/v1/scan/initiate', desc: 'Start a headless cookie and script audit.' },
      { method: 'GET', path: '/v1/scan/:scanId/results', desc: 'Fetch detailed results of a specific scan.' }
    ]
  },
  {
    category: 'External Injection (Non-GitHub)',
    items: [
      { method: 'POST', path: '/v1/sites/push', desc: 'Push site context and architecture data directly from Shopify, Wix, or custom backends.' },
      { method: 'POST', path: '/v1/sites/sync-state', desc: 'Sync live application state for real-time compliance grading without GitHub.' }
    ]
  },
  {
    category: 'Consent Management',
    items: [
      { method: 'POST', path: '/v1/consent/log', desc: 'Securely log a user consent event.' },
      { method: 'POST', path: '/v1/dsar/submit', desc: 'Programmatically submit a DSAR request.' }
    ]
  }
];

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <div className="flex gap-8">
           <Link to="/docs" className="text-[10px] font-bold text-muted hover:text-accent">BACK TO DOCS</Link>
           <Link to="/signup" className="text-[10px] font-bold text-accent hover:underline underline-offset-4">REQUEST KEY</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-4 gap-16">
        <aside className="lg:col-span-1 space-y-8 h-fit sticky top-40">
           <h4 className="text-[10px] font-black text-accent tracking-[0.3em]">API ENDPOINTS</h4>
           <div className="space-y-6">
             {ENDPOINTS.map(cat => (
               <div key={cat.category} className="space-y-3">
                 <p className="text-[9px] font-black text-white/40 tracking-widest">{cat.category}</p>
                 <ul className="space-y-2">
                    {cat.items.map(item => (
                      <li key={item.path} className="text-[10px] font-bold hover:text-accent cursor-pointer transition-colors lowercase tracking-tighter">
                        <span className="uppercase italic mr-2 text-[8px] opacity-50">{item.method}</span>
                        {item.path}
                      </li>
                    ))}
                 </ul>
               </div>
             ))}
           </div>
        </aside>

        <div className="lg:col-span-3 space-y-24">
           <section className="space-y-6">
             <h1 className="text-6xl font-sans font-black tracking-tighter italic">REST API <span className="text-accent underline">v1.2</span></h1>
             <p className="text-muted text-sm tracking-widest leading-loose max-w-2xl">
               The Paperloo Infrastructure API follows RESTful architectural patterns. All requests are authenticated via Bearer tokens provided in the Authorization header.
             </p>
           </section>

           <section className="bg-surface border border-white/10 p-12 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Lock className="w-64 h-64" />
             </div>
             <div className="relative z-10 space-y-6">
               <h2 className="text-2xl font-black italic tracking-tight">AUTHENTICATION</h2>
               <p className="text-xs text-muted leading-relaxed tracking-widest max-w-xl">
                 All requests must include your pilot API key. Do not share your key in client-side code.
               </p>
               <div className="bg-black/50 p-6 border border-white/5 rounded">
                 <code className="text-accent text-[11px] lowercase tracking-tighter break-all italic font-bold">
                   curl -H "Authorization: Bearer paperloo_live_xxxxxxxxxxxxxxxx" \
                   https://api.paperloo.com/v1/generate/policy
                 </code>
               </div>
             </div>
           </section>

           <div className="space-y-32">
              {ENDPOINTS.map(cat => (
                <section key={cat.category} className="space-y-12">
                   <h2 className="text-4xl font-sans font-black italic tracking-tighter text-accent border-b border-accent/20 pb-4">{cat.category}</h2>
                   <div className="space-y-12">
                      {cat.items.map(item => (
                        <div key={item.path} className="grid grid-cols-1 md:grid-cols-2 gap-12 group">
                           <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-white text-black text-[10px] font-black italic">{item.method}</span>
                                <code className="text-sm font-black lowercase tracking-tighter">{item.path}</code>
                              </div>
                              <p className="text-xs text-muted leading-loose tracking-widest uppercase">{item.desc}</p>
                              <div className="pt-4 border-t border-white/10">
                                <p className="text-[9px] font-black text-white/40 mb-4 tracking-widest">PARAMETERS</p>
                                <ul className="space-y-4">
                                  <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-bold lowercase tracking-tighter">site_id</span>
                                    <span className="text-[10px] text-accent italic">string / required</span>
                                  </li>
                                  <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-bold lowercase tracking-tighter">jurisdiction</span>
                                    <span className="text-[10px] text-muted italic">enum / gdpr, ccpa...</span>
                                  </li>
                                </ul>
                              </div>
                           </div>
                           <div className="p-8 bg-surface-2 border border-white/5 group-hover:border-white/20 transition-all font-mono text-[10px]">
                              <div className="flex justify-between mb-4 border-b border-white/10 pb-2">
                                <span className="text-white/40">RESPONSE BODY</span>
                                <span className="text-green-500">200 OK</span>
                              </div>
                              <pre className="text-accent leading-relaxed lowercase tracking-tight">
                                {`{
  "status": "success",
  "data": {
    "id": "doc_8f92j1",
    "type": "privacy_policy",
    "content": "Encoded infrastructure data...",
    "version": 2,
    "last_updated": "2026-05-09T14:41:00Z"
  }
}`}
                              </pre>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
              ))}
           </div>
        </div>
      </main>

      <footer className="p-24 bg-surface border-t border-white/10 text-center">
        <p className="text-muted text-[10px] font-bold tracking-widest mb-12 italic">PILOT VERSION 1.2.0 · BUILD ID 0x8F2A</p>
        <div className="flex justify-center gap-12 font-black text-[11px] tracking-widest">
           <Link to="/docs" className="hover:text-accent">DOCS</Link>
           <Link to="/status" className="hover:text-accent">STATUS</Link>
           <Link to="/" className="hover:text-accent">HOME</Link>
        </div>
      </footer>
    </div>
  );
}
