export default function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase().replace(/\s+/g, '-');
  const className = normalized === 'new' ? 'status-new' : normalized === 'investigating' ? 'status-investigating' : normalized === 'resolved' ? 'status-resolved' : 'status-flagged';
  return <span className={`status-badge ${className}`}>{status}</span>;
}
