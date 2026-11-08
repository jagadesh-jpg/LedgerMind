import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

const OverviewPage = lazy(() =>
  import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const InvoiceQueuePage = lazy(() =>
  import('./pages/InvoiceQueuePage').then((m) => ({ default: m.InvoiceQueuePage }))
);
const InvoiceDetailsPlaceholder = lazy(() =>
  import('./pages/InvoiceDetailsPlaceholder').then((m) => ({
    default: m.InvoiceDetailsPlaceholder,
  }))
);
const VendorsPage = lazy(() =>
  import('./pages/VendorsPage').then((m) => ({ default: m.VendorsPage }))
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

            {/* Invoices List / Queue */}
            <Route path="/invoices" element={<InvoiceQueuePage />} />

            {/* Invoice Details Route */}
            <Route path="/invoices/:id" element={<InvoiceDetailsPlaceholder />} />

            {/* Vendors Intelligence Directory */}
            <Route path="/vendors" element={<VendorsPage />} />

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
                  description="Variance audits, cash disbursement forecasts, and team resolution velocity. Not part of this release."
                />
              }
            />

            {/* Settings Placeholder */}
            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="System Settings"
                  description="Company entities, ERP connector configurations, and approval thresholds. Not part of this release."
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
