import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

const OverviewPage = lazy(() =>
  import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const InvoiceDetailsPlaceholder = lazy(() =>
  import('./pages/InvoiceDetailsPlaceholder').then((m) => ({
    default: m.InvoiceDetailsPlaceholder,
  }))
);
const PlaceholderPage = lazy(() =>
  import('./pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage }))
);

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="flex items-center gap-3 text-slate-400 text-sm">
      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
      <span>Loading view...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppLayout onSearchChange={setGlobalSearch} />}>
            {/* Main Overview Dashboard */}
            <Route path="/" element={<OverviewPage searchQuery={globalSearch} />} />

            {/* Invoices List / Queue Placeholder */}
            <Route
              path="/invoices"
              element={
                <PlaceholderPage
                  title="Invoice Queue"
                  description="Comprehensive list of incoming, pending, and flagged vendor invoices."
                />
              }
            />

            {/* Invoice Details Route */}
            <Route path="/invoices/:id" element={<InvoiceDetailsPlaceholder />} />

            {/* Vendors Placeholder */}
            <Route
              path="/vendors"
              element={
                <PlaceholderPage
                  title="Vendor Directory"
                  description="Manage vendor profiles, contracts, historical variance scores, and terms."
                />
              }
            />

            {/* Memory Insights (With strict required disclaimer) */}
            <Route
              path="/memory-insights"
              element={
                <PlaceholderPage
                  title="Memory Insights"
                  description="Historical AP pattern recognition and autonomous resolution policies."
                  isMemoryInsights={true}
                />
              }
            />

            {/* Reports Placeholder */}
            <Route
              path="/reports"
              element={
                <PlaceholderPage
                  title="Financial Reports"
                  description="Variance audits, cash disbursement forecasts, and team resolution velocity."
                />
              }
            />

            {/* Settings Placeholder */}
            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="System Settings"
                  description="Company entities, ERP connector configurations, and approval thresholds."
                />
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;

