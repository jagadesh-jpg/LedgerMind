import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArrowLeft, AlertTriangle, AlertCircle, Building, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { MOCK_INVOICES } from '../data/mockData';
import { getReviewDatasetForInvoice } from '../data/reviewData';
import { formatINR } from '../lib/utils';
import { Invoice } from '../types';
import { RecordedDecision } from '../types/review';
import { InvoiceFactsPanel } from '../components/review/InvoiceFactsPanel';
import { VendorMemoryTrailPanel } from '../components/review/VendorMemoryTrailPanel';
import { AIRecommendationPanel } from '../components/review/AIRecommendationPanel';
import { HumanDecisionDialog } from '../components/review/HumanDecisionDialog';

export const InvoiceDetailsPlaceholder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [recordedDecision, setRecordedDecision] = useState<RecordedDecision | null>(null);

  // Find invoice from passed state or exact ID match in mock data
  const passedInvoice = (location.state as { invoice?: Invoice })?.invoice;
  const invoice: Invoice | undefined =
    passedInvoice && passedInvoice.id === id
      ? passedInvoice
      : MOCK_INVOICES.find((i) => i.id === id);

  // If ID is not found, display a proper "Invoice not found" state without silently displaying another invoice
  if (!invoice) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Overview
        </Button>

        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Invoice Not Found</h2>
          <p className="text-sm text-slate-400 max-w-md mt-2">
            No record matching identifier <span className="font-mono text-slate-200 font-semibold">{id}</span> could be located in the current workspace dataset.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => navigate('/')}>
              Return to Overview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Load the deterministic 3-way match, memory trail, and AI recommendation dataset
  const reviewData = getReviewDatasetForInvoice(
    invoice.id,
    invoice.vendor,
    invoice.poNumber,
    invoice.amount
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Overview
          </Button>
          <span className="text-xs font-mono text-slate-400 bg-[#121A2D] px-2.5 py-1 rounded border border-[#1E2D4A]">
            Invoice Review Workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          {recordedDecision ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Decision Recorded: {recordedDecision.actionTaken}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              Human Decision Pending
            </span>
          )}
        </div>
      </div>

      {/* Invoice Summary Banner */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1A2640]">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono text-slate-100">
                {invoice.id}
              </h1>
              <Badge variant="status" status={invoice.status}>
                {invoice.status}
              </Badge>
              {invoice.exception !== 'None' && (
                <Badge variant="exception" exception={invoice.exception}>
                  {invoice.exception}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-slate-200 font-medium">{invoice.vendor}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{invoice.vendorCategory}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#0E1526] border border-[#1A2640] text-right">
              <span className="text-slate-400 block text-[10px] uppercase">Total Invoiced Amount</span>
              <span className="text-base font-bold text-slate-100">{formatINR(invoice.amount)}</span>
            </div>
          </div>
        </div>

        {/* Quick Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-[#0E1526] border border-[#162238]">
            <span className="text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-500" /> Purchase Order
            </span>
            <p className="font-mono text-teal-300 font-semibold mt-1">{invoice.poNumber}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1526] border border-[#162238]">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Invoice Date
            </span>
            <p className="text-slate-200 font-medium mt-1">{invoice.invoiceDate}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1526] border border-[#162238]">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Due Date
            </span>
            <p className="text-slate-200 font-medium mt-1">{invoice.dueDate}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0E1526] border border-[#162238]">
            <span className="text-slate-400">OCR Confidence</span>
            <p className="font-mono text-teal-300 font-semibold mt-1">
              {(invoice.confidenceScore * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </Card>

      {/* 1. Invoice Facts Panel (3-Way Match Reconciler) */}
      <InvoiceFactsPanel
        lineItems={reviewData.lineItems}
        poReference={reviewData.poReference}
        grnReference={reviewData.grnReference}
        supplierGstin={reviewData.supplierGstin}
      />

      {/* 2. Vendor Memory Trail Panel */}
      <VendorMemoryTrailPanel
        memoryTrail={reviewData.memoryTrail}
        vendorName={invoice.vendor}
      />

      {/* 3. AI Recommendation Panel */}
      <AIRecommendationPanel recommendation={reviewData.aiRecommendation} />

      {/* 4. Human Decision Dialog */}
      <HumanDecisionDialog
        invoiceId={invoice.id}
        suggestedAction={reviewData.aiRecommendation.suggestedAction}
        onDecisionRecorded={(dec) => setRecordedDecision(dec)}
        recordedDecision={recordedDecision}
      />
    </div>
  );
};
