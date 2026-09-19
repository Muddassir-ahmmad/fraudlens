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
import CustomerPaymentPage from './pages/CustomerPaymentPage';
import CustomerVerificationPage from './pages/CustomerVerificationPage';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/alerts': 'Fraud Alerts',
  '/investigation': 'Investigation',
  '/simulator': 'Simulator',
};

export default function App() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Dashboard');
  const [searchText, setSearchText] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('fraudlens-theme') || 'light');

  const handleLogout = () => {
    setActivePage('Dashboard');
    setSearchText('');
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('fraudlens-theme', nextTheme);
      return nextTheme;
    });
  };

  const renderLayout = (pageContent) => (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <div className="layout">
        <Sidebar active={activePage} onNavigate={(path, label) => { setActivePage(label); navigate(path); }} />
        <div className="content">
          <Topbar title={pageTitles[window.location.pathname] || 'Dashboard'} searchValue={searchText} onSearchChange={setSearchText} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
          {pageContent}
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/pay" element={<CustomerPaymentPage />} />
      <Route path="/verify/:customerId" element={<CustomerVerificationPage />} />
      <Route path="/dashboard" element={renderLayout(<DashboardPage />)} />
      <Route path="/transactions" element={renderLayout(<TransactionsPage />)} />
      <Route path="/alerts" element={renderLayout(<AlertsPage />)} />
      <Route path="/investigation" element={renderLayout(<InvestigationPage />)} />
      <Route path="/simulator" element={renderLayout(<SimulatorPage />)} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
