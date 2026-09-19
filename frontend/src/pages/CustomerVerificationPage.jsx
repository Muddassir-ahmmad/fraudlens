import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVerificationForCustomer, submitVerificationResponse } from '../services/api';

const responseOptions = [
  { value: 'PAYMENT_VALID', label: 'Payment was valid', icon: '✓' },
  { value: 'PAYMENT_NOT_AUTHORIZED', label: 'I did not make this payment', icon: '×' },
  { value: 'CUSTOMER_NEEDS_HELP', label: 'I need help', icon: '?' },
];

const formatAmount = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

export default function CustomerVerificationPage() {
  const { customerId = 'CUST001' } = useParams();
  const [verification, setVerification] = useState(null);
  const [callState, setCallState] = useState('loading');
  const [error, setError] = useState('');
  const [speechAvailable, setSpeechAvailable] = useState(true);

  useEffect(() => {
    const load = async () => {
      const request = await getVerificationForCustomer(customerId);
      setVerification(request);
      setCallState(request ? (request.status === 'COMPLETED' ? 'completed' : 'request') : 'none');
    };
    load();
  }, [customerId]);

  const spokenMessage = useMemo(() => {
    if (!verification) return '';
    const amount = Number(verification.amount).toLocaleString('en-IN');
    return `Hello ${verification.customer_name || 'there'}. FraudLens is calling to verify your recent payment of ${amount} rupees to ${verification.recipient}. Was this payment made by you?`;
  }, [customerId, verification]);

  const answerCall = () => {
    setError('');
    setCallState('speaking');
    if (!('speechSynthesis' in window)) {
      setSpeechAvailable(false);
      setCallState('respond');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spokenMessage);
    utterance.onend = () => setCallState('respond');
    utterance.onerror = () => {
      setSpeechAvailable(false);
      setCallState('respond');
    };
    window.speechSynthesis.speak(utterance);
  };

  const submitResponse = async (response) => {
    if (!verification || verification.status === 'COMPLETED') return;
    setError('');
    const saved = await submitVerificationResponse(verification.verification_id, response);
    if (!saved) {
      setError('Unable to record your response. Please try again.');
      return;
    }
    setVerification(saved);
    setCallState('completed');
  };

  return (
    <div className="verification-shell">
      <header className="verification-header">
        <a className="customer-brand" href="/pay"><span className="brand-mark">F</span><span>FraudLens Verification</span></a>
        <span className="customer-badge">Simulated voice verification</span>
      </header>
      <main className="verification-main">
        {callState === 'loading' && <div className="verification-card"><div className="customer-empty">Checking for verification requests...</div></div>}
        {callState === 'none' && <div className="verification-card"><div className="verification-icon">✓</div><h1>No verification request</h1><p>Your customer account has no pending payment verification.</p><a className="customer-send-button verification-link" href="/pay">Return to payment demo</a></div>}
        {verification && callState !== 'none' && <div className="verification-card">
          <div className="verification-icon">{callState === 'completed' ? '✓' : '☎'}</div>
          <div className="kicker">FraudLens Verification</div>
          <h1>{callState === 'completed' ? 'Verification completed' : callState === 'speaking' ? 'Verification call in progress...' : callState === 'respond' ? 'Please confirm this payment' : 'Incoming Verification Call'}</h1>
          <p>{callState === 'completed' ? 'Your response has been recorded. The investigator will make the final decision.' : 'FraudLens is requesting verification for your recent payment.'}</p>

          <div className="verification-payment">
            <div><span>Amount</span><strong>{formatAmount(verification.amount)}</strong></div>
            <div><span>Recipient</span><strong>{verification.recipient}</strong></div>
            <div><span>Risk</span><strong className="verification-risk">{verification.risk_level}</strong></div>
          </div>

          {callState === 'request' && <button type="button" className="customer-send-button" onClick={answerCall}>Answer Call</button>}
          {callState === 'speaking' && <div className="verification-speaking"><strong>🔊 Speaking...</strong><p>“{spokenMessage}”</p></div>}
          {callState === 'respond' && <div className="verification-response"><p>{speechAvailable ? 'Please choose a response:' : 'Voice playback is unavailable. Please read the message below and choose a response:'}</p><div className="verification-response-options">{responseOptions.map((option) => <button key={option.value} type="button" onClick={() => submitResponse(option.value)}><span>{option.icon}</span>{option.label}</button>)}</div></div>}
          {callState === 'completed' && <div className="verification-complete">Response recorded: <strong>{verification.customer_response}</strong><small>{verification.responded_at && new Date(verification.responded_at).toLocaleString('en-IN')}</small></div>}
          {error && <div className="customer-error">{error}</div>}
        </div>}
      </main>
    </div>
  );
}
