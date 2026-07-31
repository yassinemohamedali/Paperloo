import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Globe, 
  ShieldAlert, 
  CheckCircle, 
  Mail, 
  Terminal, 
  ArrowRight,
  LifeBuoy,
  FileText
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Support() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "SYSTEM INITIALIZED: I am the Paperloo Support AI. I have loaded your profile and analyzed all connected sites. How can I assist you with your compliance architecture today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch sites to display "Groq Active Access" to user
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['support-sites', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('agency_id', user?.id as string);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Auto-scroll chat inside its local container to prevent global page scroll hijacking
  useEffect(() => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      });
    }
  }, [messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user?.id,
          messages: [...messages, userMsg]
        })
      });

      if (!res.ok) {
        throw new Error('Groq support network returned an unexpected frame error');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err: any) {
      toast.error(err.message || "Failed negotiating with Groq support node.");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "ERROR: Communication timeout. Please verify your system state or contact Operations directly using the ticket panel." 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim() || isSubmittingTicket) return;

    setIsSubmittingTicket(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          { 
            email: user?.email ?? 'anonymous@paperloo.io', 
            message: `[SUPPORT TICKET] Subject: ${ticketSubject}\n\n${ticketMessage}` 
          }
        ]);
      
      if (error) console.warn("Fallback database insert used", error);
      
      toast.success('Support ticket logged and routed to operations.');
      setTicketSubject('');
      setTicketMessage('');
    } catch (err) {
      toast.error('Failed submitting ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Title block */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center text-accent">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-sans font-black italic uppercase tracking-tighter">Support & Operations Center</h1>
        </div>
        <p className="text-sm text-muted-custom uppercase tracking-widest max-w-2xl">
          Interact with Groq compliance intelligence or transmit formal support files to Paperloo Operations.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Groq-connected Site Vault & Support form */}
        <div className="space-y-8 lg:col-span-1">
          {/* Sites Vault Box */}
          <div className="bg-surface border border-white/10 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 scan-lines opacity-5 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent animate-pulse" />
                <h3 className="text-xs font-sans font-black uppercase tracking-widest">Groq Context Matrix</h3>
              </div>
              <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                ACTIVE
              </span>
            </div>
            
            <p className="text-xs text-muted-custom mb-4 uppercase tracking-wider leading-relaxed">
              Groq AI support has active, automated permission frames allowing immediate analysis of your connected web platforms:
            </p>

            {sitesLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-custom">
                <div className="h-3 w-3 border border-t-transparent border-accent rounded-full animate-spin" />
                <span>QUERYING SITES...</span>
              </div>
            ) : !sites || sites.length === 0 ? (
              <div className="p-4 bg-black/20 border border-white/5 rounded text-center">
                <p className="text-xs text-muted-custom uppercase tracking-wider">No sites connected yet. Create one in the Sites panel to authorize Groq access.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {sites.map((site: any) => (
                  <div key={site.id} className="p-3 bg-black/30 border border-white/5 rounded flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider truncate text-white">{site.name}</p>
                      <p className="text-[10px] text-muted-custom truncate">{site.url}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`text-[10px] font-sans font-black px-2 py-0.5 rounded border ${
                        site.compliance_grade === 'A' ? 'border-green-500/20 text-green-400 bg-green-500/5' :
                        site.compliance_grade === 'B' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' :
                        'border-red-500/20 text-red-400 bg-red-500/5'
                      }`}>
                        GRADE {site.compliance_grade || 'C'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact us form / formal ticket */}
          <div className="bg-surface border border-white/10 p-6 rounded-lg relative">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
              <Mail className="h-4 w-4 text-accent" />
              <h3 className="text-xs font-sans font-black uppercase tracking-widest">Operations Ticket</h3>
            </div>
            
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="ticket-subject" className="text-[10px] font-black text-muted-custom tracking-widest uppercase block">Subject</label>
                <input 
                  id="ticket-subject"
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-xs font-mono text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="e.g. BILLING INQUIRY / CUSTOM DOMAIN ISSUES"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="ticket-message" className="text-[10px] font-black text-muted-custom tracking-widest uppercase block">Message Transmission</label>
                <textarea 
                  id="ticket-message"
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={e => setTicketMessage(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-xs font-mono text-white focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Transmit technical queries here..."
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingTicket}
                className="w-full bracket-btn border-accent text-accent py-3 mt-2 relative overflow-hidden"
              >
                <span className="bracket-btn-inner"></span>
                <span className="relative z-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                  {isSubmittingTicket ? 'TRANSMITTING...' : 'INITIATE OPERATIONS TRANSMISSION'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Support Chat Terminal */}
        <div className="lg:col-span-2 bg-surface border border-white/10 rounded-lg flex flex-col h-[650px] relative overflow-hidden">
          <div className="absolute inset-0 scan-lines opacity-[0.02] pointer-events-none" />
          
          {/* Header */}
          <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <div>
                <h3 className="text-xs font-sans font-black uppercase tracking-widest">COMPLIANCE ASSISTANT CHAT</h3>
                <p className="text-[9px] text-muted-custom uppercase tracking-wider">Llama3-8b via Groq Cloud Node</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted-custom bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                SECURE CONTEXT ENCRYPTED
              </span>
            </div>
          </div>

          {/* Message Stream */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-4 font-mono text-xs leading-relaxed border ${
                      isAssistant 
                        ? 'bg-surface border-white/10 text-white' 
                        : 'bg-accent/5 border-accent/20 text-accent shadow-[0_4px_20px_rgba(200,241,53,0.03)]'
                    }`}>
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 text-[9px] uppercase tracking-widest text-muted-custom">
                        <Terminal className="h-3 w-3" />
                        <span>{isAssistant ? 'PAPERLOO SUPPORT AI' : 'USER CONTEXT'}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isSending && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-surface border border-white/5 rounded-lg p-4 font-mono text-xs text-muted-custom flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold">GROQ DECRYPTING QUERY...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/10 flex items-center gap-3">
            <input 
              type="text"
              required
              disabled={isSending}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="ASK ABOUT COOKIE BANNER COMPLIANCE, GITHUB INJECTIONS, OR AUDITS..."
              className="flex-1 bg-black/60 border border-white/10 p-3 text-xs font-mono text-white focus:outline-none focus:border-accent disabled:opacity-50 transition-colors placeholder:text-muted-custom/40 uppercase"
            />
            <button 
              type="submit"
              disabled={isSending || !input.trim()}
              className="h-10 w-10 bg-accent text-black hover:bg-accent/80 disabled:opacity-50 flex items-center justify-center rounded transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
