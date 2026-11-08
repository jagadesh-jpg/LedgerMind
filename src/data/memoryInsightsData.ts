export interface MemoryStatTile {
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  isPositive?: boolean;
}

export interface WeeklyAcceptancePoint {
  week: string;
  withMemory: number;
  withoutMemory: number;
}

export interface LearnedRule {
  id: string;
  title: string;
  description: string;
  vendor: string;
  casesCount: number;
  patternStrength: 'early' | 'moderate' | 'strong';
  learnedDate: string;
}

export interface ConflictingRuleAlert {
  id: string;
  vendor: string;
  title: string;
  description: string;
  ruleA: string;
  ruleB: string;
  impactedInvoicesCount: number;
  status: 'Awaiting Human Check';
}

export interface MemoryInsightsData {
  stats: MemoryStatTile[];
  weeklyAcceptance: WeeklyAcceptancePoint[];
  learnedRules: LearnedRule[];
  conflictingAlert: ConflictingRuleAlert;
}

export const MEMORY_INSIGHTS_DEMO_DATA: MemoryInsightsData = {
  stats: [
    {
      label: 'Recommendations Accepted As Is',
      value: '84%',
      subtext: 'Up from 31% in week 1',
      trend: '+53% overall',
      isPositive: true,
    },
    {
      label: 'Same Invoices Without Memory',
      value: '31%',
      subtext: 'Baseline rule-only match rate',
      trend: 'Static baseline',
      isPositive: false,
    },
    {
      label: 'Decisions Remembered',
      value: '412',
      subtext: 'Across 15 strategic vendors',
      trend: '15 vendors indexed',
      isPositive: true,
    },
    {
      label: 'Wrong Approvals',
      value: '0',
      subtext: 'Guarded by human oversight',
      trend: '100% zero-breach',
      isPositive: true,
    },
  ],
  weeklyAcceptance: [
    { week: 'Week 1', withMemory: 31, withoutMemory: 31 },
    { week: 'Week 2', withMemory: 40, withoutMemory: 30 },
    { week: 'Week 3', withMemory: 49, withoutMemory: 32 },
    { week: 'Week 4', withMemory: 58, withoutMemory: 31 },
    { week: 'Week 5', withMemory: 67, withoutMemory: 31 },
    { week: 'Week 6', withMemory: 74, withoutMemory: 30 },
    { week: 'Week 7', withMemory: 79, withoutMemory: 32 },
    { week: 'Week 8', withMemory: 84, withoutMemory: 31 },
  ],
  learnedRules: [
    {
      id: 'RULE-01',
      title: 'Structural Steel Surcharge Tariffs',
      description: 'Accepted price variances up to ₹1,400/MT on carbon tubing when verified against Ministry of Steel scrap addendum.',
      vendor: 'Tata Steel Tubes & Pipes',
      casesCount: 14,
      patternStrength: 'strong',
      learnedDate: '2 days ago',
    },
    {
      id: 'RULE-02',
      title: 'Partial Dispatch Withholding Policy',
      description: 'Hold line-item disbursements on short deliveries until secondary warehouse receipt confirmation arrives.',
      vendor: 'Schneider Electric India',
      casesCount: 8,
      patternStrength: 'moderate',
      learnedDate: '4 days ago',
    },
    {
      id: 'RULE-03',
      title: 'Air Freight Fuel Surcharge Threshold',
      description: 'Regional air docket fuel surcharges fluctuate ±3.5% based on fortnightly aviation turbine fuel adjustments.',
      vendor: 'BlueDart Air Express',
      casesCount: 4,
      patternStrength: 'early',
      learnedDate: 'Yesterday',
    },
  ],
  conflictingAlert: {
    id: 'CONF-SCHNEIDER-01',
    vendor: 'Schneider Electric India',
    title: 'Conflicting Resolution Policy for Backordered Panels',
    description: 'Two past reviewer decisions established conflicting precedent for handling partial delivery invoices under ₹1,50,000.',
    ruleA: 'Policy A (AP Lead Ramesh S.): Approve partial payment for GRN count and request credit note for delta.',
    ruleB: 'Policy B (Procurement Meera R.): Hold entire invoice payment until remaining 10 units are delivered.',
    impactedInvoicesCount: 3,
    status: 'Awaiting Human Check',
  },
};

/**
 * Access function to retrieve Memory Insights data.
 * Ready to be swapped for an async API fetch (e.g., FastAPI backend or Hindsight service) later.
 */
export function getMemoryInsightsData(): MemoryInsightsData {
  return MEMORY_INSIGHTS_DEMO_DATA;
}

