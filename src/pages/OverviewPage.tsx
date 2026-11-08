import React from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { ExceptionBreakdown } from '../components/dashboard/ExceptionBreakdown';
import { RecentInvoicesTable } from '../components/dashboard/RecentInvoicesTable';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { Button } from '../components/common/Button';
import { Download, RefreshCw, Sparkles, Filter } from 'lucide-react';

interface OverviewPageProps {
  searchQuery?: string;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ searchQuery = '' }) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Welcome / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Finance Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-3 h-3" />
              DEMO DATA
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Monitor invoice processing, exceptions, and vendor activity.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
          >
            Filters
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <KPICards />

      {/* Visual Analytics Grid: Trend Chart (8 cols) + Exception Breakdown (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ActivityChart />
        </div>
        <div className="lg:col-span-4">
          <ExceptionBreakdown />
        </div>
      </div>

      {/* Tables & Feed Grid: Invoices Table (8 cols) + Recent Activity Timeline (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RecentInvoicesTable searchQuery={searchQuery} />
        </div>
        <div className="lg:col-span-4">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
};

