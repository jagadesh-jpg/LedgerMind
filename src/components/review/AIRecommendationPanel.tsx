import React from 'react';
import { Card } from '../common/Card';
import { AIRecommendation } from '../../types/review';
import { Sparkles, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIRecommendationPanelProps {
  recommendation: AIRecommendation;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  recommendation,
}) => {
  const isHighRisk = recommendation.guidanceRiskLevel === 'high';
  const isMedRisk = recommendation.guidanceRiskLevel === 'medium';

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A2640] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              AI Recommendation & Resolution Guidance
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Decision Support
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized guidance based on deterministic invoice variance and historical precedents
          </p>
        </div>

        {/* Confidence Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Confidence:</span>
          <span className="font-mono text-sm font-bold text-teal-300 px-2.5 py-0.5 rounded-lg bg-teal-500/15 border border-teal-500/30">
            {recommendation.confidencePercentage}%
          </span>
        </div>
      </div>

      {/* Suggested Action Bar */}
      <div className="mt-4 p-4 rounded-xl bg-[#141E34] border border-[#223554] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Suggested Action</span>
          <p className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full inline-block',
                isHighRisk ? 'bg-rose-400' : isMedRisk ? 'bg-amber-400' : 'bg-emerald-400'
              )}
            />
            {recommendation.suggestedAction}
          </p>
        </div>
        <div className="text-xs text-right sm:text-right">
          <span className="text-slate-400 block text-[11px]">Risk Assessment</span>
          <span
            className={cn(
              'font-semibold uppercase text-xs font-mono',
              isHighRisk ? 'text-rose-400' : isMedRisk ? 'text-amber-400' : 'text-emerald-400'
            )}
          >
            {recommendation.guidanceRiskLevel} risk
          </span>
        </div>
      </div>

      {/* Plain English Explanation */}
      <div className="mt-4 p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          Executive Explanation
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {recommendation.summaryExplanation}
        </p>
      </div>

      {/* Supporting Facts & Precedents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Supporting Facts */}
        <div className="p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Supporting Invoice Facts</span>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {recommendation.supportingFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Historical References */}
        <div className="p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Memory Precedents Referenced</span>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {recommendation.historicalPrecedents.map((prec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                <span className="italic">{prec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Human Decision Mandate Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-[#0C1220] border border-[#1C2C4A] flex items-center gap-2 text-[11px] text-slate-400">
        <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          Non-autonomous boundary: Recommendations never execute disbursements. A certified finance reviewer must record the decision.
        </span>
      </div>
    </Card>
  );
};

