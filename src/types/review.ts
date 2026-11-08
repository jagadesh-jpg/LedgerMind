export interface DocumentItemComparison {
  lineItemId: string;
  itemDescription: string;
  po: {
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    gstRate: number; // e.g. 18 for 18%
    gstin: string;
  };
  grn: {
    grnNumber: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    receivedDate: string;
  };
  invoice: {
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    gstRate: number;
    gstin: string;
  };
}

export interface VarianceAnalysis {
  hasPriceMismatch: boolean;
  priceDelta: number; // invoice - po
  hasQuantityMismatch: boolean;
  qtyDelta: number; // invoice - grn
  hasGstMismatch: boolean;
  hasGstinMismatch: boolean;
  taxDelta: number;
  totalInvoiceAmount: number;
  totalPoAmount: number;
  totalVarianceAmount: number;
}

export interface VendorMemoryRecord {
  id: string;
  decisionDate: string;
  vendorName: string;
  exceptionType: string;
  previousDecision: 'Approved with Justification' | 'Credit Note Requested' | 'Dispute Upheld' | 'Rejected';
  decisionRationale: string;
  reviewer: string;
  reviewerRole: string;
  sourceReference: string; // e.g. "PO-65120 / Dispute Ticket #DT-412"
  memorySimilarityScore?: number;
}

export type RecommendationAction =
  | 'Approve for Human Review'
  | 'Request Clarification'
  | 'Escalate to Finance Lead';

export interface AIRecommendation {
  suggestedAction: RecommendationAction;
  confidencePercentage: number;
  summaryExplanation: string;
  supportingFacts: string[];
  historicalPrecedents: string[];
  guidanceRiskLevel: 'low' | 'medium' | 'high';
}

export type HumanDecisionType = 'Accept Recommendation' | 'Edit Recommendation' | 'Reject Recommendation';

export interface RecordedDecision {
  invoiceId: string;
  decisionType: HumanDecisionType;
  actionTaken: string;
  rationaleNotes: string;
  recordedAt: string;
  recordedBy: string;
  status: 'Recorded in Local Demo State';
}

