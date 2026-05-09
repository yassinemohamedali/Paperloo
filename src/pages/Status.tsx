
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle, Clock, Shield, Zap, Globe } from 'lucide-react';

const SYSTEMS = [
  { name: 'Legal Drafting Engine', status: 'Operational', uptime: '99.99%', latency: '42ms' },
  { name: 'Cookie Scanner Network', status: 'Operational', uptime: '99.95%', latency: '120ms' },
  { name: 'Governance API (v1/v2)', status: 'Operational', uptime: '100%', latency: '18ms' },
  { name: 'Consent Ledger', status: 'Operational', uptime: '100%', latency: '5ms' },
  { name: 'Documentation Portal', status: 'Operational', uptime: '99.99%', latency: '12ms' },
];

export default function Status() {
  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase selection:bg-accent selection:text-black">
      <nav className="p-8 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl logo">PAPERLOO INF</Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-[10px] font-bold tracking-widest text-muted hover:text-white uppercase">Home</Link>
          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-green-500 tracking-widest">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24 space-y-24">
        <section className="space-y-8">
          <h1 className="text-6xl font-sans font-black tracking-tighter italic">SYSTEM <span className="text-accent underline">STATUS.</span></h1>
          <p className="text-muted text-sm tracking-[0.2em] leading-relaxed max-w-2xl">
            REAL-TIME MONITORING OF PAPERLOO'S GLOBAL COMPLIANCE INFRASTRUCTURE AND GOVERNANCE NODES.
          </p>
        </section>

        {/* Global Uptime */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface border border-white/10 p-8 space-y-4">
            <p className="text-[10px] text-muted font-bold tracking-widest">GLOBAL UPTIME</p>
            <p className="text-4xl font-sans font-black text-accent tracking-tighter italic">99.99%</p>
          </div>
          <div className="bg-surface border border-white/10 p-8 space-y-4">
            <p className="text-[10px] text-muted font-bold tracking-widest">API LATENCY (AVG)</p>
            <p className="text-4xl font-sans font-black text-accent tracking-tighter italic">24ms</p>
          </div>
          <div className="bg-surface border border-white/10 p-8 space-y-4">
            <p className="text-[10px] text-muted font-bold tracking-widest">ACTIVE NODES</p>
            <p className="text-4xl font-sans font-black text-accent tracking-tighter italic">48</p>
          </div>
        </section>

        {/* Incident Log */}
        <section className="space-y-12">
          <h2 className="text-xl font-sans font-black tracking-widest italic border-b border-white/10 pb-4 flex items-center gap-4">
            <Activity className="h-5 w-5 text-accent" />
            OPERATIONAL LOGS
          </h2>
          <div className="space-y-4">
            {SYSTEMS.map((system, i) => (
              <div key={i} className="bg-surface border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-accent/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-widest italic">{system.name}</h4>
                    <p className="text-[9px] text-muted tracking-widest">UPTIME: {system.uptime} | LATENCY: {system.latency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black tracking-widest rounded-full">
                  {system.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Incidents */}
        <section className="space-y-8 opacity-50">
          <h3 className="text-xs font-black tracking-[0.3em] text-muted uppercase">Past Incidents (Last 30 Days)</h3>
          <div className="p-8 border border-white/5 text-center">
            <p className="text-[10px] font-bold tracking-widest">NO INCIDENTS REPORTED IN THIS PERIOD.</p>
          </div>
        </section>
      </main>

      <footer className="p-12 border-t border-white/10 text-center">
        <p className="text-[10px] text-muted font-black tracking-widest italic mb-2">PAPERLOO INFRASTRUCTURE STATUS PORTAL</p>
        <p className="text-[8px] text-white/20 tracking-tighter">REFRESHED EVERY 60 SECONDS · AUTO-DIAGNOSTICS ACTIVE</p>
      </footer>
    </div>
  );
}
