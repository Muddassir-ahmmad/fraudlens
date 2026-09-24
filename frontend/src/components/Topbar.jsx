export default function Topbar({ title, searchValue, onSearchChange }) {
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
      </div>
    </header>
  );
}
