import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getDashboardAnalytics, getDashboardSummary } from '../services/api';
import StatCard from '../components/StatCard';

const chartColors = ['#0f172a', '#f59e0b', '#dc2626'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const [data, dashboardAnalytics] = await Promise.all([getDashboardSummary(), getDashboardAnalytics()]);
      if (data) setSummary(data);
      else {
        setSummary({ totalTransactions: 0, lowRisk: 0, mediumRisk: 0, highRisk: 0, recentAlerts: [] });
        setError('Dashboard data is unavailable. Start the backend and refresh.');
      }
      setAnalytics(dashboardAnalytics);
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Total Transactions', value: summary.totalTransactions?.toLocaleString('en-IN') || '0', trend: '+8.1% vs last week', tone: 'neutral' },
      { label: 'Low Risk', value: summary.lowRisk?.toLocaleString('en-IN') || '0', trend: 'Stable patterns', tone: 'success' },
      { label: 'Medium Risk', value: summary.mediumRisk?.toLocaleString('en-IN') || '0', trend: 'Needs review', tone: 'warning' },
      { label: 'High Risk', value: summary.highRisk?.toLocaleString('en-IN') || '0', trend: 'Escalate quickly', tone: 'danger' },
    ];
  }, [summary]);

  if (loading) {
    return <div className="page"><div className="empty-state">Loading dashboard analytics…</div></div>;
  }

  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Operations</div>
          <h2>Fraud Control Center</h2>
        </div>
      </div>

      {error && <div className="empty-state error-state" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="summary-row">
        {stats.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} trend={card.trend} tone={card.tone} />
        ))}
      </div>

      <div className="grid-two" style={{ marginBottom: 20 }}>
        <div className="card chart-card">
          <h3>Risk Distribution</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ name: 'Low', value: summary.lowRisk }, { name: 'Medium', value: summary.mediumRisk }, { name: 'High', value: summary.highRisk }]} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
                  {[summary.lowRisk, summary.mediumRisk, summary.highRisk].map((value, index) => (
                    <Cell key={`${index}-${value}`} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3>Transaction Activity Over Time</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={(analytics?.transactions_by_day || []).map((item) => ({ name: item.label.slice(5), amount: item.value }))}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="amount" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-two" style={{ marginBottom: 20 }}>
        <div className="card list-card">
          <div className="section-header"><h3>Risk Trend</h3><span className="muted">High-risk amount: ₹{Number(analytics?.high_risk_transaction_amount || 0).toLocaleString('en-IN')}</span></div>
          <div className="trend-list">
            {(analytics?.risk_trend || []).map((item) => <div className="trend-row" key={item.label}><span>{item.label}</span><strong>{item.value}/100</strong></div>)}
          </div>
        </div>
        <div className="card list-card">
          <div className="section-header"><h3>Top Risky Customers</h3></div>
          <div className="trend-list">
            {(analytics?.top_risky_customers || []).map((customer) => <div className="trend-row" key={customer.customer_id}><span>{customer.customer_name} ({customer.customer_id})</span><strong>{customer.high_risk_count} alerts</strong></div>)}
          </div>
        </div>
      </div>

      <div className="card list-card">
        <div className="section-header">
          <h3>Recent Alerts</h3>
          <button className="link-btn" type="button" onClick={() => navigate('/alerts')}>View all</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Risk</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentAlerts?.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.customer}</td>
                  <td>₹{Number(alert.amount).toLocaleString('en-IN')}</td>
                  <td><span className={`risk-badge ${alert.risk === 'HIGH' ? 'risk-high' : alert.risk === 'MEDIUM' ? 'risk-medium' : 'risk-low'}`}>{alert.risk}</span></td>
                  <td>{alert.score}/100</td>
                  <td><button className="link-btn" type="button" onClick={() => navigate('/investigation', { state: { transactionId: alert.id } })}>Investigate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
