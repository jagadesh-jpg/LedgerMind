// @ts-ignore
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  memory_backend: string;
  groq_configured: boolean;
  hindsight_configured: boolean;
  data_counts: {
    invoices: number;
    vendors: number;
    decisions: number;
  };
}

export async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchInvoices(params: {
  status?: string;
  exception?: string;
  vendor?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.exception && params.exception !== 'All') query.append('exception', params.exception);
  if (params.vendor && params.vendor !== 'All') query.append('vendor', params.vendor);
  if (params.q) query.append('q', params.q);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/invoices?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return await res.json();
}

export async function fetchInvoiceDetails(id: string) {
  const res = await fetch(`${API_BASE}/invoices/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch invoice details');
  return await res.json();
}

export async function fetchInvoiceRecommendation(id: string) {
  const res = await fetch(`${API_BASE}/invoices/${id}/recommendation`);
  if (!res.ok) throw new Error('Failed to fetch recommendation');
  return await res.json();
}

export async function postInvoiceDecision(
  id: string,
  payload: {
    decision_type: string;
    action: string;
    reason: string;
    reviewer?: string;
  }
) {
  const res = await fetch(`${API_BASE}/invoices/${id}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to submit decision');
  }
  return await res.json();
}

export async function fetchVendorsList() {
  const res = await fetch(`${API_BASE}/vendors`);
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return await res.json();
}

export async function fetchVendorProfile(vendorId: string) {
  const res = await fetch(`${API_BASE}/vendors/${vendorId}/profile`);
  if (!res.ok) throw new Error('Failed to fetch vendor profile');
  return await res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return await res.json();
}
