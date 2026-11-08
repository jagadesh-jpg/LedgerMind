import React from 'react';
import { Card } from '../common/Card';
import { VendorMemoryRecord } from '../../types/review';
import { BrainCircuit, History, UserCheck, ShieldAlert, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VendorMemoryTrailPanelProps {
  memoryTrail: VendorMemoryRecord[];
  vendorName: string;
}

export const VendorMemoryTrailPanel: React.FC<VendorMemoryTrailPanelProps> = ({
  memoryTrail,
  vendorName,
}) => {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A2640] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-400" />
              Vendor Memory Trail
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              DEMO MEMORY DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical exception precedents and resolution decisions for <span className="text-slate-200 font-medium">{vendorName}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <History className="w-3.5 h-3.5 text-teal-400" />
          <span>{memoryTrail.length} Precedent(s) Indexed</span>
        </div>
      </div>

      {/* Memory Precedents Timeline */}
      <div className="mt-5 space-y-4">
        {memoryTrail.map((record) => {
          const isApproved = record.previousDecision === 'Approved with Justification';
          const isCreditNote = record.previousDecision === 'Credit Note Requested';
          const isRejected = record.previousDecision === 'Rejected';

          return (
            <div
              key={record.id}
              className="p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] hover:border-[#243555] transition-colors space-y-2.5"
            >
              {/* Record Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-teal-400 font-semibold">{record.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-medium">{record.exceptionType}</span>
                  <span className="text-slate-400">•</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border',
                      isApproved
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                        : isCreditNote
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                        : isRejected
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    )}
                  >
                    {record.previousDecision}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{record.decisionDate}</span>
              </div>

              {/* Rationale explanation */}
              <p className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-teal-500/40">
                "{record.decisionRationale}"
              </p>

              {/* Reviewer & Source Reference */}
              <div className="flex items-center justify-between pt-2 border-t border-[#162238] text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Reviewed by <span className="text-slate-300 font-medium">{record.reviewer}</span> ({record.reviewerRole})
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-slate-400">
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Ref: {record.sourceReference}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-[#0B0F19] border border-[#1A2640] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Demo Memory Layer: Hindsight semantic vector connection is planned for Phase 3.</span>
        </div>
        <span className="font-mono text-teal-400">SAMPLE RECORDS</span>
      </div>
    </Card>
  );
};

