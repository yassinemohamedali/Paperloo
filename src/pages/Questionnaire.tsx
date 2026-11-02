import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Search, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generateDocuments } from '@/src/services/aiService';
import { calculateComplianceScore } from '@/src/lib/compliance';
import CookieScannerModal from '@/src/components/CookieScannerModal';
import ComplianceCheckStep from '@/src/components/ComplianceCheckStep';
import { runPreFlightComplianceCheck } from '@/src/data/complianceChecker';
import { DetectedCookieItem } from '@/src/data/clauseLibrary';

type Site = Database['public']['Tables']['sites']['Row'];
type QuestionnaireResponse = Database['public']['Tables']['questionnaire_responses']['Row'];

interface QuestionDef {
  id: string;
  label: string;
  description?: string;
  type: 'boolean' | 'number' | 'text' | 'select';
  options?: { value: string; label: string }[];
  citation?: string;
}

interface StepDef {
  title: string;
  description: string;
  questions: QuestionDef[];
  isCustomStep?: 'compliance_check';
}

const EXPANDED_STEPS: StepDef[] = [
  {
    title: 'Data Collection & Minors',
    description: 'Disclose personal data elements collected directly or indirectly from visitors.',
    questions: [
      { id: 'collects_email', label: 'Do you collect user email addresses?', description: 'Contact inquiries, newsletter subscriptions, or account logins.', type: 'boolean', citation: 'GDPR Art. 6(1)(b)' },
      { id: 'collects_names', label: 'Do you collect full names?', description: 'First and last name for account identification.', type: 'boolean' },
      { id: 'collects_payment', label: 'Do you process financial transactions or billing?', description: 'Credit card checkouts, subscriptions, or digital invoices.', type: 'boolean', citation: 'PCI-DSS & GDPR Art. 6' },
      { id: 'collects_location', label: 'Do you collect location or IP geolocation data?', description: 'Real-time GPS coordinates or country-level IP derivation.', type: 'boolean' },
      { id: 'collects_minors', label: 'Is this site accessible to or intended for children under 13 (or 16 in EU)?', description: 'Triggers COPPA verifiable parental consent requirements.', type: 'boolean', citation: 'COPPA 16 CFR § 312 & GDPR Art. 8' },
      { id: 'collects_sensitive', label: 'Do you process Sensitive Personal Information (SPI)?', description: 'Government IDs, biometric data, precise geolocation, or account credentials.', type: 'boolean', citation: 'Cal. Civ. Code § 1798.121 (CPRA)' }
    ]
  },
  {
    title: 'Cookies & Trackers',
    description: 'Disclose web analytics, conversion pixels, and advertising beacons.',
    questions: [
      { id: 'uses_analytics', label: 'Do you deploy Google Analytics (GA4) or telemetry tools?', description: 'Measures pageviews, bounce rates, and traffic sources.', type: 'boolean', citation: 'EDPB Guidelines 05/2020' },
      { id: 'uses_ads', label: 'Do you run advertising pixels (Meta Pixel, Google Ads, TikTok)?', description: 'Used for retargeting and cross-context behavioral advertising.', type: 'boolean', citation: 'Cal. Code Regs. tit. 11 § 7025' },
      { id: 'uses_session_recording', label: 'Do you use session replay or heatmaps (Hotjar, Clarity)?', description: 'Records user cursor movements and click telemetry.', type: 'boolean' },
      { id: 'uses_social_login', label: 'Do you offer social login (Google, Apple, Facebook)?', description: 'Allows authentication via third-party identity providers.', type: 'boolean' }
    ]
  },
  {
    title: 'Third-Party Processors',
    description: 'Vetted vendors who receive or process user data on your behalf.',
    questions: [
      { id: 'uses_stripe', label: 'Do you utilize Stripe or PayPal for payment processing?', description: 'Tokens are processed under PCI-DSS Level 1 certification.', type: 'boolean' },
      { id: 'uses_email_marketing', label: 'Do you use Mailchimp, SendGrid, or Klaviyo for email campaigns?', description: 'Automates customer communications and product updates.', type: 'boolean' },
      { id: 'uses_support_chat', label: 'Do you deploy live chat widgets (Intercom, Zendesk, Crisp)?', description: 'Captures visitor chat transcripts and support tickets.', type: 'boolean' },
      { id: 'uses_us_cloud', label: 'Is data stored on US cloud infrastructure (AWS, Vercel, Supabase)?', description: 'Requires DPF or Standard Contractual Clauses (SCCs).', type: 'boolean', citation: 'EDPB Recommendations 01/2020' }
    ]
  },
  {
    title: 'Accounts, Billing & Content',
    description: 'Operational terms governing subscriptions, refunds, and user uploads.',
    questions: [
      { id: 'has_accounts', label: 'Can users create individual accounts with passwords?', description: 'Enforces security, credential protection, and account suspension terms.', type: 'boolean' },
      { id: 'has_subscriptions', label: 'Do you sell recurring subscriptions or auto-renewing memberships?', description: 'Mandates clear notice of recurring billing and cancellation terms.', type: 'boolean' },
      { id: 'refund_period_days', label: 'Refund Guarantee Window (in days):', description: 'Minimum 14 days required for EU statutory right of withdrawal.', type: 'number', citation: 'Directive 2011/83/EU' },
      { id: 'hosts_ugc', label: 'Do users post comments, reviews, or upload digital content?', description: 'Triggers DMCA copyright safe harbor and content moderation clauses.', type: 'boolean' },
      { id: 'distributes_software', label: 'Do you distribute downloadable apps, plugins, or software code?', description: 'Generates End User License Agreement (EULA) terms.', type: 'boolean' },
      { id: 'provides_advice', label: 'Does your content touch on medical, legal, or financial topics?', description: 'Generates professional advice liability disclaimers.', type: 'boolean' }
    ]
  },
  {
    title: 'Retention & Privacy Contacts',
    description: 'Statutory contact channels, retention periods, and supervisory authorities.',
    questions: [
      { id: 'data_retention_period', label: 'Maximum Data Retention Duration (in months):', description: 'Statutory standard is between 12 and 24 months for inactive accounts.', type: 'number', citation: 'Cal. Code Regs. tit. 11 § 7002' },
      { id: 'dpo_email', label: 'Official Privacy Inquiries Email:', description: 'Point of contact for GDPR/CCPA data subject requests.', type: 'text' },
      { id: 'company_address', label: 'Physical Company Headquarters Address:', description: 'Required for CAN-SPAM and statutory legal notices.', type: 'text' },
      { id: 'governing_law', label: 'Governing Law & Legal Jurisdiction:', description: 'e.g. State of California, United States or England and Wales.', type: 'text' }
    ]
  },
  {
    title: 'Pre-Flight Regulatory Verification',
    description: 'Automated verification against regulator guidance before compiling documents.',
    questions: [],
    isCustomStep: 'compliance_check'
  }
];

