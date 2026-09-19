import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAlerts, getCustomerTimeline, getCustomerTransactions, getTransactionById, postAlertAction } from '../services/api';
import { mockTransactions, mockCustomerHistory } from '../data/mockData';
import RiskBadge from '../components/RiskBadge';
import RiskFactorList from '../components/RiskFactorList';
import TransactionTimeline from '../components/TransactionTimeline';

const actionOptions = ['Allow', 'Request Verification', 'Under Review', 'Simulated Restriction'];
const callOutcomeOptions = ['Not attempted', 'Call attempted', 'Customer verified', 'Customer unavailable', 'Wrong number'];

export default function InvestigationPage() {
  const location = useLocation();
  const transactionId = location.state?.transactionId || 'TXN-1048';

  const [transaction, setTransaction] = useState(null);
  const [alertId, setAlertId] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('New');
  const [actionError, setActionError] = useState('');
  const [callStatus, setCallStatus] = useState('Not attempted');
  const [verificationNotes, setVerificationNotes] = useState('No verification call logged yet.');
  const [followUpText, setFollowUpText] = useState('Call customer to confirm whether the transfer was authorized.');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const selected = await getTransactionById(transactionId) || mockTransactions.find((item) => item.id === transactionId) || mockTransactions[0];
      setTransaction(selected);
      setStatus(selected.status || 'New');

      const [customerTransactions, customerTimeline, alerts] = await Promise.all([
        getCustomerTransactions(selected.customerId).catch(() => null),
        getCustomerTimeline(selected.customerId).catch(() => null),
        getAlerts().catch(() => null),
      ]);
      const customerHistory = customerTransactions?.length ? customerTransactions.map((item) => ({
        date: item.dateTime,
        amount: item.amount,
        label: item.type,
        risk: item.risk,
      })) : mockCustomerHistory[selected.customerId] || (selected.history || []).map((amount, index) => ({
          date: `2026-09-${index + 10}`,
          amount,
          label: 'Received',
          risk: index === selected.history.length - 1 ? 'HIGH' : 'LOW',
        }));

      setHistory(customerHistory);
      setTimeline(customerTimeline?.length ? customerTimeline : selected.timeline || customerHistory.map((item) => ({
        date: item.date,
        amount: item.amount,
        risk: item.risk,
        high: item.risk === 'HIGH',
      })));
      setAlertId(alerts?.find((alert) => alert.transactionId === selected.id)?.id || null);
      setLoading(false);
    };

    load();
  }, [transactionId]);

  if (loading || !transaction) {
    return <div className="page"><div className="empty-state">Loading investigation details…</div></div>;
  }

  const handleAction = async (action) => {
    if (!alertId) {
      setActionError('No backend alert is linked to this transaction.');
      return;
    }
    const actionMap = {
      Allow: 'ALLOW',
      'Request Verification': 'REQUEST_VERIFICATION',
      'Under Review': 'UNDER_REVIEW',
      'Simulated Restriction': 'SIMULATED_RESTRICTION',
    };
    const backendAction = actionMap[action];
    setActionError('');
    const response = await postAlertAction(alertId, backendAction);
    if (response?.status === 'updated' && response?.action === backendAction) {
      setActionError('The backend did not accept this action.');
      return;
    }
    setStatus(action === 'Allow' ? 'Resolved' : action === 'Request Verification' ? 'Verification Pending' : action === 'Under Review' ? 'Under Review' : 'Restricted - Simulated');

    if (action === 'Request Verification') {
      setCallStatus('Call attempted');
      setFollowUpText('Customer callback requested for transaction confirmation.');
    }
  };

  const handleCallCustomer = () => {
    setCallStatus('Call attempted');
    setVerificationNotes('Investigator attempted verification call to the customer. Customer needs to confirm the transaction or provide details.');
    setFollowUpText('Ask customer whether they initiated the transfer and whether the device/location is familiar.');
    setStatus('Verification Pending');
  };

  const handleCustomerVerified = () => {
    setCallStatus('Customer verified');
    setVerificationNotes('Customer confirmed the transaction was legitimate. Documentation and follow-up required before closure.');
    setFollowUpText('Document customer confirmation and proceed with final review.');
    setStatus('Customer Confirmed');
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
          <h3>Customer Verification</h3>
        </div>

        <div className="info-grid" style={{ marginBottom: 16 }}>
          <div className="info-item"><span className="k">Customer</span><span className="v">{transaction.customer}</span></div>
          <div className="info-item"><span className="k">Contact</span><span className="v">+91 98765 43210</span></div>
          <div className="info-item"><span className="k">Verification Status</span><span className="v">{callStatus}</span></div>
          <div className="info-item"><span className="k">Best Next Step</span><span className="v">{followUpText}</span></div>
        </div>

        <div className="field">
          <label>Call outcome</label>
          <select value={callStatus} onChange={(event) => setCallStatus(event.target.value)}>
            {callOutcomeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label>Investigator notes</label>
          <textarea value={verificationNotes} onChange={(event) => setVerificationNotes(event.target.value)} rows={4} />
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label>Follow-up action</label>
          <input value={followUpText} onChange={(event) => setFollowUpText(event.target.value)} />
        </div>

        <div className="action-row" style={{ marginTop: 18 }}>
          <button type="button" className="btn btn-primary" onClick={handleCallCustomer}>Call Customer</button>
          <button type="button" className="btn btn-success" onClick={handleCustomerVerified}>Verified by Customer</button>
          <button type="button" className="btn btn-warning" onClick={() => {
            setCallStatus('Customer unavailable');
            setVerificationNotes('Customer unavailable at the moment; callback requested for a follow-up call.');
            setFollowUpText('Schedule callback and escalate if the customer does not respond within 2 hours.');
            setStatus('Awaiting Callback');
          }}>Request Callback</button>
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
        {actionError && <div className="empty-state" style={{ marginTop: 16 }}>{actionError}</div>}
      </div>
    </div>
  );
}
