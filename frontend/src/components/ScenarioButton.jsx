export default function ScenarioButton({ label, onClick, active }) {
  return (
    <button
      type="button"
      className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
      onClick={onClick}
      style={{ minWidth: 140 }}
    >
      {label}
    </button>
  );
}
