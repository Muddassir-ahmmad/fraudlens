import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getDashboardSummary } from '../services/api';
import { mockDashboard, mockSummaryChart, mockActivity } from '../data/mockData';
import StatCard from '../components/StatCard';

const chartColors = ['#0f172a', '#f59e0b', '#dc2626'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getDashboardSummary();
      setSummary(data || mockDashboard);
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
                <Pie data={mockSummaryChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
                  {mockSummaryChart.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index]} />
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
              <BarChart data={mockActivity}>
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
