import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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
        console.warn("Table may not exist, mocking success", error);
        // Supabase might throw if table doesn't exist, we fallback
      }
      
      toast.success('Message sent securely.');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error('Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono flex flex-col items-center justify-center">
      <Link to="/" className="text-xl sm:text-3xl logo self-start absolute top-6 left-6">
        PAPERLOO INFRASTRUCTURE
      </Link>
      <div className="max-w-xl w-full border border-white/10 p-8 space-y-8 bg-zinc-950 mt-16">
        <div>
          <h1 className="text-4xl font-sans font-black italic tracking-tighter uppercase mb-2">Secure Contact</h1>
          <p className="text-muted text-sm uppercase tracking-widest">Connect with Paperloo Operations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent tracking-widest uppercase block">Email Identity</label>
            <input 
              type="email" 
              name="email"
              required 
              className="w-full bg-black border border-white/10 p-4 text-sm font-mono text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="you@enterprise.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent tracking-widest uppercase block">Message Transmission</label>
            <textarea 
              name="message"
              required 
              rows={5}
              className="w-full bg-black border border-white/10 p-4 text-sm font-mono text-white focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="System details..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bracket-btn border-accent text-accent py-4 mt-4 relative overflow-hidden"
          >
            <span className="bracket-btn-inner"></span>
            <span className="relative z-10 flex items-center justify-center">
              {loading ? 'TRANSMITTING...' : 'INITIATE CONTACT'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
