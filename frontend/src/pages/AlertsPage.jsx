import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts } from '../services/api';
import { mockAlerts } from '../data/mockData';
import AlertTable from '../components/AlertTable';

const filters = ['All', 'High', 'Medium', 'Low', 'Investigating', 'Resolved'];

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data || mockAlerts);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'All') return alerts;
    if (filter === 'Investigating' || filter === 'Resolved') {
      return alerts.filter((item) => item.status === filter);
    }
    return alerts.filter((item) => item.riskLevel === filter.toUpperCase());
  }, [alerts, filter]);

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
        {filters.map((item) => (
          <button key={item} type="button" className={item === filter ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No alerts match this filter.</div>
      ) : (
        <AlertTable alerts={filtered} onInvestigate={(alert) => navigate('/investigation', { state: { transactionId: alert.transactionId } })} />
      )}
    </div>
  );
}
