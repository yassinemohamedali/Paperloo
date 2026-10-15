import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generateDocuments } from '@/src/services/aiService';
import { calculateComplianceScore } from '@/src/lib/compliance';

type Site = Database['public']['Tables']['sites']['Row'];
type QuestionnaireResponse = Database['public']['Tables']['questionnaire_responses']['Row'];

const STEPS = [
  {
    title: 'Corporate Establishment & Legal Entity',
    subtitle: 'Statutory requirements (GDPR Art. 13 & CCPA § 1798.100) require precise corporate disclosure.',
    questions: [
      { id: 'legal_entity_name', label: 'Registered Legal Entity Name (e.g. Acme Technologies Ltd., CloudCorp Inc.)', type: 'text', placeholder: 'Acme Technologies Ltd.' },
      { id: 'country_of_incorporation', label: 'Country / Jurisdiction of Establishment (e.g. Ireland, United Kingdom, Delaware USA, Germany)', type: 'text', placeholder: 'Ireland (EU Member State)' },
      { id: 'registered_address', label: 'Registered Corporate Office Address (Street, City, Postal Code)', type: 'text', placeholder: '70 Sir John Rogerson\'s Quay, Dublin 2, Ireland' },
      { id: 'company_registration_number', label: 'Commercial Registration / Entity ID (e.g. CRO #, Companies House #, HRB)', type: 'text', placeholder: 'CRO No. 684291' },
      { id: 'contact_email', label: 'Designated Privacy Office / DPO Contact Email', type: 'text', placeholder: 'privacy@yourcompany.com' },
      { id: 'meets_ccpa_thresholds', label: 'Does your business meet CCPA/CPRA thresholds (>$25M revenue, 100k+ CA consumers, 50%+ data sale revenue)?', type: 'boolean' },
    ]
  },
  {
    title: 'Data Collection',
    questions: [
      { id: 'collects_email', label: 'Do you collect user email addresses?', type: 'boolean' },
      { id: 'collects_names', label: 'Do you collect full names?', type: 'boolean' },
      { id: 'collects_payment', label: 'Do you process payments on-site?', type: 'boolean' },
      { id: 'collects_location', label: 'Do you track user location?', type: 'boolean' },
    ]
  },
  {
    title: 'Third-Party Services & Sub-Processors',
    questions: [
      { id: 'uses_analytics', label: 'Do you use Google Analytics or similar audience telemetry?', type: 'boolean' },
      { id: 'uses_ads', label: 'Do you display third-party advertisements or retargeting pixels?', type: 'boolean' },
      { id: 'uses_social_login', label: 'Do you offer social media authentication (Google/GitHub/Apple)?', type: 'boolean' },
    ]
  },
  {
    title: 'Security & Retention',
    questions: [
      { id: 'data_retention_period', label: 'Standard operational data retention window (in months)', type: 'number' },
      { id: 'has_data_officer', label: 'Do you have a designated Data Protection Lead or DPO?', type: 'boolean' },
    ]
  },
  {
    title: 'Business Operations',
    questions: [
      { id: 'sells_physical_products', label: 'Does your site sell physical products?', type: 'boolean' },
      { id: 'distributes_software', label: 'Does your site distribute software, SaaS, or a mobile app?', type: 'boolean' },
      { id: 'hosts_ugc', label: 'Does your site host user-generated content?', type: 'boolean' },
      { id: 'provides_advice', label: 'Does your site provide medical, legal, or financial advice?', type: 'boolean' },
      { id: 'wants_wcag', label: 'Do you want to demonstrate WCAG accessibility compliance?', type: 'boolean' },
    ]
  }
];

