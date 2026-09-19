import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTransactionById, getCustomerTransactions, getCustomerTimeline, patchAlert, postAlertAction } from '../services/api';
import { mockTransactions, mockCustomerHistory } from '../data/mockData';
import RiskBadge from '../components/RiskBadge';
import RiskFactorList from '../components/RiskFactorList';
import TransactionTimeline from '../components/TransactionTimeline';

const actionOptions = ['Allow', 'Request Verification', 'Under Review', 'Simulated Restriction'];

export default function InvestigationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId || 'TXN-1048';

  const [transaction, setTransaction] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('New');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const selected = mockTransactions.find((item) => item.id === transactionId) || mockTransactions[0];
      setTransaction(selected);
      setStatus(selected.status || 'New');

      const customerHistory = mockCustomerHistory[selected.customerId] || selected.history.map((amount, index) => ({
        date: `2026-09-${index + 10}`,
        amount,
        label: 'Received',
        risk: index === selected.history.length - 1 ? 'HIGH' : 'LOW',
      }));

      setHistory(customerHistory);
      setTimeline(selected.timeline || customerHistory.map((item) => ({
        date: item.date,
        amount: item.amount,
        risk: item.risk,
        high: item.risk === 'HIGH',
      })));
      setLoading(false);
    };

    load();
  }, [transactionId]);

  if (loading || !transaction) {
    return <div className="page"><div className="empty-state">Loading investigation details…</div></div>;
  }

  const handleAction = async (action) => {
    await patchAlert('ALRT-201', action);
    await postAlertAction('ALRT-201', action);
    setStatus(action === 'Allow' ? 'Resolved' : action === 'Request Verification' ? 'Investigating' : action === 'Under Review' ? 'Investigating' : 'Resolved');
  };

  return (
    <div className="page">
      <div className="section-header page-header">
        <div>
          <div className="kicker">Investigation</div>
          <h2>Case Review</h2>
        </div>
        <div className="tag-row">
          <RiskBadge level={transaction.risk} />
          <span className="status-badge status-investigating">{status}</span>
        </div>
      </div>

      <div className="status-bar">
        <div>
          <strong>{transaction.customer}</strong>
          <div className="muted">{transaction.customerId}</div>
        </div>
        <div>
          <strong>Alert Status:</strong> {status}
        </div>
      </div>

      <div className="two-col details-panel">
        <div className="card list-card">
          <div className="section-header">
            <h3>Transaction Overview</h3>
          </div>

          <div className="info-grid">
            <div className="info-item"><span className="k">Transaction ID</span><span className="v">{transaction.id}</span></div>
            <div className="info-item"><span className="k">User ID</span><span className="v">{transaction.customerId}</span></div>
            <div className="info-item"><span className="k">Amount</span><span className="v">₹{Number(transaction.amount).toLocaleString('en-IN')}</span></div>
            <div className="info-item"><span className="k">Merchant</span><span className="v">{transaction.merchant}</span></div>
            <div className="info-item"><span className="k">Location</span><span className="v">{transaction.location}</span></div>
            <div className="info-item"><span className="k">Device</span><span className="v">{transaction.device}</span></div>
            <div className="info-item"><span className="k">Timestamp</span><span className="v">{new Date(transaction.dateTime).toLocaleString('en-IN')}</span></div>
            <div className="info-item"><span className="k">Sender</span><span className="v">{transaction.sender}</span></div>
          </div>
        </div>

        <div className="card list-card">
          <div className="section-header">
            <h3>Risk Assessment</h3>
          </div>
          <div className="info-grid" style={{ marginBottom: 16 }}>
            <div className="info-item"><span className="k">Risk Score</span><span className="v">{transaction.riskScore}/100</span></div>
            <div className="info-item"><span className="k">Risk Level</span><span className="v"><RiskBadge level={transaction.risk} /></span></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className="kicker">Why was this flagged?</div>
          </div>
          <RiskFactorList reasons={transaction.reasons || []} />
        </div>
      </div>

      <div className="grid-two" style={{ marginTop: 20 }}>
        <div className="card list-card">
          <div className="section-header">
            <h3>Customer History</h3>
          </div>
          <div className="timeline">
            {history.map((item, index) => (
              <div key={`${item.date}-${index}`} className={`timeline-item ${item.risk === 'HIGH' ? 'high' : 'low'}`}>
                <div className="time">{item.date}</div>
                <div className="amount">₹{Number(item.amount).toLocaleString('en-IN')}</div>
                <div><span className={`risk-badge ${item.risk === 'HIGH' ? 'risk-high' : 'risk-low'}`}>{item.risk}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card list-card">
          <div className="section-header">
            <h3>Transaction Timeline</h3>
          </div>
          <TransactionTimeline timeline={timeline} />
        </div>
      </div>

      <div className="card list-card" style={{ marginTop: 20 }}>
        <div className="section-header">
          <h3>Investigation Actions</h3>
        </div>
        <div className="action-row">
          {actionOptions.map((action) => (
            <button key={action} type="button" className={
              action === 'Allow' ? 'btn btn-success' :
              action === 'Request Verification' ? 'btn btn-warning' :
              action === 'Under Review' ? 'btn btn-secondary' : 'btn btn-danger'
            } onClick={() => handleAction(action)}>{action}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
