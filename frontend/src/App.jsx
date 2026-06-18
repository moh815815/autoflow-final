// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BillingPage from './pages/BillingPage';
import Layout from './components/Layout';
import {
  WorkflowsPage, WorkflowEditorPage, TemplatesPage,
  IntegrationsPage, HRPage, PayrollPage, SalesPage,
  CRMPage, InventoryPage, LogsPage, ReportsPage,
  NotificationsPage, TeamPage, AIPage, SettingsPage,
} from './pages/stubs';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

const Protected = ({ children }) => {
  const token = localStorage.getItem('autoflow_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center"
          toastOptions={{ style: { fontFamily:"'Cairo',sans-serif", direction:'rtl' } }} />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route path="dashboard"          element={<DashboardPage />} />
            <Route path="workflows"          element={<WorkflowsPage />} />
            <Route path="workflows/new"      element={<WorkflowEditorPage />} />
            <Route path="workflows/:id/edit" element={<WorkflowEditorPage />} />
            <Route path="templates"          element={<TemplatesPage />} />
            <Route path="integrations"       element={<IntegrationsPage />} />
            <Route path="hr"                 element={<HRPage />} />
            <Route path="payroll"            element={<PayrollPage />} />
            <Route path="sales"              element={<SalesPage />} />
            <Route path="crm"               element={<CRMPage />} />
            <Route path="inventory"          element={<InventoryPage />} />
            <Route path="logs"               element={<LogsPage />} />
            <Route path="reports"            element={<ReportsPage />} />
            <Route path="notifications"      element={<NotificationsPage />} />
            <Route path="team"               element={<TeamPage />} />
            <Route path="ai"                 element={<AIPage />} />
            <Route path="billing"            element={<BillingPage />} />
            <Route path="settings"           element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
