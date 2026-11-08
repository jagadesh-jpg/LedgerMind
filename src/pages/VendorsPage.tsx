import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { fetchVendorsList, fetchVendorProfile } from '../lib/api';
import { Building2, BrainCircuit, RefreshCw, ChevronRight, FileText, X } from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<any | null>(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await fetchVendorsList();
      setVendors(res.vendors);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleInspectVendor = async (v: any) => {
    setSelectedVendor(v);
    setProfileLoading(true);
    try {
      const res = await fetchVendorProfile(v.id);
      setProfileData(res);
    } catch {
      // Fallback
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-teal-400" />
              Vendor Intelligence Directory
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#141E34] text-teal-300 border border-[#223554]">
              {vendors.length} Strategic Suppliers
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Vendor profiles, GST compliance records, and active precedent rules synthesized from past decisions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadVendors}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Directory
        </Button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <Card
            key={v.id}
            className="p-5 hover:border-[#2E436E] cursor-pointer transition-all duration-200 flex flex-col justify-between"
            onClick={() => handleInspectVendor(v)}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  {v.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">{v.payment_terms}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-100 mt-3">{v.name}</h3>
              <p className="text-xs text-slate-400">{v.category}</p>

              <div className="mt-3 p-2.5 rounded-lg bg-[#0E1526] border border-[#1A2640] text-xs text-slate-300 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Precedent Policy</span>
                <p className="italic text-[11px]">"{v.policy_summary}"</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1A2640] flex items-center justify-between text-xs text-teal-400 font-medium">
              <span>View Memory Profile</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        ))}
      </div>

      {/* Vendor Profile Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#121A2D] border border-[#223554] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A2640] pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-teal-400" />
                  {selectedVendor.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  GSTIN: {selectedVendor.gstin} • Terms: {selectedVendor.payment_terms}
                </span>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                <span>Synthesizing memory reflection...</span>
              </div>
            ) : profileData ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0E1526] border border-[#1A2640] space-y-2">
                  <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wide">
                    Hindsight Memory Reflection
                  </h4>
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {profileData.reflection.summary}
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>Total Decisions: {profileData.reflection.total_decisions}</span>
                    <span>Backend: {profileData.memory_backend}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">
                    Recent Vendor Invoices ({profileData.invoices.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {profileData.invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="p-2.5 rounded-lg bg-[#0E1526] border border-[#1A2640] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                          <span className="font-mono text-slate-200">{inv.id}</span>
                          <span className="text-slate-400">({inv.invoice_date})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-slate-200">
                            ₹{inv.amount.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-[#1A2640]">
              <Button variant="outline" size="sm" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

