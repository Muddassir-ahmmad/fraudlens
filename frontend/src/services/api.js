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

const normalizeAlert = (alert, transaction) => ({
  ...alert,
  id: alert.alert_id,
  transactionId: alert.transaction_id,
  customer: transaction?.customer || alert.customer_name || alert.customer_id,
  customerId: alert.customer_id,
  amount: transaction?.amount ?? alert.amount,
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

export const getTransactions = async (params = {}) => {
  try {
    const { data } = await api.get('/api/transactions', { params });
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

export const getAlerts = async (params = {}) => {
  try {
    const { data: alerts } = await api.get('/api/alerts', { params });
    return alerts.map((alert) => normalizeAlert(alert));
  } catch (error) {
    console.warn('Falling back to mock alerts data.', error);
    return null;
  }
};

export const getAlertById = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}`);
    return normalizeAlert(data);
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

export const getCustomerProfile = async (customerId) => {
  try {
    const { data } = await api.get(`/api/customers/${customerId}/profile`);
    return {
      ...data,
      transactions: data.transactions.map(normalizeTransaction),
      previousAlerts: data.previous_alerts.map((alert) => normalizeAlert(alert)),
      timeline: data.timeline.map((event) => ({
        date: event.timestamp,
        amount: event.amount,
        risk: event.risk_level,
        high: event.risk_level === 'HIGH',
      })),
      riskHistory: data.risk_history,
    };
  } catch (error) {
    console.warn('Customer profile unavailable.', error);
    return null;
  }
};

export const getDashboardAnalytics = async () => {
  try {
    const { data } = await api.get('/api/dashboard/analytics');
    return data;
  } catch (error) {
    console.warn('Dashboard analytics unavailable.', error);
    return null;
  }
};

export const openAlert = async (alertId) => {
  try {
    const { data } = await api.post(`/api/alerts/${alertId}/open`);
    return data;
  } catch (error) {
    console.warn('Could not record investigation open event.', error);
    return null;
  }
};

export const getAlertNotes = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}/notes`);
    return data;
  } catch (error) {
    console.warn('Investigator notes unavailable.', error);
    return null;
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

export const getAlertActivity = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}/activity`);
    return data;
  } catch (error) {
    console.warn('Investigation activity unavailable.', error);
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
      riskFactors: data.risk_factors || [],
      alertCreated: data.risk_level === 'HIGH',
    };
  } catch (error) {
    console.warn('Simulation endpoint unavailable.', error);
    return null;
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

export default api;
