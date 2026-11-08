import { DocumentItemComparison, VarianceAnalysis } from '../types/review';

/**
 * Deterministic financial arithmetic and three-way match calculation engine.
 * Never delegates arithmetic, GST calculations, or variance logic to an LLM.
 */

export function calculateDeterministicLineVariance(item: DocumentItemComparison): VarianceAnalysis {
  // Price variance check against PO
  const priceDelta = item.invoice.unitPrice - item.po.unitPrice;
  const hasPriceMismatch = Math.abs(priceDelta) > 0.01;

  // Quantity variance check against GRN (Goods Receipt Note)
  const qtyDelta = item.invoice.quantity - item.grn.quantity;
  const hasQuantityMismatch = Math.abs(qtyDelta) > 0;

  // Tax and GST check
  const hasGstMismatch = item.invoice.gstRate !== item.po.gstRate;
  const hasGstinMismatch = item.invoice.gstin.trim().toUpperCase() !== item.po.gstin.trim().toUpperCase();

  const invoiceTaxAmount = (item.invoice.quantity * item.invoice.unitPrice * item.invoice.gstRate) / 100;
  const poTaxAmount = (item.po.quantity * item.po.unitPrice * item.po.gstRate) / 100;
  const taxDelta = invoiceTaxAmount - poTaxAmount;

  const totalInvoiceAmount = item.invoice.totalAmount;
  const totalPoAmount = item.po.totalAmount;
  const totalVarianceAmount = totalInvoiceAmount - totalPoAmount;

  return {
    hasPriceMismatch,
    priceDelta,
    hasQuantityMismatch,
    qtyDelta,
    hasGstMismatch,
    hasGstinMismatch,
    taxDelta,
    totalInvoiceAmount,
    totalPoAmount,
    totalVarianceAmount,
  };
}

export function calculateAggregateVariance(items: DocumentItemComparison[]) {
  return items.reduce(
    (acc, curr) => {
      const v = calculateDeterministicLineVariance(curr);
      return {
        totalInvoiceAmount: acc.totalInvoiceAmount + v.totalInvoiceAmount,
        totalPoAmount: acc.totalPoAmount + v.totalPoAmount,
        totalVariance: acc.totalVariance + v.totalVarianceAmount,
        hasAnyMismatch: acc.hasAnyMismatch || v.hasPriceMismatch || v.hasQuantityMismatch || v.hasGstMismatch || v.hasGstinMismatch,
      };
    },
    { totalInvoiceAmount: 0, totalPoAmount: 0, totalVariance: 0, hasAnyMismatch: false }
  );
}

