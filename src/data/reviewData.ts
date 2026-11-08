import { DocumentItemComparison, VendorMemoryRecord, AIRecommendation } from '../types/review';

export interface InvoiceReviewDataset {
  invoiceId: string;
  vendorName: string;
  poReference: string;
  grnReference: string;
  supplierGstin: string;
  buyerGstin: string;
  lineItems: DocumentItemComparison[];
  memoryTrail: VendorMemoryRecord[];
  aiRecommendation: AIRecommendation;
}

export const INVOICE_REVIEW_DATA: Record<string, InvoiceReviewDataset> = {
  'INV-2026-8941': {
    invoiceId: 'INV-2026-8941',
    vendorName: 'Tata Steel Tubes & Pipes',
    poReference: 'PO-77491',
    grnReference: 'GRN-44912',
    supplierGstin: '27AAACT2727Q1ZW',
    buyerGstin: '29AABCN9910D1ZM',
    lineItems: [
      {
        lineItemId: 'LINE-001',
        itemDescription: 'ERW Structural Grade Carbon Steel Tubes (50mm x 50mm, 3.2mm wall)',
        po: {
          quantity: 200,
          unitPrice: 6100, // ₹6,100 per unit in PO
          totalAmount: 1439600, // (200 * 6100) + 18% GST = 12,20,000 + 2,19,600
          gstRate: 18,
          gstin: '27AAACT2727Q1ZW',
        },
        grn: {
          grnNumber: 'GRN-44912',
          quantity: 200, // Full 200 units received in yard
          unitPrice: 6100,
          totalAmount: 1220000,
          receivedDate: '06 Nov 2026',
        },
        invoice: {
          quantity: 200,
          unitPrice: 7500, // ₹7,500 claimed in Invoice (₹1,400 variance)
          totalAmount: 1770000, // (200 * 7500) + 18% GST = 15,00,000 + 2,70,000
          gstRate: 18,
          gstin: '27AAACT2727Q1ZW',
        },
      },
    ],
    memoryTrail: [
      {
        id: 'MEM-2026-041',
        decisionDate: '14 Aug 2026',
        vendorName: 'Tata Steel Tubes & Pipes',
        exceptionType: 'Unit Price Mismatch',
        previousDecision: 'Approved with Justification',
        decisionRationale: 'A price variance of ₹1,200 per MT on structural tubing was accepted after verifying the Ministry of Steel scrap index surcharge addendum for Q2.',
        reviewer: 'Ramesh Sundaram',
        reviewerRole: 'Senior AP Controller',
        sourceReference: 'PO-65120 / Surcharge Addendum #TS-2026-Q2',
        memorySimilarityScore: 0.94,
      },
      {
        id: 'MEM-2026-019',
        decisionDate: '02 Feb 2026',
        vendorName: 'Tata Steel Tubes & Pipes',
        exceptionType: 'Unit Price Mismatch',
        previousDecision: 'Credit Note Requested',
        decisionRationale: 'Unilateral freight escalation of ₹950 per MT was rejected. Tata Steel issued Credit Note #CN-8812 to adjust the base contracted rate.',
        reviewer: 'Anand Kumar',
        reviewerRole: 'AP Lead',
        sourceReference: 'Dispute Ticket #DT-902 / CN-8812',
        memorySimilarityScore: 0.89,
      },
      {
        id: 'MEM-2025-112',
        decisionDate: '19 Nov 2025',
        vendorName: 'Tata Steel Tubes & Pipes',
        exceptionType: 'Missing Information',
        previousDecision: 'Approved with Justification',
        decisionRationale: 'Missing mill test certificate provided via vendor ticketing portal within 24 hours of notification.',
        reviewer: 'Meera Rao',
        reviewerRole: 'Procurement Specialist',
        sourceReference: 'Ticket #TK-5510',
        memorySimilarityScore: 0.72,
      },
    ],
    aiRecommendation: {
      suggestedAction: 'Request Clarification',
      confidencePercentage: 88,
      summaryExplanation:
        'Invoice reflects a ₹1,400/unit (+22.9%) premium over contracted PO-77491 rate. Historical memory confirms Tata Steel previously justified market price adjustments when steel index surcharges applied (Aug 2026), but required a credit note when unverified (Feb 2026). No index addendum is attached to this submission.',
      supportingFacts: [
        'Line Item: ERW Structural Grade Tubes PO rate is ₹6,100 vs Invoice rate ₹7,500 (Variance: +₹1,400/unit).',
        'Physical count verified: GRN-44912 confirms all 200 units safely received in store yard.',
        'Total net invoice variance equals ₹3,30,400 inclusive of 18% GST delta.',
      ],
      historicalPrecedents: [
        'MEM-2026-041: Precedent where ₹1,200/unit variance was accepted with documented index addendum.',
        'MEM-2026-019: Precedent where unverified price deviation was rejected and adjusted with Credit Note #CN-8812.',
      ],
      guidanceRiskLevel: 'medium',
    },
  },
  'INV-2026-8929': {
    invoiceId: 'INV-2026-8929',
    vendorName: 'Schneider Electric India',
    poReference: 'PO-71043',
    grnReference: 'GRN-44810',
    supplierGstin: '27AAACS1414P1ZM',
    buyerGstin: '29AABCN9910D1ZM',
    lineItems: [
      {
        lineItemId: 'LINE-001',
        itemDescription: 'Three-Phase Low Voltage Distribution Panel (415V, 250A)',
        po: {
          quantity: 50,
          unitPrice: 10644,
          totalAmount: 628000,
          gstRate: 18,
          gstin: '27AAACS1414P1ZM',
        },
        grn: {
          grnNumber: 'GRN-44810',
          quantity: 40, // Only 40 units cleared into inventory
          unitPrice: 10644,
          totalAmount: 502400,
          receivedDate: '04 Nov 2026',
        },
        invoice: {
          quantity: 50, // Invoicing for entire 50 units
          unitPrice: 10644,
          totalAmount: 628000,
          gstRate: 18,
          gstin: '27AAACS1414P1ZM',
        },
      },
    ],
    memoryTrail: [
      {
        id: 'MEM-2026-081',
        decisionDate: '28 Jul 2026',
        vendorName: 'Schneider Electric India',
        exceptionType: 'Quantity Mismatch',
        previousDecision: 'Credit Note Requested',
        decisionRationale: 'Partial shipment received (30 of 40 units). Vendor agreed to invoice only received quantity or provide revised bill for actual GRN count.',
        reviewer: 'Anand Kumar',
        reviewerRole: 'AP Lead',
        sourceReference: 'PO-61099 / Dispatch Advice #DA-441',
        memorySimilarityScore: 0.96,
      },
    ],
    aiRecommendation: {
      suggestedAction: 'Escalate to Finance Lead',
      confidencePercentage: 92,
      summaryExplanation:
        'Vendor invoiced 50 panels whereas Warehouse GRN-44810 confirms delivery of only 40 panels. Ten units remain pending backorder. Policy requires withholding payment for unreceived stock until warehouse receipt confirmation or revised invoice.',
      supportingFacts: [
        'Quantity discrepancy: Invoiced 50 units, physically delivered 40 units (Delta: -10 units).',
        'Unit pricing matches PO contract exactly at ₹10,644/unit.',
        'Unverified liability of ₹1,25,600 (inclusive of GST) if paid as invoiced.',
      ],
      historicalPrecedents: [
        'MEM-2026-081: Precedent enforcing payment withholdings on Schneider backorders.',
      ],
      guidanceRiskLevel: 'high',
    },
  },
  'INV-2026-8935': {
    invoiceId: 'INV-2026-8935',
    vendorName: 'BlueDart Air Express',
    poReference: 'PO-88120',
    grnReference: 'GRN-44780',
    supplierGstin: '27AAACB0001Z1ZR',
    buyerGstin: '29AABCN9910D1ZM',
    lineItems: [
      {
        lineItemId: 'LINE-001',
        itemDescription: 'Air Express Commercial Freight (Docket Series #BD-9041)',
        po: {
          quantity: 1,
          unitPrice: 80169,
          totalAmount: 94600,
          gstRate: 18,
          gstin: '27AAACB0001Z1ZR',
        },
        grn: {
          grnNumber: 'GRN-44780',
          quantity: 1,
          unitPrice: 80169,
          totalAmount: 94600,
          receivedDate: '05 Nov 2026',
        },
        invoice: {
          quantity: 1,
          unitPrice: 80169,
          totalAmount: 94600,
          gstRate: 18,
          gstin: '27AAACB0001Z1ZR',
        },
      },
    ],
    memoryTrail: [
      {
        id: 'MEM-2026-012',
        decisionDate: '10 Jan 2026',
        vendorName: 'BlueDart Air Express',
        exceptionType: 'Possible Duplicate',
        previousDecision: 'Rejected',
        decisionRationale: 'Waybill docket was submitted in duplicate across regional dispatch files. Flagged and rejected during audit validation.',
        reviewer: 'Anand Kumar',
        reviewerRole: 'AP Lead',
        sourceReference: 'Audit Log #AL-2026-01',
        memorySimilarityScore: 0.98,
      },
    ],
    aiRecommendation: {
      suggestedAction: 'Escalate to Finance Lead',
      confidencePercentage: 94,
      summaryExplanation:
        'Docket number sequence on this billing matches previously processed transaction from Oct 2026. High duplicate probability.',
      supportingFacts: [
        'Waybill docket #BD-9041 hash matches historical disbursement #DISB-7741.',
        'Amount of ₹94,600 identical to previous settlement.',
      ],
      historicalPrecedents: [
        'MEM-2026-012: Precedent showing identical duplicate re-submission by regional courier billing.',
      ],
      guidanceRiskLevel: 'high',
    },
  },
  'INV-2026-8938': {
    invoiceId: 'INV-2026-8938',
    vendorName: 'Infosys Cloud Operations',
    poReference: 'PO-65219',
    grnReference: 'GRN-44900',
    supplierGstin: '29AAACI1234K1ZV',
    buyerGstin: '29AABCN9910D1ZM',
    lineItems: [
      {
        lineItemId: 'LINE-001',
        itemDescription: 'Enterprise Cloud Infrastructure Support - Oct 2026',
        po: {
          quantity: 1,
          unitPrice: 324068,
          totalAmount: 382400,
          gstRate: 18,
          gstin: '29AAACI1234K1ZV',
        },
        grn: {
          grnNumber: 'GRN-44900',
          quantity: 1,
          unitPrice: 324068,
          totalAmount: 382400,
          receivedDate: '01 Nov 2026',
        },
        invoice: {
          quantity: 1,
          unitPrice: 324068,
          totalAmount: 382400,
          gstRate: 18,
          gstin: '29AAACI1234K1ZV',
        },
      },
    ],
    memoryTrail: [
      {
        id: 'MEM-2026-095',
        decisionDate: '05 Sep 2026',
        vendorName: 'Infosys Cloud Operations',
        exceptionType: 'None',
        previousDecision: 'Approved with Justification',
        decisionRationale: 'Clean 3-way match against SLA uptime ticket #7841.',
        reviewer: 'Anand Kumar',
        reviewerRole: 'AP Lead',
        sourceReference: 'PO-60112',
        memorySimilarityScore: 0.99,
      },
    ],
    aiRecommendation: {
      suggestedAction: 'Approve for Human Review',
      confidencePercentage: 99,
      summaryExplanation:
        'All three documents (PO-65219, Service Receipt GRN-44900, and Tax Invoice) match deterministically in quantity, unit rate, and GST computations. Vendor account is verified.',
      supportingFacts: [
        'Zero variance in unit pricing, quantity, or tax calculation.',
        'Supplier GSTIN verified against master database.',
      ],
      historicalPrecedents: [
        'MEM-2026-095: Vendor has 100% clean matching track record over the last 6 months.',
      ],
      guidanceRiskLevel: 'low',
    },
  },
};

