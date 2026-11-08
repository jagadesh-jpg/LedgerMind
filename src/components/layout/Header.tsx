import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Building,
  Check,
  User,
  Shield,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { DEMO_COMPANIES } from '../../data/mockData';
import { CompanyProfile } from '../../types';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile>(DEMO_COMPANIES[0]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const companyRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1A2640] sticky top-0 z-20 px-6 flex items-center justify-between gap-4">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search invoices, PO numbers, vendors, or amounts..."
            className="w-full bg-[#121A2D] text-slate-200 placeholder-slate-400 text-sm pl-10 pr-9 py-2 rounded-lg border border-[#1E2D4A] focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Demo Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="demo">Demo Mode</Badge>
        </div>

        {/* Company Selector Dropdown */}
        <div className="relative" ref={companyRef}>
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#121A2D] border border-[#1E2D4A] hover:border-[#273B60] text-sm text-slate-200 transition-colors"
          >
            <Building className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-medium max-w-[140px] truncate">{selectedCompany.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isCompanyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#121A2D] border border-[#223354] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-[#1C2C48] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Entity
              </div>
              {DEMO_COMPANIES.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setSelectedCompany(company);
                    setIsCompanyDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-sm hover:bg-[#19253F] transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-medium text-slate-200 truncate">{company.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{company.code} ({company.currency})</span>
                  </div>
                  {selectedCompany.id === company.id && (
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Icon */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-lg bg-[#121A2D] border border-[#1E2D4A] hover:border-[#273B60] text-slate-300 hover:text-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-[#0B0F19]" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121A2D] border border-[#223354] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2C48]">
                <span className="text-sm font-semibold text-slate-200">Alerts & Exceptions</span>
                <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                  3 Priority
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="p-2 rounded-lg bg-[#17223B]/60 hover:bg-[#17223B] border border-[#203152] transition-colors">
                  <p className="text-xs font-semibold text-slate-200">Unit Price Variance</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">INV-2026-8941 exceeds tariff by ₹1,400/MT</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">42m ago</span>
                </div>
                <div className="p-2 rounded-lg bg-[#17223B]/60 hover:bg-[#17223B] border border-[#203152] transition-colors">
                  <p className="text-xs font-semibold text-slate-200">Duplicate Docket Number</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">INV-2026-8935 matches settled docket #BD-9041</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">5h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-lg bg-[#121A2D] border border-[#1E2D4A] hover:border-[#273B60] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-semibold text-xs text-white shadow-inner">
              AK
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200">Anand Kumar</span>
              <span className="text-[10px] text-slate-400">AP Controller</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#121A2D] border border-[#223354] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-[#1C2C48]">
                <p className="text-sm font-medium text-slate-100">Anand Kumar</p>
                <p className="text-xs text-slate-400 truncate">anand.k@nexuslogistics.in</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-teal-400">
                  <Shield className="w-3 h-3" /> AP Operations Role
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-[#18253E] hover:text-slate-100 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" /> Account Profile
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-[#18253E] hover:text-slate-100 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" /> Audit Log
                </button>
                <div className="my-1 border-t border-[#1C2C48]" />
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out (Demo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