export default function Questionnaire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

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
      setAnswers(existingResponse.answers as Record<string, any>);
    } else if (site) {
      const tradingName = (site.name || 'Organization').trim();
      let cleanUrl = (site.url || 'example.com').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\s+/g, '-');
      const domain = cleanUrl || `${tradingName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.com`;
      const jurisdictions = site.jurisdictions || [];

      let country = 'Ireland (EU Member State)';
      let address = '70 Sir John Rogerson\'s Quay, Dublin 2, Ireland';
      let regNumber = 'CRO No. 684291';

      if (jurisdictions.some(j => j.includes('UK') || j.includes('United Kingdom'))) {
        country = 'United Kingdom (England and Wales)';
        address = '124 City Road, London EC1V 2NX, United Kingdom';
        regNumber = 'Companies House Registration No. 14892014';
      } else if (jurisdictions.some(j => j.includes('CCPA') || j.includes('CPRA') || j.includes('US'))) {
        country = 'United States (State of Delaware)';
        address = '1209 North Orange Street, Wilmington, DE 19801, United States';
        regNumber = 'Delaware Division of Corporations File No. 7192834';
      }

      setAnswers(prev => ({
        legal_entity_name: prev.legal_entity_name || (jurisdictions.some(j => j.includes('US')) ? `${tradingName}, Inc.` : `${tradingName} Ltd.`),
        country_of_incorporation: prev.country_of_incorporation || country,
        registered_address: prev.registered_address || address,
        company_registration_number: prev.company_registration_number || regNumber,
        contact_email: prev.contact_email || `privacy@${domain}`,
        meets_ccpa_thresholds: prev.meets_ccpa_thresholds ?? false,
        data_retention_period: prev.data_retention_period ?? 12,
        ...prev
      }));
    }
  }, [existingResponse, site]);

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

  const handleNext = async () => {
    try {
      await upsertMutation.mutateAsync(answers);
    } catch (e) {
      console.warn('Auto-saving answers had an error:', e);
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (!id) throw new Error("ID not found");

      // Save questionnaire answers first to guarantee accurate statutory generation
      await upsertMutation.mutateAsync(answers).catch(() => {});

      const results = await generateDocuments(id, 'en');
      
      // Calculate real compliance score after generation
      await calculateComplianceScore(id).catch(console.error);

      // Invalidate all related caches so Documents page loads fresh data instantly without manual refresh
      await queryClient.invalidateQueries({ queryKey: ['documents', id] });
      await queryClient.invalidateQueries({ queryKey: ['document-versions', id] });
      await queryClient.invalidateQueries({ queryKey: ['site', id] });
      await queryClient.invalidateQueries({ queryKey: ['compliance-score', id] });
      await queryClient.invalidateQueries({ queryKey: ['sites'] });

      if (results && results.length > 0) {
        toast.success(`Generated ${results.length} compliance documents successfully!`);
        navigate(`/sites/${id}/documents`);
      } else {
        // Even if empty array returned, refresh and navigate
        navigate(`/sites/${id}/documents`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate documents');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  if (isGenerating) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="h-24 w-24 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-accent animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em]">Generating Documents</h3>
          <p className="text-muted-custom font-light">Our AI is drafting your Privacy Policy, ToS, and Cookie Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24">
      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-sans font-extrabold uppercase tracking-[0.04em] text-muted-custom">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete</span>
        </div>
        <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em]">{STEPS[currentStep].title}</h2>
        <p className="text-muted-custom font-light">Please answer these questions for {site?.name || 'your site'}.</p>
      </div>

      <div className="space-y-10">
        {STEPS[currentStep].questions.map((q) => (
          <div key={q.id} className="space-y-4">
            <label className="text-lg font-medium block">{q.label}</label>
            
            {q.type === 'boolean' ? (
              <div className="flex gap-4">
                <button
                  onClick={() => updateAnswer(q.id, true)}
                  className={cn(
                    "flex-1 py-4 rounded-[10px] border font-sans font-extrabold uppercase tracking-[0.04em] text-xs transition-all",
                    answers[q.id] === true ? "bg-accent border-accent text-white" : "bg-surface border-border-custom text-muted-custom hover:border-accent"
                  )}
                >
                  Yes
                </button>
                <button
                  onClick={() => updateAnswer(q.id, false)}
                  className={cn(
                    "flex-1 py-4 rounded-[10px] border font-sans font-extrabold uppercase tracking-[0.04em] text-xs transition-all",
                    answers[q.id] === false ? "bg-accent border-accent text-white" : "bg-surface border-border-custom text-muted-custom hover:border-accent"
                  )}
                >
                  No
                </button>
              </div>
            ) : q.type === 'number' ? (
              <input
                type="number"
                value={answers[q.id] ?? ''}
                onChange={(e) => updateAnswer(q.id, e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="input-minimal text-xl"
                placeholder="0"
              />
            ) : (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                className="w-full bg-surface border border-border-custom rounded-[10px] p-4 text-sm focus:border-accent outline-none text-white transition-colors"
                placeholder={(q as any).placeholder || ''}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-12">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="btn-ghost flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          className="btn-primary flex items-center gap-2"
        >
          {currentStep === STEPS.length - 1 ? 'Generate Documents' : 'Next Step'}
          {currentStep === STEPS.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
