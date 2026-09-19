import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 8 }}>
          <div className="brand-mark">F</div>
          <div className="brand-text">FraudLens</div>
        </div>

        <h1>Investigator Login</h1>
        <p className="muted">Secure access to payment risk monitoring</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Employee ID / Username</label>
            <input id="username" type="text" defaultValue="INV-2048" />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" defaultValue="password" />
          </div>

          <button type="submit" className="btn btn-primary login-actions">Sign In</button>
        </form>
      </div>
    </div>
  );
}
