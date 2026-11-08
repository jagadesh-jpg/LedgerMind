import React from 'react';
import { Card } from '../common/Card';
import { DocumentItemComparison } from '../../types/review';
import { formatINR } from '../../lib/utils';
import { calculateDeterministicLineVariance } from '../../lib/financialMath';
import { CheckCircle2, AlertTriangle, FileSpreadsheet, Building } from 'lucide-react';

interface InvoiceFactsPanelProps {
  lineItems: DocumentItemComparison[];
  poReference: string;
  grnReference: string;
  supplierGstin: string;
}

export const InvoiceFactsPanel: React.FC<InvoiceFactsPanelProps> = ({
  lineItems,
  poReference,
  grnReference,
  supplierGstin,
}) => {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A2640] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              Invoice Facts & 3-Way Match Verification
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Deterministic Math
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconciling Purchase Order ({poReference}), Warehouse Receipt ({grnReference}), and Supplier Invoice
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>GSTIN: <span className="text-slate-200 font-semibold">{supplierGstin}</span></span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mt-4 -mx-6 px-6">
        <table className="w-full min-w-[700px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1A2640] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0C1220]/50">
              <th className="py-2.5 px-3">Item & Parameter</th>
              <th className="py-2.5 px-3 text-right">PO ({poReference})</th>
              <th className="py-2.5 px-3 text-right">GRN ({grnReference})</th>
              <th className="py-2.5 px-3 text-right">Supplier Invoice</th>
              <th className="py-2.5 px-3 text-center">Variance / Match</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#162238]">
            {lineItems.map((item) => {
              const variance = calculateDeterministicLineVariance(item);

              return (
                <React.Fragment key={item.lineItemId}>
                  {/* Item Description Header Row */}
                  <tr className="bg-[#121A2D]/80">
                    <td colSpan={5} className="py-2 px-3 font-semibold text-slate-200 text-xs flex items-center gap-2">
                      <span className="text-teal-400 font-mono text-[11px]">{item.lineItemId}</span>
                      <span>{item.itemDescription}</span>
                    </td>
                  </tr>

                  {/* Quantity Row */}
                  <tr className="hover:bg-[#152136]/50">
                    <td className="py-2 px-3 text-slate-400 font-medium pl-6">Quantity (Units)</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">{item.po.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">{item.grn.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100">{item.invoice.quantity}</td>
                    <td className="py-2 px-3 text-center">
                      {variance.hasQuantityMismatch ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Delta: {variance.qtyDelta > 0 ? `+${variance.qtyDelta}` : variance.qtyDelta}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Match
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Unit Price Row */}
                  <tr className="hover:bg-[#152136]/50">
                    <td className="py-2 px-3 text-slate-400 font-medium pl-6">Unit Price (INR)</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">{formatINR(item.po.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">—</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-100">{formatINR(item.invoice.unitPrice)}</td>
                    <td className="py-2 px-3 text-center">
                      {variance.hasPriceMismatch ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          +{formatINR(variance.priceDelta)}/unit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Exact Tariff Match
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* GST Rate Row */}
                  <tr className="hover:bg-[#152136]/50">
                    <td className="py-2 px-3 text-slate-400 font-medium pl-6">Applicable GST</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">{item.po.gstRate}%</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">—</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">{item.invoice.gstRate}%</td>
                    <td className="py-2 px-3 text-center">
                      {variance.hasGstMismatch ? (
                        <span className="text-[11px] font-semibold text-rose-400">GST Mismatch</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Standard Rate
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Total Invoiced Amount Row */}
                  <tr className="bg-[#0E1526] font-semibold">
                    <td className="py-2.5 px-3 text-slate-300 pl-6">Total Line Amount (Incl. GST)</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatINR(item.po.totalAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatINR(item.grn.totalAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-300">{formatINR(item.invoice.totalAmount)}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {variance.totalVarianceAmount !== 0 ? (
                        <span className="text-amber-400 text-xs">
                          {variance.totalVarianceAmount > 0 ? `+${formatINR(variance.totalVarianceAmount)}` : formatINR(variance.totalVarianceAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-xs">₹0 Variance</span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

