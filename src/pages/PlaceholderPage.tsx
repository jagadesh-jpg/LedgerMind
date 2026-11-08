import React from 'react';
import { Card } from '../components/common/Card';
import { Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  isMemoryInsights?: boolean;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  isMemoryInsights = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
            <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
              Module Placeholder
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
      </div>

      {/* Mandatory Memory Insights Banner if applicable */}
      {isMemoryInsights && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300">
          <BrainCircuit className="w-5 h-5 shrink-0 text-amber-400" />
          <div className="text-sm font-semibold">
            Demo memory preview — Hindsight not connected yet.
          </div>
        </div>
      )}

      {/* Content Canvas Placeholder */}
      <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-14 h-14 rounded-2xl bg-[#17233D] border border-[#23355A] flex items-center justify-center text-teal-400 mb-4 shadow-lg shadow-teal-950/40">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">
          {title} is scheduled for Phase 1B / Phase 2
        </h3>
        <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
          The core UI foundation and navigation shell have been wired up. Real workflows, database queries, and memory agent reasoning will be integrated in subsequent phases.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0E1526] px-3 py-1.5 rounded-lg border border-[#1A2640]">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
          <span>Strict boundary maintained: No synthetic actions or premature backend calls.</span>
        </div>
      </Card>
    </div>
  );
};

