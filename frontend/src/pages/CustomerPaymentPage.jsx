import { useEffect, useState } from 'react';
import { payTransaction } from '../services/api';

const customers = [
  { id: 'CUST001', name: 'Rahul' },
  { id: 'CUST002', name: 'Priya' },
  { id: 'CUST003', name: 'Arjun' },
  { id: 'CUST004', name: 'Aisha Khan' },
];

const normalPayment = {
  recipient: 'Rahul',
  recipientType: 'KNOWN',
  amount: '5000',
  timestamp: '2026-09-19T15:00:00',
};

const suspiciousPayment = {
  recipient: 'New Recipient',
  recipientType: 'UNKNOWN',
  amount: '500000',
  timestamp: '2026-09-19T02:30:00',
};

export default function CustomerPaymentPage() {
  const [customerId, setCustomerId] = useState('CUST001');
  const [form, setForm] = useState(normalPayment);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const customer = customers.find((item) => item.id === customerId) || customers[0];

  useEffect(() => {
    setResult(null);
    setError('');
  }, [customerId]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const applyScenario = (scenario) => {
    setForm(scenario);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!form.recipient.trim()) {
      setError('Enter a recipient before sending.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    const response = await payTransaction({ customerId, ...form, amount });
    if (response) setResult(response);
    else setError('Unable to analyze transaction. Please try again.');
    setLoading(false);
  };

  return (
    <div className="customer-shell">
      <header className="customer-header">
        <button className="customer-brand" type="button" onClick={() => window.location.assign('/')}>
          <span className="brand-mark">F</span>
          <span>FraudLens Pay</span>
        </button>
        <span className="customer-badge">Simulated payment demo</span>
      </header>

      <main className="customer-main">
        <section className="customer-intro">
          <div className="kicker">Customer payment</div>
          <h1>Send money with a quick safety check.</h1>
          <p>FraudLens analyzes this simulated payment instantly. No real money is moved.</p>
        </section>

        <div className="customer-grid">
          <form className="customer-payment-card" onSubmit={handleSubmit}>
            <div className="customer-card-header">
              <div><span className="customer-label">Paying from</span><h2>{customer.name}</h2><span className="muted">{customer.id}</span></div>
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} aria-label="Select customer">
                {customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>

            <div className="scenario-row">
              <button type="button" onClick={() => applyScenario(normalPayment)}>Normal payment</button>
              <button type="button" onClick={() => applyScenario(suspiciousPayment)}>Suspicious demo</button>
            </div>

            <label className="customer-field"><span>Recipient</span><input value={form.recipient} onChange={(event) => update('recipient', event.target.value)} /></label>
            <label className="customer-field"><span>Recipient type</span><select value={form.recipientType} onChange={(event) => update('recipientType', event.target.value)}><option value="KNOWN">Known recipient</option><option value="UNKNOWN">New / unknown recipient</option></select></label>
            <label className="customer-field"><span>Amount</span><div className="amount-input"><span>INR</span><input type="number" min="1" step="1" value={form.amount} onChange={(event) => update('amount', event.target.value)} /></div></label>

            <button className="customer-send-button" type="submit" disabled={loading}>{loading ? 'Analyzing transaction...' : 'Send Money'}</button>
            {error && <div className="customer-error">{error}</div>}
          </form>

          <section className="customer-result-card">
            <div className="customer-card-header"><div><span className="customer-label">FraudLens analysis</span><h2>Payment result</h2></div><span className="analysis-dot" /></div>
            {!result && !loading && <div className="customer-empty">Choose a scenario or enter payment details, then send the money to see the backend decision.</div>}
            {loading && <div className="customer-empty customer-loading">Analyzing transaction...</div>}
            {result && <div className="customer-result">
              <div className={`customer-risk customer-risk-${result.riskLevel.toLowerCase()}`}><strong>{result.riskLevel === 'HIGH' ? '⚠ Suspicious transaction' : result.riskLevel === 'MEDIUM' ? 'Review recommended' : '✓ Transaction appears normal'}</strong><span>{result.riskScore}/100</span></div>
              <div className="customer-result-grid"><div><span className="customer-label">Risk level</span><strong>{result.riskLevel}</strong></div><div><span className="customer-label">Status</span><strong>{result.status === 'REQUIRES_REVIEW' ? 'Requires review' : 'Transaction approved'}</strong></div><div><span className="customer-label">Alert</span><strong>{result.alertCreated ? 'Investigator alerted' : 'No alert created'}</strong></div></div>
              <h3>Why was this flagged?</h3>
              <ul className="customer-reasons">{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              {result.riskFactors.length > 0 && <div className="customer-factors">{result.riskFactors.map((factor) => <div key={`${factor.name}-${factor.score}`}><span>{factor.name}</span><strong>+{factor.score}</strong></div>)}</div>}
              {result.riskLevel === 'HIGH' && <p className="customer-review-note">This is a high-risk signal, not a certainty of fraud. An investigator must make the final decision.</p>}
              {result.riskLevel === 'HIGH' && <a className="verification-demo-link" href={`/verify/${customerId}`}>Open customer verification screen</a>}
            </div>}
          </section>
        </div>
      </main>
    </div>
  );
}
