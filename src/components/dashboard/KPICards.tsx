import React from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../common/Card';
import { MOCK_KPIS } from '../../data/mockData';
import { cn } from '../../lib/utils';

const iconMap = {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
};

export const KPICards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {MOCK_KPIS.map((kpi, idx) => {
        const Icon = iconMap[kpi.iconName];
        const isAlert = kpi.iconName === 'AlertTriangle';

        return (
          <Card
            key={kpi.title}
            className={cn(
              'p-5 relative overflow-hidden group hover:border-[#2E436E] transition-all duration-300',
              idx === 2 ? 'border-amber-500/20 bg-gradient-to-br from-[#131B2E] to-[#181D2E]' : ''
            )}
          >
            {/* Ambient accent highlight */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none group-hover:bg-teal-500/10 transition-colors" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                {kpi.title}
              </span>
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center border transition-colors',
                  isAlert
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-[#18243C] border-[#22355A] text-teal-400 group-hover:border-teal-500/40'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 font-sans">
                {kpi.value}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded text-[11px]',
                  kpi.isPositiveChange
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                )}
              >
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {kpi.change}
              </span>
              <span className="text-slate-400 truncate">{kpi.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

