import React from 'react';
import { Card } from '../common/Card';
import { EXCEPTION_BREAKDOWN } from '../../data/mockData';
import { formatINR } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

export const ExceptionBreakdown: React.FC = () => {
  const totalExceptions = EXCEPTION_BREAKDOWN.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2640]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">Exception Categories</h3>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active variance breakdown across {totalExceptions} flagged invoices
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
            {totalExceptions} Items
          </span>
        </div>

        {/* Categories Bar & List */}
        <div className="mt-5 space-y-4">
          {EXCEPTION_BREAKDOWN.map((item) => {
            const barColor =
              item.severity === 'high'
                ? 'bg-rose-500'
                : item.severity === 'medium'
                ? 'bg-amber-500'
                : 'bg-teal-500';

            return (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-200 group-hover:text-teal-300 transition-colors">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {formatINR(item.amountImpacted)}
                    </span>
                    <span className="font-semibold text-slate-100 w-8 text-right font-mono">
                      {item.count}
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full h-2 rounded-full bg-[#0E1526] overflow-hidden border border-[#1A2640]">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#1A2640] flex items-center justify-between text-xs text-slate-400">
        <span>Highest impact: Unit Price Mismatch</span>
        <span className="font-mono text-teal-400">36.8% of total</span>
      </div>
    </Card>
  );
};

