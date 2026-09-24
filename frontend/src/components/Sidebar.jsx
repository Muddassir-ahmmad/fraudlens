const navItems = [
  { label: 'Dashboard', icon: '▣', path: '/dashboard' },
  { label: 'Payment', icon: '₹', path: '/payment' },
  { label: 'History', icon: '◷', path: '/history' },
  { label: 'Fraud Alerts', icon: '⚠', path: '/alerts' },
  { label: 'Investigation', icon: '⌕', path: '/investigation' },
  { label: 'Simulator', icon: '◫', path: '/simulator' },
  { label: 'Analytics', icon: '▥', path: '/analytics' },
  { label: 'Settings', icon: '⚙', path: '/settings' },
];

export default function Sidebar({ activePath, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div className="brand-text">FraudLens</div>
      </div>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
