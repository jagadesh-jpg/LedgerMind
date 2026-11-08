import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { HumanDecisionType, RecordedDecision, RecommendationAction } from '../../types/review';
import { CheckCircle2, Edit3, XCircle, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HumanDecisionDialogProps {
  invoiceId: string;
  suggestedAction: RecommendationAction;
  onDecisionRecorded: (decision: RecordedDecision) => void;
  recordedDecision?: RecordedDecision | null;
}

export const HumanDecisionDialog: React.FC<HumanDecisionDialogProps> = ({
  invoiceId,
  suggestedAction,
  onDecisionRecorded,
  recordedDecision,
}) => {
  const [activeTab, setActiveTab] = useState<HumanDecisionType>('Accept Recommendation');
  const [customAction, setCustomAction] = useState<string>(suggestedAction);
  const [rationaleReason, setRationaleReason] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleActionSelect = (type: HumanDecisionType) => {
    setActiveTab(type);
    setErrorMsg('');
    if (type === 'Accept Recommendation') {
      setCustomAction(suggestedAction);
    } else if (type === 'Reject Recommendation') {
      setCustomAction('Dispute & Return to Vendor');
    }
  };

  const handleInitiateConfirmation = () => {
    if ((activeTab === 'Edit Recommendation' || activeTab === 'Reject Recommendation') && !rationaleReason.trim()) {
      setErrorMsg('A written justification is mandatory when editing or rejecting an AI recommendation.');
      return;
    }
    setErrorMsg('');
    setIsConfirming(true);
  };

  const handleConfirmAndRecord = () => {
    const finalDecision: RecordedDecision = {
      invoiceId,
      decisionType: activeTab,
      actionTaken: customAction,
      rationaleNotes:
        activeTab === 'Accept Recommendation'
          ? rationaleReason.trim() || `Accepted standard recommendation (${suggestedAction}) based on matched documentation.`
          : rationaleReason.trim(),
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedBy: 'Anand Kumar (AP Controller)',
      status: 'Recorded in Local Demo State',
    };

    onDecisionRecorded(finalDecision);
    setIsConfirming(false);
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A2640] gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Human Review Decision Authority
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative decision sign-off. All actions are simulated and recorded in local session state.
          </p>
        </div>

        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#121A2D] text-slate-300 border border-[#1E2D4A]">
          Reviewer: Anand Kumar (AP Lead)
        </span>
      </div>

      {/* Decision Status if already recorded */}
      {recordedDecision ? (
        <div className="mt-4 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-400" />
              Decision Recorded ({recordedDecision.decisionType})
            </span>
            <span className="text-[11px] font-mono text-slate-400">{recordedDecision.recordedAt}</span>
          </div>
          <p className="text-xs text-slate-200">
            <span className="text-slate-400">Action:</span> {recordedDecision.actionTaken}
          </p>
          <p className="text-xs text-slate-300 italic">
            "{recordedDecision.rationaleNotes}"
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] text-teal-400 font-mono">
            <span>{recordedDecision.status}</span>
            <button
              onClick={() => onDecisionRecorded(null as unknown as RecordedDecision)}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              Modify Decision
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Action Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleActionSelect('Accept Recommendation')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
                activeTab === 'Accept Recommendation'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/50 shadow-md shadow-teal-950/40'
                  : 'bg-[#121A2D] text-slate-300 border-[#1E2D4A] hover:bg-[#18233C]'
              )}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Accept Recommendation
            </button>

            <button
              type="button"
              onClick={() => handleActionSelect('Edit Recommendation')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
                activeTab === 'Edit Recommendation'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40'
                  : 'bg-[#121A2D] text-slate-300 border-[#1E2D4A] hover:bg-[#18233C]'
              )}
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              Edit Recommendation
            </button>

            <button
              type="button"
              onClick={() => handleActionSelect('Reject Recommendation')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
                activeTab === 'Reject Recommendation'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950/40'
                  : 'bg-[#121A2D] text-slate-300 border-[#1E2D4A] hover:bg-[#18233C]'
              )}
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              Reject Recommendation
            </button>
          </div>

          {/* Form Fields Based on Tab */}
          <div className="p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] space-y-4">
            {activeTab === 'Accept Recommendation' && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400">Action to Execute:</span>
                <div className="p-2.5 rounded-lg bg-[#141E34] text-xs font-semibold text-slate-200 border border-[#223554]">
                  {suggestedAction}
                </div>
                <div className="mt-2">
                  <label className="text-xs text-slate-400 block mb-1">Optional Reviewer Remarks:</label>
                  <input
                    type="text"
                    value={rationaleReason}
                    onChange={(e) => setRationaleReason(e.target.value)}
                    placeholder="e.g. Verified with steel surcharge addendum on file"
                    className="w-full bg-[#121A2D] text-slate-200 text-xs px-3 py-2 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'Edit Recommendation' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Alternate Action:</label>
                  <select
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    className="w-full bg-[#121A2D] text-slate-200 text-xs px-3 py-2 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500"
                  >
                    <option value="Request Formal Vendor Credit Note">Request Formal Vendor Credit Note</option>
                    <option value="Hold Pending Warehouse Physical Count">Hold Pending Warehouse Physical Count</option>
                    <option value="Approve Partial Payment for Received GRN Quantity">Approve Partial Payment for Received GRN Quantity</option>
                    <option value="Escalate to Chief Financial Officer">Escalate to Chief Financial Officer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-amber-300 block mb-1 font-medium">
                    Mandatory Rationale Reason: *
                  </label>
                  <textarea
                    rows={3}
                    value={rationaleReason}
                    onChange={(e) => setRationaleReason(e.target.value)}
                    placeholder="Provide specific business justification for overriding the AI recommendation..."
                    className="w-full bg-[#121A2D] text-slate-200 text-xs p-3 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'Reject Recommendation' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  Rejecting this recommendation flags the invoice as formally disputed.
                </div>
                <div>
                  <label className="text-xs text-rose-300 block mb-1 font-medium">
                    Mandatory Rejection Reason: *
                  </label>
                  <textarea
                    rows={3}
                    value={rationaleReason}
                    onChange={(e) => setRationaleReason(e.target.value)}
                    placeholder="Specify why this recommendation is disputed or returned to the supplier..."
                    className="w-full bg-[#121A2D] text-slate-200 text-xs p-3 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleInitiateConfirmation}
                className="w-full sm:w-auto"
              >
                Proceed to Confirmation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Step Dialog Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#121A2D] border border-[#223554] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Confirm Demo Human Decision
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to record the following review action for invoice <span className="font-mono text-teal-300 font-bold">{invoiceId}</span>:
            </p>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1A2640] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Decision Mode:</span>
                <span className="font-semibold text-slate-200">{activeTab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className="font-semibold text-teal-300">{customAction}</span>
              </div>
              {rationaleReason && (
                <div className="pt-2 border-t border-[#162238]">
                  <span className="text-slate-400 block text-[11px] mb-1">Reason:</span>
                  <p className="text-slate-200 italic">"{rationaleReason}"</p>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300">
              Simulated demonstration mode: No live payments, bank transfers, or automated ERP ledger postings are triggered.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsConfirming(false)}>
                Back to Edit
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmAndRecord}>
                Confirm & Record Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

