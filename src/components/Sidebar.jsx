const navItems = [
  { label: 'Dashboard', icon: '▣', path: '/dashboard' },
  { label: 'Transactions', icon: '⇄', path: '/transactions' },
  { label: 'Fraud Alerts', icon: '⚠', path: '/alerts' },
  { label: 'Investigation', icon: '⌕', path: '/investigation' },
  { label: 'Simulator', icon: '◫', path: '/simulator' },
  { label: 'Analytics', icon: '◭', path: '/analytics' },
  { label: 'Settings', icon: '⚙', path: '/settings' },
];

export default function Sidebar({ active, onNavigate }) {
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
            className={`nav-item ${active === item.label ? 'active' : ''}`}
            onClick={() => onNavigate(item.path, item.label)}
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
