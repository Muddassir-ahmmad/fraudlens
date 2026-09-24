import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import InvestigationPage from './pages/InvestigationPage';
import SimulatorPage from './pages/SimulatorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/payment': 'Payment Activity',
  '/transactions': 'Transactions',
  '/history': 'Payment History',
  '/alerts': 'Fraud Alerts',
  '/investigation': 'Investigation',
  '/simulator': 'Simulator',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState('');

  return (
    <div className="app-shell">
      <div className="layout">
        <Sidebar activePath={location.pathname} onNavigate={navigate} />
        <div className="content">
          <Topbar title={pageTitles[location.pathname] || 'Dashboard'} searchValue={searchText} onSearchChange={setSearchText} />
          {children}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/payment" element={<TransactionsPage />} />
        <Route path="/transactions" element={<Navigate to="/payment" replace />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/investigation" element={<InvestigationPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}
