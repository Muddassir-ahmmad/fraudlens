import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockSummaryChart, mockActivity } from '../data/mockData';

const pieColors = ['#0f172a', '#f59e0b', '#dc2626'];

export default function AnalyticsPage() {
  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Insights</div>
          <h2>Fraud Analytics</h2>
        </div>
      </div>

      <div className="grid-two">
        <div className="card chart-card">
          <h3>Risk Level Distribution</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={mockSummaryChart} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80}>
                  {mockSummaryChart.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3>High-Risk Transactions Over Time</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={mockActivity}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
