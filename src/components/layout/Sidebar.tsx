import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  BrainCircuit,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', to: '/', icon: LayoutDashboard },
  { name: 'Invoice Queue', to: '/invoices', icon: FileSpreadsheet, badge: '84' },
  { name: 'Vendors', to: '/vendors', icon: Building2 },
  { name: 'Memory Insights', to: '/memory-insights', icon: BrainCircuit },
  { name: 'Reports', to: '/reports', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 h-screen bg-[#0C1220] border-r border-[#1B2945] flex flex-col transition-all duration-300 ease-in-out select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1A2640]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-[1.5px] shrink-0 shadow-lg shadow-teal-950/50">
            <div className="w-full h-full bg-[#0C1220] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
                Ledger<span className="text-teal-400">Mind</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                AP Intelligence
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#16233B] transition-colors border border-transparent hover:border-[#243555]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {!collapsed ? 'Menu' : '•••'}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/5 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#152136] border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-teal-900/40">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-[#152136] text-slate-200 text-xs rounded-md shadow-xl border border-[#243555] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1A2640]">
        <div
          className={cn(
            'p-2.5 rounded-lg bg-[#11192B] border border-[#1C2C4A] flex items-center gap-3',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-200 truncate">Demo Mode</span>
                <span className="text-[10px] text-slate-400 truncate">Frontend Preview — AI not connected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

