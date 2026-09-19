export default function StatCard({ label, value, trend, tone = 'neutral' }) {
  return (
    <div className="card stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="trend" style={{ color: tone === 'danger' ? '#b91c1c' : '#64748b' }}>{trend}</div>
    </div>
  );
}
