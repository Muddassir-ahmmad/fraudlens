export default function Topbar({ title, searchValue, onSearchChange, onLogout, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <input
          className="topbar-search"
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
        />
        <div className="user-pill">
          <span>👤</span>
          <span>Bank Investigator</span>
        </div>
        <button
          className="theme-button"
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="logout-button" type="button" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
