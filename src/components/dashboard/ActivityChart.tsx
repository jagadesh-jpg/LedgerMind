import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../common/Card';
import { ACTIVITY_TRENDS } from '../../data/mockData';
import { TrendingUp } from 'lucide-react';

export const ActivityChart: React.FC = () => {
  const [period, setPeriod] = useState<'7D' | '30D' | '90D'>('7D');
  const data = ACTIVITY_TRENDS[period];

  const totalProcessed = data.reduce((acc, curr) => acc + curr.processed, 0);
  const totalExceptions = data.reduce((acc, curr) => acc + curr.exceptions, 0);

  return (
    <Card className="p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A2640]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">Invoice Activity Trend</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking invoice volume through ingestion vs exceptions detected
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-[#0C1220] p-1 rounded-lg border border-[#1C2C4A]">
          {(['7D', '30D', '90D'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                period === key
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {key === '7D' ? '7 Days' : key === '30D' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-lg bg-[#0E1526] border border-[#192742]">
          <span className="text-[11px] text-slate-400">
            {period === '7D' ? 'Last 7 Days Ingested' : period === '30D' ? 'Last 30 Days Ingested' : '90 Days Ingested'}
          </span>
          <p className="text-lg font-bold text-slate-100 font-sans mt-0.5">{totalProcessed.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0E1526] border border-[#192742]">
          <span className="text-[11px] text-slate-400">
            {period === '7D' ? '7D Flagged Exceptions' : period === '30D' ? '30D Flagged Exceptions' : '90D Flagged Exceptions'}
          </span>
          <p className="text-lg font-bold text-amber-400 font-sans mt-0.5">{totalExceptions.toLocaleString()}</p>
        </div>
        <div className="hidden sm:block p-3 rounded-lg bg-[#0E1526] border border-[#192742]">
          <span className="text-[11px] text-slate-400">Period Straight-Through Rate</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-lg font-bold text-emerald-400 font-sans">
              {((1 - totalExceptions / totalProcessed) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorExceptions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2640" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1A2640' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#121A2D] border border-[#223554] p-3 rounded-lg shadow-xl text-xs space-y-1.5">
                      <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1">{label}</p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-teal-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> Processed:
                        </span>
                        <span className="font-bold text-slate-100 font-mono">{payload[0].value}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Exceptions:
                        </span>
                        <span className="font-bold text-slate-100 font-mono">{payload[1]?.value}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="processed"
              stroke="#14B8A6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProcessed)"
              name="Processed Invoices"
            />
            <Area
              type="monotone"
              dataKey="exceptions"
              stroke="#F59E0B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExceptions)"
              name="Exceptions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

