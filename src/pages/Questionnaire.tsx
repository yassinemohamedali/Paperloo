import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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
    title: 'Data Collection',
    questions: [
      { id: 'collects_email', label: 'Do you collect user email addresses?', type: 'boolean' },
      { id: 'collects_names', label: 'Do you collect full names?', type: 'boolean' },
      { id: 'collects_payment', label: 'Do you process payments on-site?', type: 'boolean' },
      { id: 'collects_location', label: 'Do you track user location?', type: 'boolean' },
    ]
  },
  {
    title: 'Third-Party Services',
    questions: [
      { id: 'uses_analytics', label: 'Do you use Google Analytics or similar?', type: 'boolean' },
      { id: 'uses_ads', label: 'Do you display third-party advertisements?', type: 'boolean' },
      { id: 'uses_social_login', label: 'Do you offer social media login?', type: 'boolean' },
    ]
  },
  {
    title: 'Security & Retention',
    questions: [
      { id: 'data_retention_period', label: 'How long do you retain user data (in months)?', type: 'number' },
      { id: 'has_data_officer', label: 'Do you have a designated Data Protection Officer?', type: 'boolean' },
    ]
  },
  {
    title: 'Business Operations',
    questions: [
      { id: 'sells_physical_products', label: 'Does your site sell physical products?', type: 'boolean' },
      { id: 'distributes_software', label: 'Does your site distribute software or an app?', type: 'boolean' },
      { id: 'hosts_ugc', label: 'Does your site host user-generated content?', type: 'boolean' },
      { id: 'provides_advice', label: 'Does your site provide medical, legal, or financial advice?', type: 'boolean' },
      { id: 'wants_wcag', label: 'Do you want to demonstrate WCAG accessibility compliance?', type: 'boolean' },
    ]
  }
];

export default function Questionnaire() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleNext = () => {
    upsertMutation.mutate(answers);
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

      const results = await generateDocuments(id, 'en');
      
      // Calculate real compliance score after generation
      await calculateComplianceScore(id);

      if (results && results.length > 0) {
        toast.success(`Generated ${results.length} documents successfully!`);
        navigate(`/sites/${id}/documents`);
      } else {
        toast.error('AI generation started but no documents were saved. Check your Groq API key and try again.');
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
            ) : (
              <input
                type="number"
                value={answers[q.id] || ''}
                onChange={(e) => updateAnswer(q.id, parseInt(e.target.value))}
                className="input-minimal text-xl"
                placeholder="0"
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
