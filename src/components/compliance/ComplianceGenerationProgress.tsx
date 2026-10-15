import React, { useState, useEffect } from 'react';
import { Shield, Check, Loader2, Sparkles, FileCheck, Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const GENERATION_PHASES = [
  {
    step: 1,
    title: 'Analyzing Data Collection Points',
    description: 'Evaluating telemetry, third-party analytics cookies, and data retention parameters.',
    icon: Layers,
  },
  {
    step: 2,
    title: 'Mapping Regional Privacy Clauses',
    description: 'Matching statutory obligations across GDPR Article 13, CCPA/CPRA, and PIPEDA frameworks.',
    icon: Shield,
  },
  {
    step: 3,
    title: 'Building Output Framework',
    description: 'Compiling legal frameworks and verifying regional compliance parameters...',
    icon: FileCheck,
  },
];

export function ComplianceGenerationProgress({ siteName }: { siteName?: string }) {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(2), 2200);
    const timer2 = setTimeout(() => setActiveStep(3), 4800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-6 flex flex-col items-center">
      {/* Enterprise Status Shield */}
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/30">
          <Shield className="h-8 w-8 stroke-[1.75]" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
          <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
        </div>
      </div>

      {/* Main Copy */}
      <div className="text-center space-y-2 mb-8 max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Compiling Legal Frameworks
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
          {siteName ? `Verifying regional compliance parameters for ${siteName}.` : 'Compiling legal frameworks and verifying regional compliance parameters...'}
        </p>
      </div>

      {/* Step-based progress indicators */}
      <div className="w-full space-y-3 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        {GENERATION_PHASES.map((phase) => {
          const isCompleted = activeStep > phase.step;
          const isCurrent = activeStep === phase.step;
          const isPending = activeStep < phase.step;
          const Icon = phase.icon;

          return (
            <div
              key={phase.step}
              className={cn(
                "flex items-start gap-3.5 p-3.5 rounded-lg border transition-all duration-300",
                isCurrent 
                  ? "bg-slate-800/80 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/10" 
                  : isCompleted 
                    ? "bg-slate-900/40 border-slate-800/60 opacity-80" 
                    : "bg-transparent border-transparent opacity-40"
              )}
            >
              {/* Step indicator icon */}
              <div className={cn(
                "h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center border transition-all mt-0.5",
                isCompleted 
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                  : isCurrent 
                    ? "bg-emerald-500 border-emerald-500 text-white animate-pulse" 
                    : "bg-slate-800 border-slate-700 text-slate-500"
              )}>
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="text-[10px] font-bold">{phase.step}</span>
                )}
              </div>

              {/* Step text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-xs font-semibold tracking-tight",
                    isCurrent ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-400"
                  )}>
                    {phase.title}
                  </h3>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded",
                    isCompleted 
                      ? "text-emerald-400 bg-emerald-500/10" 
                      : isCurrent 
                        ? "text-emerald-300 bg-emerald-500/20" 
                        : "text-slate-500"
                  )}>
                    {isCompleted ? 'Verified' : isCurrent ? 'Active' : 'Queued'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress line */}
      <div className="w-full mt-6 space-y-2">
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>Active Verification Phase</span>
          <span>{activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '95%'} Complete</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '95%' }}
          />
        </div>
      </div>
    </div>
  );
}