/**
 * Fallback generator for invoices without curated granular test data
 */
export function getReviewDatasetForInvoice(invoiceId: string, vendorName: string, poNumber: string, amount: number): InvoiceReviewDataset {
  if (INVOICE_REVIEW_DATA[invoiceId]) {
    return INVOICE_REVIEW_DATA[invoiceId];
  }

  // Deterministic fallback dataset
  return {
    invoiceId,
    vendorName,
    poReference: poNumber || 'PO-GENERIC',
    grnReference: 'GRN-88102',
    supplierGstin: '27AAACG9999P1ZM',
    buyerGstin: '29AABCN9910D1ZM',
    lineItems: [
      {
        lineItemId: 'LINE-001',
        itemDescription: 'Commercial Supplies & Equipment Services',
        po: {
          quantity: 10,
          unitPrice: Math.round(amount / 1.18 / 10),
          totalAmount: amount,
          gstRate: 18,
          gstin: '27AAACG9999P1ZM',
        },
        grn: {
          grnNumber: 'GRN-88102',
          quantity: 10,
          unitPrice: Math.round(amount / 1.18 / 10),
          totalAmount: amount,
          receivedDate: '02 Nov 2026',
        },
        invoice: {
          quantity: 10,
          unitPrice: Math.round(amount / 1.18 / 10),
          totalAmount: amount,
          gstRate: 18,
          gstin: '27AAACG9999P1ZM',
        },
      },
    ],
    memoryTrail: [
      {
        id: 'MEM-FALLBACK-01',
        decisionDate: '15 Jul 2026',
        vendorName,
        exceptionType: 'Standard Variance Review',
        previousDecision: 'Approved with Justification',
        decisionRationale: 'Historical procurement cycle verified against master contract agreement.',
        reviewer: 'Anand Kumar',
        reviewerRole: 'AP Lead',
        sourceReference: 'PO-ARCHIVE',
        memorySimilarityScore: 0.85,
      },
    ],
    aiRecommendation: {
      suggestedAction: 'Approve for Human Review',
      confidencePercentage: 90,
      summaryExplanation:
        'Standard 3-way match verified against warehouse GRN and purchase order. Ready for human authorization.',
      supportingFacts: [
        'Document parameters match within default tolerance threshold.',
        'No duplicate invoice submission identified in system ledger.',
      ],
      historicalPrecedents: ['Vendor has standard quarterly fulfillment agreement.'],
      guidanceRiskLevel: 'low',
    },
  };
}

