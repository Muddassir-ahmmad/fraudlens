import { useMemo, useState } from 'react';
import { simulateTransaction } from '../services/api';
import ScenarioButton from '../components/ScenarioButton';
import RiskFactorList from '../components/RiskFactorList';

const scenarios = {
  'Normal Transaction': {
    userId: 'CUST-004',
    amount: 4800,
    location: 'Mumbai',
    deviceId: 'iPhone 12',
    merchant: 'Uber',
    transactionType: 'Wallet Transfer',
    date: '2026-09-19',
    time: '15:10',
  },
  'High Amount': {
    userId: 'CUST-001',
    amount: 500000,
    location: 'Bengaluru',
    deviceId: 'Android 13',
    merchant: 'Paytm',
    transactionType: 'UPI',
    date: '2026-09-19',
    time: '02:30',
  },
  'New Device': {
    userId: 'CUST-002',
    amount: 45000,
    location: 'Hyderabad',
    deviceId: 'Samsung X',
    merchant: 'PhonePe',
    transactionType: 'Wallet',
    date: '2026-09-19',
    time: '19:40',
  },
  'Unusual Location': {
    userId: 'CUST-003',
    amount: 8100,
    location: 'Dubai',
    deviceId: 'Laptop-ACM',
    merchant: 'Amazon Pay',
    transactionType: 'International Transfer',
    date: '2026-09-19',
    time: '04:05',
  },
  'Unusual Time': {
    userId: 'CUST-001',
    amount: 22000,
    location: 'Bengaluru',
    deviceId: 'Android 13',
    merchant: 'GPay',
    transactionType: 'UPI',
    date: '2026-09-19',
    time: '03:15',
  },
  'Rapid Transactions': {
    userId: 'CUST-005',
    amount: 32000,
    location: 'Delhi',
    deviceId: 'Samsung A54',
    merchant: 'Paytm',
    transactionType: 'Quick Pay',
    date: '2026-09-19',
    time: '00:40',
  },
  'Multiple Risk Factors': {
    userId: 'CUST-001',
    amount: 420000,
    location: 'Kolkata',
    deviceId: 'Unknown Device',
    merchant: 'UPI Lite',
    transactionType: 'UPI',
    date: '2026-09-19',
    time: '02:05',
  },
};

const blankForm = {
  userId: '',
  amount: '',
  location: '',
  deviceId: '',
  merchant: '',
  transactionType: '',
  date: '',
  time: '',
};

export default function SimulatorPage() {
  const [form, setForm] = useState(blankForm);
  const [result, setResult] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('High Amount');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyScenario = (name) => {
    setSelectedScenario(name);
    setForm(scenarios[name]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const output = await simulateTransaction(form);
    setResult(output);
    setLoading(false);
  };

  const scoreLabel = useMemo(() => {
    if (!result) return '';
    return result.riskLevel === 'HIGH' ? 'HIGH' : result.riskLevel === 'MEDIUM' ? 'MEDIUM' : 'LOW';
  }, [result]);

  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Risk Simulation</div>
          <h2>Transaction Simulator</h2>
        </div>
      </div>

      <div className="card list-card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <h3>Scenario Generator</h3>
        </div>
        <div className="tag-row">
          {Object.keys(scenarios).map((key) => (
            <ScenarioButton key={key} label={key} active={selectedScenario === key} onClick={() => applyScenario(key)} />
          ))}
        </div>
      </div>

      <div className="grid-two">
        <div className="card list-card">
          <div className="section-header">
            <h3>Transaction Input</h3>
          </div>

          <div className="info-grid">
            <div className="field">
              <label>User ID</label>
              <input value={form.userId} onChange={(e) => updateField('userId', e.target.value)} />
            </div>
            <div className="field">
              <label>Transaction Amount</label>
              <input value={form.amount} onChange={(e) => updateField('amount', e.target.value)} />
            </div>
            <div className="field">
              <label>Location</label>
              <input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
            </div>
            <div className="field">
              <label>Device ID</label>
              <input value={form.deviceId} onChange={(e) => updateField('deviceId', e.target.value)} />
            </div>
            <div className="field">
              <label>Merchant</label>
              <input value={form.merchant} onChange={(e) => updateField('merchant', e.target.value)} />
            </div>
            <div className="field">
              <label>Transaction Type</label>
              <input value={form.transactionType} onChange={(e) => updateField('transactionType', e.target.value)} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div className="field">
              <label>Time</label>
              <input type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
            </div>
          </div>

          <div className="action-row" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={handleAnalyze} type="button">{loading ? 'Analyzing...' : 'Analyze Transaction'}</button>
            <button className="btn btn-secondary" onClick={() => setForm(blankForm)} type="button">Clear</button>
          </div>
        </div>

        <div className="card list-card">
          <div className="section-header">
            <h3>Risk Result Panel</h3>
          </div>

          {!result ? (
            <div className="empty-state">No transaction analyzed yet.</div>
          ) : (
            <>
              <div className="info-grid">
                <div className="info-item"><span className="k">Risk Score</span><span className="v">{result.riskScore} / 100</span></div>
                <div className="info-item"><span className="k">Risk Level</span><span className="v"><span className={`risk-badge ${scoreLabel === 'HIGH' ? 'risk-high' : scoreLabel === 'MEDIUM' ? 'risk-medium' : 'risk-low'}`}>{scoreLabel}</span></span></div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div className="kicker">Contributing reasons</div>
                <RiskFactorList reasons={result.reasons || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
