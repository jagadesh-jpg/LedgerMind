import React from 'react';
import { Card } from '../common/Card';
import { RECENT_EVENTS } from '../../data/mockData';
import { FileUp, AlertTriangle, UserCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const eventIconMap = {
  upload: FileUp,
  exception: AlertTriangle,
  review: UserCheck,
  resolution: CheckCircle2,
};

export const ActivityTimeline: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1A2640]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">Audit & Resolution Stream</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
              SAMPLE DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop review trail and exception check history
          </p>
        </div>
      </div>

      <div className="mt-5 relative pl-4 border-l border-[#1A2640] space-y-6">
        {RECENT_EVENTS.map((event) => {
          const Icon = eventIconMap[event.type];
          const isResolution = event.type === 'resolution';
          const isException = event.type === 'exception';

          return (
            <div
              key={event.id}
              onClick={() => navigate(`/invoices/${event.invoiceId}`)}
              className="relative group cursor-pointer"
            >
              {/* Dot indicator */}
              <div
                className={cn(
                  'absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#0B0F19] flex items-center justify-center transition-transform group-hover:scale-125',
                  isResolution
                    ? 'bg-emerald-400'
                    : isException
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                )}
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5 shrink-0',
                      isResolution
                        ? 'text-emerald-400'
                        : isException
                        ? 'text-amber-400'
                        : 'text-teal-400'
                    )}
                  />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors">
                    {event.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {event.timestamp}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 pl-5 group-hover:text-slate-300">
                {event.description}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

