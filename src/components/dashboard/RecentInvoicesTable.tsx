import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { MOCK_INVOICES } from '../../data/mockData';
import { formatINR } from '../../lib/utils';
import { ArrowUpRight, Filter } from 'lucide-react';
import { Invoice } from '../../types';

interface RecentInvoicesTableProps {
  searchQuery?: string;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({ searchQuery = '' }) => {
  const navigate = useNavigate();

  const filteredInvoices = MOCK_INVOICES.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.id.toLowerCase().includes(q) ||
      inv.vendor.toLowerCase().includes(q) ||
      inv.poNumber.toLowerCase().includes(q) ||
      inv.exception.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q)
    );
  });

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`, { state: { invoice } });
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1A2640]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">Recent Invoices</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
              SAMPLE DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Displaying high-priority and recently ingested invoices with variance status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/invoices')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40"
          >
            View All ({MOCK_INVOICES.length})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto mt-4 -mx-6 px-6">
        <table className="w-full min-w-[760px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1A2640] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 w-36 whitespace-nowrap">Invoice ID</th>
              <th className="py-3 px-3 min-w-[180px]">Vendor</th>
              <th className="py-3 px-3 w-28 whitespace-nowrap">Date</th>
              <th className="py-3 px-3 w-32 text-right whitespace-nowrap">Amount</th>
              <th className="py-3 px-3 min-w-[170px]">Exception Category</th>
              <th className="py-3 px-3 w-32 whitespace-nowrap">Status</th>
              <th className="py-3 px-3 w-16 text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#162238] text-sm">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-6 h-6 text-slate-500" />
                    <span>No invoices match your search query "{searchQuery}"</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => handleRowClick(inv)}
                  className="hover:bg-[#182642] cursor-pointer transition-all duration-150 group border-l-2 border-transparent hover:border-teal-400"
                >
                  <td className="py-3.5 px-3 font-mono font-medium text-slate-200 group-hover:text-teal-400 whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-slate-100 truncate max-w-[200px]" title={inv.vendor}>
                      {inv.vendor}
                    </div>
                    <div className="text-[11px] text-slate-400 whitespace-nowrap">{inv.poNumber} • {inv.vendorCategory}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs whitespace-nowrap">
                    {inv.invoiceDate}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-100 whitespace-nowrap">
                    {formatINR(inv.amount)}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge variant="exception" exception={inv.exception}>
                      {inv.exception}
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
                        handleRowClick(inv);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors inline-flex items-center"
                      title="Inspect Invoice"
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
    </Card>
  );
};

