export default function RiskBadge({ level }) {
  const normalized = String(level || '').toUpperCase();
  const className = normalized === 'HIGH' ? 'risk-high' : normalized === 'MEDIUM' ? 'risk-medium' : 'risk-low';
  return <span className={`risk-badge ${className}`}>{normalized}</span>;
}
