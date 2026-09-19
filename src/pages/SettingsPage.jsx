export default function SettingsPage() {
  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Configuration</div>
          <h2>Settings</h2>
        </div>
      </div>

      <div className="card list-card">
        <div className="info-grid">
          <div className="info-item"><span className="k">Backend URL</span><span className="v">{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</span></div>
          <div className="info-item"><span className="k">Mode</span><span className="v">Mock + API-ready</span></div>
          <div className="info-item"><span className="k">Investigator</span><span className="v">Bank Fraud Unit</span></div>
          <div className="info-item"><span className="k">Status</span><span className="v">Prototype</span></div>
        </div>
      </div>
    </div>
  );
}
