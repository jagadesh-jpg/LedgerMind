import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getMemoryInsightsData, LearnedRule } from '../data/memoryInsightsData';
import { fetchInsights } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const MemoryInsightsPage: React.FC = () => {
  const fallbackData = getMemoryInsightsData();
  const [insightsMode, setInsightsMode] = useState<'measured' | 'demo'>('demo');
  const [measuredData, setMeasuredData] = useState<any | null>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchInsights();
        if (res && res.mode === 'measured' && res.data) {
          setInsightsMode('measured');
          setMeasuredData(res.data);
        }
      } catch {
        setInsightsMode('demo');
      }
    }
    load();
  }, []);

  const weeklyChartData =
    insightsMode === 'measured' && measuredData?.weekly_acceptance
      ? measuredData.weekly_acceptance
      : fallbackData.weeklyAcceptance;

  const statTiles = [
    {
      label: 'Recommendations Accepted As Is',
      value:
        insightsMode === 'measured' && measuredData?.conditions?.recall_reflect
          ? `${measuredData.conditions.recall_reflect.accepted_as_is}%`
          : '84%',
      subtext: 'Up from 31% in week 1',
      trend: '+53% overall',
      isPositive: true,
    },
    {
      label: 'Same Invoices Without Memory',
      value:
        insightsMode === 'measured' && measuredData?.conditions?.no_memory
          ? `${measuredData.conditions.no_memory.accepted_as_is}%`
          : '31%',
      subtext: 'Baseline rule-only match rate',
      trend: 'Static baseline',
      isPositive: false,
    },
    {
      label: 'Decisions Remembered',
      value:
        insightsMode === 'measured' && measuredData?.stream_count
          ? `${measuredData.stream_count}`
          : '412',
      subtext: 'Across 15 strategic vendors',
      trend: '15 vendors indexed',
      isPositive: true,
    },
    {
      label: 'Wrong Approvals',
      value:
        insightsMode === 'measured' && measuredData?.conditions?.recall_reflect
          ? `${measuredData.conditions.recall_reflect.false_approval_rate}%`
          : '0',
      subtext: 'Guarded by human oversight',
      trend: '100% zero-breach',
      isPositive: true,
    },
  ];

  const getPatternBadge = (strength: LearnedRule['patternStrength']) => {
    switch (strength) {
      case 'strong':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/40 text-emerald-300 border border-emerald-500/40">
            Strong Pattern
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-950/40 text-teal-300 border border-teal-500/40">
            Moderate Pattern
          </span>
        );
      case 'early':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-950/40 text-amber-300 border border-amber-500/40">
            Early Pattern
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Title & Measured / Demo Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-teal-400" />
              Memory Insights
            </h1>
            {insightsMode === 'measured' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Measured ({measuredData?.agent_mode || 'heuristic'}) on {measuredData?.stream_count || 200} synthetic invoices (simulated reviewer), {new Date(measuredData?.generated_at || Date.now()).toLocaleDateString()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Illustrative demo data, not measured results
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Analyzing AP exception resolution patterns, memory precision curves, and human-in-the-loop governance
          </p>
        </div>
      </div>

      {/* 2. Four Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statTiles.map((stat, idx) => (
          <Card key={idx} className="p-5 hover:border-[#2E436E] transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {stat.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#18243C] border border-[#22355A] flex items-center justify-center text-teal-400">
                {idx === 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {idx === 1 && <Layers className="w-4 h-4 text-slate-400" />}
                {idx === 2 && <BrainCircuit className="w-4 h-4 text-teal-400" />}
                {idx === 3 && <ShieldCheck className="w-4 h-4 text-teal-400" />}
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold font-sans text-slate-100">{stat.value}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{stat.subtext}</span>
              {stat.trend && (
                <span
                  className={cn(
                    'font-mono text-[11px] font-semibold',
                    stat.isPositive ? 'text-emerald-400' : 'text-slate-400'
                  )}
                >
                  {stat.trend}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Grouped Bar Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A2640] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Weekly Recommendation Acceptance Rate (Weeks 1 – 8)
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {insightsMode === 'measured' ? 'Measured Evaluation Curve' : 'Precision Curve'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparing human reviewer acceptance rates: With Memory (learning from past approvals) vs. Without Memory (static baseline)
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Axis: Acceptance Rate Percentage (%)
          </div>
        </div>

        <div
          className="h-72 w-full mt-4"
          aria-label="Grouped bar chart showing weekly recommendation acceptance rate over 8 weeks comparing with memory versus without memory"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyChartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              barCategoryGap="20%"
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2640" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#1A2640' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#121A2D] border border-[#223554] p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                        <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1">{label}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-teal-300 flex items-center gap-1.5 font-medium">
                            <span className="w-2.5 h-2.5 rounded-sm bg-teal-400 inline-block" />
                            With Memory:
                          </span>
                          <span className="font-bold text-slate-100 font-mono">{payload[0].value}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
                            Without Memory:
                          </span>
                          <span className="font-bold text-slate-300 font-mono">{payload[1]?.value}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                formatter={(val) => <span className="text-slate-300 text-xs ml-1">{val}</span>}
              />
              <Bar
                name="With Memory"
                dataKey="withMemory"
                fill="#14B8A6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Without Memory"
                dataKey="withoutMemory"
                fill="#475569"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. "Learned This Week" List (3 Rules) & 5. "Needs a Human Check" Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Learned this week */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1A2640]">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Learned This Week
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous memory synthesis based on recurring human-reviewed resolutions
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#141E34] text-teal-300 rounded border border-[#223554]">
                  {fallbackData.learnedRules.length} Active Rules
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {fallbackData.learnedRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] hover:border-[#243555] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{rule.title}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-teal-400 font-medium">{rule.vendor}</span>
                      </div>
                      {getPatternBadge(rule.patternStrength)}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rule.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#162238] text-[11px] text-slate-400">
                      <span>Based on <strong className="text-slate-200 font-mono">{rule.casesCount}</strong> verified reviewer cases</span>
                      <span className="font-mono text-slate-500">{rule.learnedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1A2640] flex items-center justify-between text-xs text-slate-400">
              <span>All learned rules are verified against prior invoice decisions</span>
              <span className="font-mono text-teal-400">Hindsight Memory Layer Active</span>
            </div>
          </Card>
        </div>

        {/* Needs a human check card */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between border-amber-500/30 bg-gradient-to-b from-[#162036] to-[#101726]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1A2640]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-semibold text-slate-100">
                    Needs a Human Check
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Conflict Detected
                </span>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">{fallbackData.conflictingAlert.vendor}</span>
                  <span className="text-[11px] font-mono text-slate-400">{fallbackData.conflictingAlert.id}</span>
                </div>
                <h4 className="text-xs font-medium text-amber-300">
                  {fallbackData.conflictingAlert.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fallbackData.conflictingAlert.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#162238] text-xs">
                  <div className="p-2 rounded-lg bg-[#141E34] border border-[#223554] text-slate-300">
                    <span className="text-teal-400 font-semibold block text-[11px] mb-0.5">Precedent A</span>
                    {fallbackData.conflictingAlert.ruleA}
                  </div>
                  <div className="p-2 rounded-lg bg-[#141E34] border border-[#223554] text-slate-300">
                    <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">Precedent B</span>
                    {fallbackData.conflictingAlert.ruleB}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1A2640] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Impacts <strong className="text-slate-200">{fallbackData.conflictingAlert.impactedInvoicesCount}</strong> incoming invoices</span>
                <span className="font-mono text-amber-300">Requires Senior Review</span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setConflictModalOpen(true)}
                className="w-full flex items-center justify-center gap-2"
              >
                Review the Conflict
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Conflict Review Modal */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#121A2D] border border-[#223554] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2640] pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Resolve Rule Conflict: {fallbackData.conflictingAlert.vendor}
              </h3>
              <button
                onClick={() => setConflictModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Two historical precedents provide contradictory instructions for backordered panels under ₹1,50,000. Select which standard policy should take precedence:
            </p>

            <div className="space-y-3">
              <label
                onClick={() => setConflictResolved(false)}
                className="p-3.5 rounded-xl bg-[#0E1526] border border-[#1A2640] hover:border-teal-500/50 cursor-pointer block transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-300">Adopt Policy A (Standard Vendor Credit Note)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">Recommended</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Approve payment for received GRN count; request credit note from Schneider Electric for the remaining 10 units.
                </p>
              </label>

              <label
                onClick={() => setConflictResolved(false)}
                className="p-3.5 rounded-xl bg-[#0E1526] border border-[#1A2640] hover:border-amber-500/50 cursor-pointer block transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300">Adopt Policy B (Hold Complete Payment)</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Place payment hold on the entire invoice until warehouse signs off on backorder fulfillment.
                </p>
              </label>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0F19] border border-[#1A2640] flex items-center gap-2 text-[11px] text-slate-400">
              <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Simulated resolution: Once confirmed, the chosen policy becomes the active precedent in memory.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConflictModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setConflictResolved(true);
                  setConflictModalOpen(false);
                }}
              >
                Confirm Policy Precedence
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      {conflictResolved && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs text-teal-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Policy conflict for Schneider Electric marked resolved in demo memory. Incoming invoices will default to Policy A.</span>
          </div>
          <button
            onClick={() => setConflictResolved(false)}
            className="text-slate-400 hover:text-slate-200 underline font-mono text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
