import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

const normalizeTransaction = (transaction) => ({
  ...transaction,
  id: transaction.transaction_id,
  customer: transaction.receiver || transaction.customer_id,
  customerId: transaction.customer_id,
  dateTime: transaction.timestamp,
  risk: transaction.risk_level,
  riskScore: transaction.risk_score,
  reasons: transaction.risk_reasons || [],
  riskFactors: transaction.risk_factors || [],
  type: transaction.transaction_type,
  history: [],
});

export const payTransaction = async (payload) => {
  try {
    const { data } = await api.post('/api/transactions/pay', {
      customer_id: payload.customerId,
      recipient: payload.recipient,
      recipient_type: payload.recipientType,
      amount: Number(payload.amount),
      timestamp: payload.timestamp,
    });
    return {
      ...data,
      riskScore: data.risk_score,
      riskLevel: data.risk_level,
      reasons: data.risk_reasons || [],
      riskFactors: data.risk_factors || [],
      alertCreated: data.alert_created,
    };
  } catch (error) {
    console.warn('Payment analysis unavailable.', error);
    return null;
  }
};

const normalizeAlert = (alert, transaction) => ({
  ...alert,
  id: alert.alert_id,
  transactionId: alert.transaction_id,
  customer: transaction?.customer || alert.customer_id,
  customerId: alert.customer_id,
  amount: transaction?.amount,
  riskScore: alert.risk_score,
  riskLevel: alert.risk_level,
  createdAt: alert.created_at,
  status: alert.status === 'NEW' ? 'New' : alert.status === 'UNDER_REVIEW' ? 'Investigating' : 'Resolved',
});

export const getDashboardSummary = async () => {
  try {
    const { data } = await api.get('/api/dashboard/summary');
    return {
      totalTransactions: data.total_transactions,
      lowRisk: data.low_risk_count,
      mediumRisk: data.medium_risk_count,
      highRisk: data.high_risk_count,
      newAlerts: data.new_alerts,
      underInvestigation: data.transactions_under_investigation,
      recentAlerts: data.recently_flagged.map(normalizeTransaction).map((transaction) => ({
        id: transaction.id,
        customer: transaction.customer,
        amount: transaction.amount,
        risk: transaction.risk,
        score: transaction.riskScore,
      })),
    };
  } catch (error) {
    console.warn('Falling back to mock dashboard summary data.', error);
    return null;
  }
};

export const getTransactions = async () => {
  try {
    const { data } = await api.get('/api/transactions');
    return data.map(normalizeTransaction);
  } catch (error) {
    console.warn('Falling back to mock transactions data.', error);
    return null;
  }
};

export const getTransactionById = async (transactionId) => {
  try {
    const { data } = await api.get(`/api/transactions/${transactionId}`);
    return normalizeTransaction(data);
  } catch (error) {
    console.warn('Falling back to mock transaction detail data.', error);
    return null;
  }
};

export const getAlerts = async () => {
  try {
    const [{ data: alerts }, { data: transactions }] = await Promise.all([
      api.get('/api/alerts'),
      api.get('/api/transactions'),
    ]);
    const transactionsById = Object.fromEntries(transactions.map((transaction) => [transaction.transaction_id, normalizeTransaction(transaction)]));
    return alerts.map((alert) => normalizeAlert(alert, transactionsById[alert.transaction_id]));
  } catch (error) {
    console.warn('Falling back to mock alerts data.', error);
    return null;
  }
};

export const getAlertById = async (alertId) => {
  try {
    const [{ data: alert }, { data: transactions }] = await Promise.all([
      api.get(`/api/alerts/${alertId}`),
      api.get('/api/transactions'),
    ]);
    const transaction = transactions.find((item) => item.transaction_id === alert.transaction_id);
    return normalizeAlert(alert, transaction && normalizeTransaction(transaction));
  } catch (error) {
    console.warn('Falling back to mock alert detail data.', error);
    return null;
  }
};

export const getCustomerTransactions = async (customerId) => {
  try {
    const { data } = await api.get(`/api/customers/${customerId}/transactions`);
    return data.map(normalizeTransaction);
  } catch (error) {
    console.warn('Falling back to mock customer transaction history.', error);
    return null;
  }
};

export const getCustomerTimeline = async (customerId) => {
  try {
    const { data } = await api.get(`/api/customers/${customerId}/timeline`);
    return data.map((event) => ({
      date: event.timestamp,
      amount: event.amount,
      risk: event.risk_level,
      high: event.risk_level === 'HIGH',
    }));
  } catch (error) {
    console.warn('Falling back to mock customer timeline.', error);
    return null;
  }
};

export const simulateTransaction = async (payload) => {
  try {
    const { data } = await api.post('/api/transactions/simulate', {
      customer_id: payload.userId,
      sender: payload.sender || 'UNKNOWN',
      receiver: payload.receiver || payload.userId,
      amount: Number(payload.amount),
      timestamp: `${payload.date}T${payload.time}:00`,
      location: payload.location,
      device: payload.deviceId,
      merchant: payload.merchant,
      transaction_type: payload.transactionType || 'CREDIT',
    });
    return {
      ...normalizeTransaction(data),
      reasons: data.risk_reasons || [],
    };
  } catch (error) {
    console.warn('Simulation endpoint unavailable. Returning locally mocked response.', error);
    return {
      riskScore: 91,
      riskLevel: 'HIGH',
      reasons: ['Unusual amount', 'Unusual time', 'Unknown sender', 'Historical deviation'],
      transaction: payload,
    };
  }
};

export const patchAlert = async (alertId, status) => {
  try {
    const { data } = await api.patch(`/api/alerts/${alertId}`, { status });
    return data;
  } catch (error) {
    console.warn('Alert update endpoint unavailable. Ignoring client-side update in mock mode.', error);
    return { id: alertId, status };
  }
};

export const postAlertAction = async (alertId, action) => {
  try {
    const { data } = await api.post(`/api/alerts/${alertId}/action`, { action });
    return data;
  } catch (error) {
    console.warn('Alert action endpoint unavailable. Local action accepted.', error);
    return { id: alertId, action, status: 'updated' };
  }
};

export const requestVerification = async (alertId) => {
  try {
    const { data } = await api.post(`/api/alerts/${alertId}/verification-request`);
    return data;
  } catch (error) {
    console.warn('Verification request unavailable.', error);
    return null;
  }
};

export const getAlertVerification = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}/verification`);
    return data;
  } catch (error) {
    console.warn('Alert verification unavailable.', error);
    return null;
  }
};

export const getVerificationForCustomer = async (customerId) => {
  try {
    const { data } = await api.get(`/api/verification/customers/${customerId}`);
    return data;
  } catch (error) {
    console.warn('Customer verification unavailable.', error);
    return null;
  }
};

export const submitVerificationResponse = async (verificationId, response) => {
  try {
    const { data } = await api.post(`/api/verification/${verificationId}/response`, { response });
    return data;
  } catch (error) {
    console.warn('Could not submit verification response.', error);
    return null;
  }
};

export const getAlertActivity = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}/activity`);
    return data;
  } catch (error) {
    console.warn('Investigation activity unavailable.', error);
    return null;
  }
};

export const getAlertNotes = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}/notes`);
    return data;
  } catch (error) {
    console.warn('Investigator notes unavailable.', error);
    return [];
  }
};

export const addAlertNote = async (alertId, content) => {
  try {
    const { data } = await api.post(`/api/alerts/${alertId}/notes`, { content });
    return data;
  } catch (error) {
    console.warn('Could not save investigator note.', error);
    return null;
  }
};

export default api;
