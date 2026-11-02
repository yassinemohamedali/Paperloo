import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight, Sparkles, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { ComplianceCheckResult, PreFlightAuditReport } from '@/src/data/complianceChecker';

interface ComplianceCheckStepProps {
  report: PreFlightAuditReport;
  onAutoFix: (action: NonNullable<ComplianceCheckResult['autoFixAction']>) => void;
  onProceedToPublish: () => void;
  onRerunChecks: () => void;
  isGenerating?: boolean;
}

export default function ComplianceCheckStep({
  report,
  onAutoFix,
  onProceedToPublish,
  onRerunChecks,
  isGenerating = false
}: ComplianceCheckStepProps) {
  const { score, passedCount, warningCount, gapCount, readyToPublish, checks } = report;

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto">
      
      {/* Overview Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        gapCount > 0 
          ? 'bg-rose-500/10 border-rose-500/30' 
          : warningCount > 0
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-[#c8f135]/10 border-[#c8f135]/30'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${
              gapCount > 0 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                : warningCount > 0
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-[#c8f135]/20 text-[#c8f135] border border-[#c8f135]/40'
            }`}>
              {score}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Policy Checklist</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  readyToPublish 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {readyToPublish ? 'Ready to Generate' : `${gapCount} issue to fix`}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Quick check to make sure your answers match your legal documents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onRerunChecks}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              Re-check
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10 text-center">
          <div className="p-2.5 rounded-xl bg-black/20">
            <div className="text-lg font-bold text-emerald-400">{passedCount}</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Passed</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/20">
            <div className="text-lg font-bold text-amber-400">{warningCount}</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Suggestions</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/20">
            <div className="text-lg font-bold text-rose-400">{gapCount}</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Needs Fix</div>
          </div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#c8f135]" />
          Checklist Items ({checks.length})
        </h4>

        <div className="space-y-3">
          {checks.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'GAP'
                  ? 'bg-rose-500/[0.04] border-rose-500/30'
                  : item.status === 'WARNING'
                  ? 'bg-amber-500/[0.04] border-amber-500/30'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {item.status === 'PASSED' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {item.status === 'WARNING' && (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  {item.status === 'GAP' && (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'PASSED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.status === 'GAP' ? 'Fix Needed' : item.status === 'WARNING' ? 'Suggestion' : 'Passed'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {item.explanation}
                    </p>

                    {/* Regulatory Reference Citation Card */}
                    <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-[#c8f135] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[#c8f135] font-semibold">{item.guidance.citation}: </span>
                        <span className="text-zinc-400">{item.guidance.summary}</span>
                      </div>
                    </div>

                    {/* Affected Documents Tag */}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                      <span>Used in:</span>
                      {item.affectedDocuments.map((doc, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 font-mono text-zinc-300">
                          {doc.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1-Click Auto Fix Button */}
                {item.autoFixAction && item.status !== 'PASSED' && (
                  <button
                    onClick={() => onAutoFix(item.autoFixAction!)}
                    className="shrink-0 px-3 py-1.5 bg-[#c8f135] hover:bg-[#b8e125] text-black font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-[#c8f135]/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Fix
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="text-xs text-zinc-400">
          {gapCount > 0 ? (
            <span className="text-rose-400 font-semibold">
              Please fix the {gapCount} issue(s) above before generating.
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Everything looks good and ready.
            </span>
          )}
        </div>

        <button
          onClick={onProceedToPublish}
          disabled={gapCount > 0 || isGenerating}
          className="px-6 py-3 bg-[#c8f135] hover:bg-[#b8e125] text-black font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-xl shadow-[#c8f135]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Creating Documents...' : 'Generate Documents'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
