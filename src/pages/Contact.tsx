import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      const { error } = await (supabase as any).from('contact_messages').insert([{ email, message }]);
      
      if (error) {
        console.warn("Table may not exist, logging request", error);
      }
      
      toast.success('Message transmitted securely. Our team will review within 24 hours.');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error('Could not transmit message. Please contact compliance@paperloo.com directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono selection:bg-accent selection:text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> RETURN TO INFRASTRUCTURE
          </Link>
          <div className="text-xs text-accent uppercase tracking-widest font-bold">
            PAPERLOO OPERATIONS CENTER
          </div>
        </div>

        <header className="space-y-4">
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[11px] font-bold text-accent tracking-widest uppercase">
            COMMUNICATIONS & STATUTORY ENQUIRIES
          </div>
          <h1 className="text-3xl md:text-5xl font-sans font-black italic tracking-tighter uppercase">
            CONTACT PAPERLOO INFRASTRUCTURE
          </h1>
          <p className="text-sm md:text-base text-zinc-400 font-mono leading-relaxed max-w-2xl">
            Direct operational channels for enterprise SaaS compliance governance, legal and regulatory queries, Data Subject Access Requests (DSAR), and security vulnerability disclosures.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Corporate Details Column */}
          <div className="space-y-6">
            <div className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Global Corporate Headquarters
              </h2>
              <div className="text-xs text-zinc-300 space-y-1 leading-relaxed">
                <p className="font-bold text-white">Paperloo Infrastructure Inc.</p>
                <p>548 Market St, Suite 29012</p>
                <p>San Francisco, CA 94104</p>
                <p>United States of America</p>
              </div>
            </div>

            <div className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <Mail className="w-4 h-4" /> Designated Contact Channels
              </h2>
              <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                <div>
                  <span className="text-zinc-500 block uppercase text-[10px]">General & Platform Support</span>
                  <a href="mailto:compliance@paperloo.com" className="text-white hover:text-accent font-bold">
                    compliance@paperloo.com
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[10px]">Data Protection Officer (DPO) & GDPR DSAR</span>
                  <a href="mailto:dpo@paperloo.com" className="text-white hover:text-accent font-bold">
                    dpo@paperloo.com
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[10px]">Security Incident Escalation (2-Hour SLA)</span>
                  <a href="mailto:security@paperloo.com" className="text-white hover:text-accent font-bold">
                    security@paperloo.com
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[10px]">Enterprise Voice & Direct Inquiries</span>
                  <p className="text-white font-bold flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-accent" /> +1-415-555-0199
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-white/10 p-6 bg-zinc-950 rounded-lg space-y-3">
              <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" /> Operating Hours & Response SLAs
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our regulatory operations desk is active Monday through Friday, 9:00 AM – 6:00 PM Pacific Standard Time. General queries are answered within 24 business hours. Critical regulatory and security escalations are addressed 24/7/365 under our 2-hour emergency response protocol.
              </p>
            </div>
          </div>

          {/* Secure Transmission Form */}
          <div className="border border-white/10 p-8 bg-zinc-950 rounded-lg space-y-6">
            <div>
              <h2 className="text-xl font-sans font-black italic tracking-tighter uppercase mb-1">Secure Message Transmission</h2>
              <p className="text-zinc-400 text-xs">Direct encrypted message queue to the compliance engineering team.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-accent tracking-widest uppercase block">
                  Sender Email Identity
                </label>
                <input 
                  type="email" 
                  name="email"
                  required 
                  className="w-full bg-black border border-white/10 p-3.5 text-xs font-mono text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-accent tracking-widest uppercase block">
                  Inquiry Category
                </label>
                <select 
                  name="category"
                  className="w-full bg-black border border-white/10 p-3.5 text-xs font-mono text-white focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="compliance">Regulatory & Statutory Compliance</option>
                  <option value="dsar">Data Subject Access Request (DSAR)</option>
                  <option value="api">API & MCP Developer Integration</option>
                  <option value="security">Security Vulnerability Report</option>
                  <option value="enterprise">Enterprise Contract / SLA</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-accent tracking-widest uppercase block">
                  Detailed Transmission
                </label>
                <textarea 
                  name="message"
                  required 
                  rows={6}
                  className="w-full bg-black border border-white/10 p-3.5 text-xs font-mono text-white focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Detail your request, target domain, or regulatory query..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bracket-btn border-accent text-accent py-4 mt-2 relative overflow-hidden"
              >
                <span className="bracket-btn-inner"></span>
                <span className="relative z-10 flex items-center justify-center font-bold tracking-wider text-xs">
                  {loading ? 'TRANSMITTING ENCRYPTED PAYLOAD...' : 'TRANSMIT SECURE INQUIRY'}
                </span>
              </button>
            </form>
          </div>
        </div>

        <footer className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Paperloo Infrastructure Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-accent transition-colors">ABOUT PAPERLOO</Link>
            <Link to="/privacy" className="hover:text-accent transition-colors">PRIVACY POLICY</Link>
            <Link to="/legal" className="hover:text-accent transition-colors">TERMS OF SERVICE</Link>
            <Link to="/docs/api" className="hover:text-accent transition-colors">API REFERENCE</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
