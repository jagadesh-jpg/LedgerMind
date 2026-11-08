import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { MOCK_INVOICES } from '../data/mockData';
import { formatINR } from '../lib/utils';
import { Invoice } from '../types';

export const InvoiceDetailsPlaceholder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Find invoice from route param or fallback to mock data
  const invoice: Invoice | undefined =
    (location.state as { invoice?: Invoice })?.invoice ||
    MOCK_INVOICES.find((i) => i.id === id) ||
    MOCK_INVOICES[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Overview
        </Button>
        <span className="text-xs font-mono text-slate-400 bg-[#121A2D] px-2.5 py-1 rounded border border-[#1E2D4A]">
          Demo Invoice Details Route
        </span>
      </div>

      {/* Main card */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1A2640]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-slate-100">
                {invoice ? invoice.id : id}
              </h1>
              {invoice && (
                <Badge variant="status" status={invoice.status}>
                  {invoice.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Vendor: <span className="text-slate-200 font-medium">{invoice?.vendor}</span> ({invoice?.vendorCategory})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => alert('Demo only — real approval workflows run in future phases')}>
              Approve with Override
            </Button>
            <Button variant="primary" size="sm" onClick={() => alert('Demo only — automated resolution disabled in Phase 1A')}>
              Resolve Exception
            </Button>
          </div>
        </div>

        {/* Invoice breakdown fields */}
        {invoice && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#1A2640]">
              <span className="text-xs text-slate-400">Total Invoiced Amount</span>
              <p className="text-lg font-bold font-mono text-slate-100 mt-1">
                {formatINR(invoice.amount)}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#1A2640]">
              <span className="text-xs text-slate-400">Purchase Order</span>
              <p className="text-lg font-bold font-mono text-teal-400 mt-1">
                {invoice.poNumber}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#1A2640]">
              <span className="text-xs text-slate-400">Invoice Date</span>
              <p className="text-sm font-medium text-slate-200 mt-1">
                {invoice.invoiceDate}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0E1526] border border-[#1A2640]">
              <span className="text-xs text-slate-400">Due Date</span>
              <p className="text-sm font-medium text-slate-200 mt-1">
                {invoice.dueDate}
              </p>
            </div>
          </div>
        )}

        {/* Exception & Notes */}
        <div className="p-4 rounded-xl bg-[#141E34] border border-[#23355A] space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-200">Exception Analysis</h4>
            {invoice && (
              <Badge variant="exception" exception={invoice.exception}>
                {invoice.exception}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {invoice?.notes || 'No variance or discrepancy logged for this transaction.'}
          </p>
        </div>

        {/* Placeholder disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-[#0C1220] border border-[#1C2C4A] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Phase 1A Prototype: Detailed 3-way matching and line item breakdown will be unlocked in Phase 1B.</span>
          </div>
          <span className="font-mono text-teal-400 font-semibold">SAFE BOUNDARY</span>
        </div>
      </Card>
    </div>
  );
};

