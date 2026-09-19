import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts } from '../services/api';
import AlertTable from '../components/AlertTable';

const riskFilters = ['All', 'LOW', 'MEDIUM', 'HIGH'];
const statusFilters = ['All', 'NEW', 'UNDER_REVIEW', 'RESOLVED'];

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const data = await getAlerts({
        search: search || undefined,
        risk_level: filter === 'All' ? undefined : filter,
        status: status === 'All' ? undefined : status,
        date_from: dateFrom || undefined,
        date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
      });
      if (data) setAlerts(data);
      else setError('Backend is unavailable. Start the API and try again.');
      setLoading(false);
    };
    load();
  }, [search, filter, status, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch('');
    setFilter('All');
    setStatus('All');
    setDateFrom('');
    setDateTo('');
  };

  if (loading) {
    return <div className="page"><div className="empty-state">Loading alerts…</div></div>;
  }

  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Monitoring</div>
          <h2>Fraud Alerts</h2>
        </div>
      </div>

      <div className="filter-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search alert, transaction, customer, sender, receiver" aria-label="Search alerts" />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter alerts by risk">
          {riskFilters.map((item) => <option key={item} value={item}>{item === 'All' ? 'All risk levels' : item}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter alerts by status">
          {statusFilters.map((item) => <option key={item} value={item}>{item === 'All' ? 'All statuses' : item}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="From date" />
        <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="To date" />
        <button type="button" onClick={clearFilters}>Clear filters</button>
      </div>

      <div className="active-filters">
        Search: <strong>{search || 'none'}</strong> | Risk: <strong>{filter}</strong> | Status: <strong>{status}</strong>
      </div>

      {error ? (
        <div className="empty-state error-state">{error}</div>
      ) : loading ? (
        <div className="empty-state">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">No alerts match the active filters.</div>
      ) : (
        <AlertTable alerts={alerts} onInvestigate={(alert) => navigate('/investigation', { state: { transactionId: alert.transactionId } })} />
      )}
    </div>
  );
}
