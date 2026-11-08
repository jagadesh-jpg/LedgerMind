import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { fetchInvoices } from '../lib/api';
import { formatINR } from '../lib/utils';
import { Search, Filter, ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, FileSpreadsheet } from 'lucide-react';

export const InvoiceQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [exceptionFilter, setExceptionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices({
        status: statusFilter,
        exception: exceptionFilter,
        q: searchQuery,
        page,
        limit: 15,
      });
      setInvoices(data.items);
      setTotal(data.total);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, exceptionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-teal-400" />
              Invoice Queue
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#141E34] text-teal-300 border border-[#223554]">
              {total} Total Invoices
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time AP queue with deterministic variance detection and memory support
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice ID, vendor, or PO number..."
              className="w-full bg-[#121A2D] text-slate-200 placeholder-slate-400 text-xs pl-9 pr-4 py-2.5 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500"
            />
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#121A2D] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Statuses</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Processing">Processing</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Exception:</span>
              <select
                value={exceptionFilter}
                onChange={(e) => {
                  setExceptionFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#121A2D] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Exceptions</option>
                <option value="PRICE_VARIANCE">Price Variance</option>
                <option value="QTY_VARIANCE">Quantity Variance</option>
                <option value="DUPLICATE_SUSPECT">Duplicate Suspect</option>
                <option value="GST_MISMATCH">GST Mismatch</option>
                <option value="ROUNDING_DIFF">Rounding Diff</option>
                <option value="NONE">Clean Match</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Invoices Data Table */}
      <Card className="p-6">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse table-auto text-xs">
            <thead>
              <tr className="border-b border-[#1A2640] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0C1220]/40">
                <th className="py-3 px-3 whitespace-nowrap">Invoice ID</th>
                <th className="py-3 px-3 min-w-[160px]">Vendor</th>
                <th className="py-3 px-3 whitespace-nowrap">Date</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Amount</th>
                <th className="py-3 px-3">Exception Category</th>
                <th className="py-3 px-3 whitespace-nowrap">Status</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162238]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                      <span>Loading invoices from backend database...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No invoices match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-[#182642] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-200 group-hover:text-teal-400 whitespace-nowrap">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-100">{inv.vendor_name}</div>
                      <div className="text-[11px] text-slate-400">{inv.po_number} • {inv.vendor_category}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">{inv.invoice_date}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-100 whitespace-nowrap">
                      {formatINR(inv.amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant="exception" exception={inv.exception_type}>
                        {inv.exception_type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant="status" status={inv.status}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${inv.id}`);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors inline-flex items-center"
                        title="Review Invoice"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 pt-4 border-t border-[#1A2640] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{invoices.length}</strong> of{' '}
            <strong className="text-slate-200">{total}</strong> invoices
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="font-mono text-slate-300 px-2">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 15 >= total}
              onClick={() => setPage((p) => p + 1)}
              icon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
