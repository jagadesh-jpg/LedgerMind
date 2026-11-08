export type InvoiceStatus = 'Needs Review' | 'Processing' | 'Resolved';

export type ExceptionType =
  | 'Unit Price Mismatch'
  | 'Quantity Mismatch'
  | 'Possible Duplicate'
  | 'Missing Information'
  | 'Other Exceptions';

export interface Invoice {
  id: string;
  vendor: string;
  vendorCategory: string;
  invoiceDate: string;
  amount: number;
  exception: ExceptionType | 'None';
  status: InvoiceStatus;
  poNumber: string;
  confidenceScore: number;
  dueDate: string;
  notes?: string;
}

export interface KPIMetric {
  title: string;
  value: string;
  rawCount?: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  isPositiveChange: boolean;
  subtext: string;
  iconName: 'FileText' | 'Clock' | 'AlertTriangle' | 'CheckCircle2';
}

export interface ActivityTrendPoint {
  date: string;
  processed: number;
  exceptions: number;
}

export interface ExceptionBreakdownItem {
  category: ExceptionType;
  count: number;
  amountImpacted: number;
  percentage: number;
  severity: 'high' | 'medium' | 'low';
}

export interface RecentEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'upload' | 'exception' | 'review' | 'resolution';
  invoiceId: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  code: string;
  currency: string;
}