export default function Questionnaire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    collects_email: true,
    collects_names: true,
    collects_payment: true,
    uses_analytics: true,
    has_accounts: true,
    refund_period_days: 14,
    data_retention_period: 12,
    uses_us_cloud: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCookies, setScannedCookies] = useState<DetectedCookieItem[]>([]);

  const { data: site } = useQuery<Site>({
    queryKey: ['site', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('sites').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingResponse } = useQuery<QuestionnaireResponse>({
    queryKey: ['questionnaire-response', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('questionnaire_responses').select('*').eq('site_id', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (existingResponse && existingResponse.answers) {
      setAnswers(prev => ({
        ...prev,
        ...(existingResponse.answers as Record<string, any>)
      }));
    }
  }, [existingResponse]);

  const upsertMutation = useMutation({
    mutationFn: async (newAnswers: Record<string, any>) => {
      const { error } = await supabase
        .from('questionnaire_responses')
        .upsert({
          site_id: id as string,
          answers: newAnswers,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'site_id' });
      if (error) throw error;
    },
  });

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    try {
      await upsertMutation.mutateAsync(answers);
    } catch (e) {
      console.warn('Auto-saving answers had an error:', e);
    }

    if (currentStep < EXPANDED_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAutoFix = (action: { field: string; suggestedValue: any; label: string }) => {
    updateAnswer(action.field, action.suggestedValue);
    toast.success(`Applied fix: ${action.label}`);
  };

  const handleApplyCookies = (cookies: DetectedCookieItem[]) => {
    setScannedCookies(cookies);
    // Auto-sync answers with real scanner findings
    const hasAnalytics = cookies.some(c => c.category === 'Analytics');
    const hasMarketing = cookies.some(c => c.category === 'Marketing');
    setAnswers(prev => ({
      ...prev,
      uses_analytics: hasAnalytics,
      uses_ads: hasMarketing,
      scanned_cookies_inventory: cookies
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (!id) throw new Error("ID not found");

      await upsertMutation.mutateAsync(answers).catch(() => {});

      const results = await generateDocuments(id, 'en');
      await calculateComplianceScore(id).catch(console.error);

      await queryClient.invalidateQueries({ queryKey: ['documents', id] });
      await queryClient.invalidateQueries({ queryKey: ['document-versions', id] });
      await queryClient.invalidateQueries({ queryKey: ['site', id] });
      await queryClient.invalidateQueries({ queryKey: ['compliance-score', id] });
      await queryClient.invalidateQueries({ queryKey: ['sites'] });

      toast.success(`Generated verified legal compliance suite from modular clauses!`);
      navigate(`/sites/${id}/documents`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate documents');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeStep = EXPANDED_STEPS[currentStep];
  const preFlightReport = runPreFlightComplianceCheck(
    { name: site?.name || 'Company', url: site?.url || 'https://example.com', jurisdictions: site?.jurisdictions || [] },
    answers,
    scannedCookies
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c8f135]/10 text-[#c8f135] border border-[#c8f135]/30">
                Modular Legal Engine
              </span>
              <span className="text-xs text-zinc-400">Grounded in EDPB, CPPA &amp; ICO Guidance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Compliance Questionnaire &amp; Clause Assembler
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Monitored Property: <span className="text-white font-semibold">{site?.name || 'Target Site'}</span> ({site?.url || ''})
            </p>
          </div>

          {/* Quick Scanner Action */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-zinc-200 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-[#c8f135]" />
            Scan Site Cookies ({scannedCookies.length > 0 ? `${scannedCookies.length} Detected` : 'Run Scanner'})
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-[#c8f135]">
              Step {currentStep + 1} of {EXPANDED_STEPS.length}: {activeStep.title}
            </span>
            <span>{Math.round(((currentStep + 1) / EXPANDED_STEPS.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#c8f135] h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / EXPANDED_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          {activeStep.isCustomStep === 'compliance_check' ? (
            <ComplianceCheckStep
              report={preFlightReport}
              onAutoFix={handleAutoFix}
              onProceedToPublish={handleGenerate}
              onRerunChecks={() => toast.success('Re-evaluated compliance rules!')}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">{activeStep.title}</h2>
                <p className="text-xs text-zinc-400 mt-1">{activeStep.description}</p>
              </div>

              {/* Special interactive banner in Cookies step */}
              {currentStep === 1 && (
                <div className="p-4 rounded-xl bg-[#c8f135]/5 border border-[#c8f135]/20 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#c8f135] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Live Site Cookie Scanner Available
                    </h4>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Don't guess what cookies are running. Scan your live URL or import DevTools cookies to populate real trackers.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="shrink-0 px-3.5 py-1.5 bg-[#c8f135] hover:bg-[#b8e125] text-black font-semibold text-xs rounded-lg transition"
                  >
                    Open Scanner
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {activeStep.questions.map((q) => {
                  const val = answers[q.id];

                  if (q.type === 'boolean') {
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-white block cursor-pointer">
                            {q.label}
                          </label>
                          {q.description && (
                            <p className="text-xs text-zinc-400">{q.description}</p>
                          )}
                          {q.citation && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono text-[#c8f135] border border-white/5">
                              {q.citation}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateAnswer(q.id, true)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition",
                              val === true
                                ? "bg-[#c8f135] text-black shadow-md shadow-[#c8f135]/10"
                                : "bg-white/5 text-zinc-400 hover:text-white"
                            )}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAnswer(q.id, false)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition",
                              val === false
                                ? "bg-white/20 text-white"
                                : "bg-white/5 text-zinc-400 hover:text-white"
                            )}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (q.type === 'number') {
                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-white">{q.label}</label>
                          {q.citation && (
                            <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono text-[#c8f135] border border-white/5">
                              {q.citation}
                            </span>
                          )}
                        </div>
                        {q.description && <p className="text-xs text-zinc-400">{q.description}</p>}
                        <input
                          type="number"
                          value={val ?? ''}
                          onChange={(e) => updateAnswer(q.id, Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c8f135]"
                        />
                      </div>
                    );
                  }

                  // Default text input
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <label className="text-sm font-semibold text-white">{q.label}</label>
                      {q.description && <p className="text-xs text-zinc-400">{q.description}</p>}
                      <input
                        type="text"
                        value={val ?? ''}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        placeholder="e.g. privacy@example.com"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c8f135]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-[#c8f135] hover:bg-[#b8e125] text-black font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#c8f135]/10"
                >
                  {currentStep === EXPANDED_STEPS.length - 2 ? (
                    <>
                      Verify Compliance
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Live Site Cookie Scanner Modal */}
      <CookieScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        siteUrl={site?.url || ''}
        currentCookies={scannedCookies}
        onApplyCookies={handleApplyCookies}
      />
    </div>
  );
}
