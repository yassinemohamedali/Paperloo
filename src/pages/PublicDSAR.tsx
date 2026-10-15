import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Shield, CheckCircle2, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicDSAR() {
  const { siteId } = useParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('access');
  const [message, setMessage] = useState('');
  const [country, setCountry] = useState('European Union (EU/EEA)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const { data: site, isLoading: isSiteLoading } = useQuery({
    queryKey: ['public-site-dsar', siteId],
    queryFn: async () => {
      if (!siteId) return null;
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, url, jurisdictions')
        .eq('id', siteId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!siteId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) {
      toast.error('Invalid site reference');
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please provide your full name and verified contact email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-dsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          full_name: fullName.trim(),
          email: email.trim(),
          request_type: requestType,
          message: `[Jurisdiction: ${country}] ${message.trim()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit DSAR request');
      }

      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const generatedRef = `DSAR-${(siteId || 'REQ').substring(0, 4).toUpperCase()}-${randomSuffix}`;
      setSubmittedRef(generatedRef);
      toast.success('Statutory Data Subject Access Request received and logged.');
    } catch (err: any) {
      toast.error(err.message || 'Unable to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const siteName = site?.name || 'Authorized Service Provider';
  const siteUrl = site?.url || '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50">Statutory Rights Intake Portal</div>
            <div className="text-sm font-bold tracking-tight text-white">{siteName}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-white/40 tracking-wider uppercase">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Encrypted Intake (TLS 1.3)</span>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {submittedRef ? (
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-8 rounded-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-wide">Request Submitted Successfully</h2>
              <p className="text-sm text-white/60">
                Your statutory data subject request has been immutably recorded into the compliance audit ledger.
              </p>
            </div>

            <div className="bg-black/60 border border-white/10 p-4 rounded text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Reference Token:</span>
                <span className="font-mono font-bold text-emerald-400">{submittedRef}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Statutory SLA Window:</span>
                <span className="text-white font-medium">30 Days (GDPR Art. 12(3)) / 45 Days (CPRA)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Registered Email:</span>
                <span className="text-white font-mono">{email}</span>
              </div>
            </div>

            <p className="text-xs text-white/40">
              A verification notice and status updates will be transmitted to your email address. You do not need to submit duplicate requests.
            </p>

            <button
              onClick={() => {
                setSubmittedRef(null);
                setFullName('');
                setEmail('');
                setMessage('');
              }}
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white underline underline-offset-4"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] tracking-widest uppercase text-emerald-400">
                <Shield className="w-3 h-3" />
                <span>GDPR Art. 12–22 & CCPA/CPRA Compliance</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">
                Exercise Your Statutory Data Rights
              </h1>
              <p className="text-sm text-white/60 leading-relaxed">
                Under European Union GDPR, UK GDPR, California CPRA, and applicable privacy statutes, you possess unequivocal legal rights regarding the personal data processed by <strong>{siteName}</strong>. Use this official intake portal to submit your request directly to the Data Protection Lead.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-white/5 border border-white/15 rounded px-3.5 py-2.5 text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Verified Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-white/5 border border-white/15 rounded px-3.5 py-2.5 text-sm focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Statutory Right Requested *
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded px-3 py-2.5 text-sm focus:border-white focus:outline-none transition-colors text-white"
                  >
                    <option value="access">Right of Access / Portability (GDPR Art. 15 / CCPA § 1798.110)</option>
                    <option value="erasure">Right to Erasure / Deletion (GDPR Art. 17 / CCPA § 1798.105)</option>
                    <option value="rectification">Right to Rectification / Correction (GDPR Art. 16 / CCPA § 1798.106)</option>
                    <option value="restriction">Right to Restrict Processing (GDPR Art. 18)</option>
                    <option value="objection">Right to Object to Processing (GDPR Art. 21)</option>
                    <option value="ccpa_opt_out">Do Not Sell or Share My Information (CCPA/CPRA § 1798.120)</option>
                    <option value="withdraw_consent">Withdraw Prior Consent (GDPR Art. 7(3))</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Jurisdiction / Residence *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded px-3 py-2.5 text-sm focus:border-white focus:outline-none transition-colors text-white"
                  >
                    <option value="European Union (EU/EEA)">European Union (EU/EEA - GDPR)</option>
                    <option value="United Kingdom">United Kingdom (UK GDPR / DPA 2018)</option>
                    <option value="California, USA">California, USA (CCPA / CPRA)</option>
                    <option value="Other United States">Other US State (VCDPA, CPA, CTDPA, etc.)</option>
                    <option value="Brazil">Brazil (LGPD)</option>
                    <option value="South Africa">South Africa (POPIA)</option>
                    <option value="Australia">Australia (Privacy Act 1988)</option>
                    <option value="International / Other">International / Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                  Specific Scope & Request Details (Optional)
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify particular accounts, transaction IDs, or services associated with your data request to expedite processing..."
                  className="w-full bg-white/5 border border-white/15 rounded p-3 text-sm focus:border-white focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-3 rounded text-[11px] text-white/50 space-y-1">
                <p>
                  <strong>Statutory SLA:</strong> Responses are provided free of charge within <strong>30 calendar days</strong> under GDPR Article 12(3) or <strong>45 days</strong> under Cal. Civ. Code § 1798.130.
                </p>
                <p>
                  To protect personal data from unauthorized access, we may require additional reasonable verification of identity prior to fulfilling access or erasure requests.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded hover:bg-white/90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Encrypted DSAR...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Statutory Rights Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/40 space-y-2 md:space-y-0">
        <div>
          Verified Statutory Intake for <span className="text-white/70">{siteName}</span> {siteUrl && `(${siteUrl})`}
        </div>
        <div className="flex items-center space-x-4">
          <span>Encrypted via Paperloo Compliance Shield</span>
        </div>
      </footer>
    </div>
  );
}
