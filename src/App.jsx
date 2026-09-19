import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AlertsPage from './pages/AlertsPage';
import InvestigationPage from './pages/InvestigationPage';
import SimulatorPage from './pages/SimulatorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/alerts': 'Fraud Alerts',
  '/investigation': 'Investigation',
  '/simulator': 'Simulator',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function App() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [searchText, setSearchText] = useState('');

  const renderLayout = (pageContent) => (
    <div className="app-shell">
      <div className="layout">
        <Sidebar active={activePage} onNavigate={(path, label) => { setActivePage(label); navigate(path); }} />
        <div className="content">
          <Topbar title={pageTitles[window.location.pathname] || 'Dashboard'} searchValue={searchText} onSearchChange={setSearchText} />
          {pageContent}
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={renderLayout(<DashboardPage />)} />
      <Route path="/transactions" element={renderLayout(<TransactionsPage />)} />
      <Route path="/alerts" element={renderLayout(<AlertsPage />)} />
      <Route path="/investigation" element={renderLayout(<InvestigationPage />)} />
      <Route path="/simulator" element={renderLayout(<SimulatorPage />)} />
      <Route path="/analytics" element={renderLayout(<AnalyticsPage />)} />
      <Route path="/settings" element={renderLayout(<SettingsPage />)} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
