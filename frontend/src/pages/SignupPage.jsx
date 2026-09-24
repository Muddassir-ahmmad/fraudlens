import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage() {
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
        <h1>Create investigator account</h1>
        <p className="muted">Set up secure access to payment risk monitoring</p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="full-name">Full name</label>
            <input id="full-name" type="text" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="signup-email">Work email</label>
            <input id="signup-email" type="email" placeholder="name@company.com" required />
          </div>
          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" placeholder="Create a password" required />
          </div>
          <button type="submit" className="btn btn-primary login-actions">Create account</button>
        </form>
        <p className="auth-switch muted">Already have an account? <Link to="/">Sign in</Link></p>
      </div>
    </div>
  );
}