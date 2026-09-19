const navItems = [
  { label: 'Dashboard', icon: '▣', path: '/dashboard' },
  { label: 'Transactions', icon: '⇄', path: '/transactions' },
  { label: 'Fraud Alerts', icon: '⚠', path: '/alerts' },
  { label: 'Investigation', icon: '⌕', path: '/investigation' },
  { label: 'Simulator', icon: '◫', path: '/simulator' },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <button className="brand brand-button" type="button" onClick={() => onNavigate('/dashboard', 'Dashboard')} aria-label="Go to dashboard">
        <div className="brand-mark">F</div>
        <div className="brand-text">FraudLens</div>
      </button>

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
