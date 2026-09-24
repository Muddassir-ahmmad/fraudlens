import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

const normalizeTransaction = (transaction) => ({
  ...transaction,
  id: transaction.transaction_id ?? transaction.id,
  customer: transaction.receiver ?? transaction.customer_id ?? transaction.customer,
  customerId: transaction.customer_id ?? transaction.customerId,
  dateTime: transaction.timestamp ?? transaction.dateTime,
  risk: transaction.risk_level ?? transaction.risk,
  riskScore: transaction.risk_score ?? transaction.riskScore,
  reasons: transaction.risk_reasons ?? transaction.reasons ?? [],
  status: transaction.status ?? 'COMPLETED',
  type: transaction.transaction_type ?? transaction.type,
});

const normalizeAlert = (alert) => ({
  ...alert,
  id: alert.alert_id ?? alert.id,
  transactionId: alert.transaction_id ?? alert.transactionId,
  customerId: alert.customer_id ?? alert.customerId,
  customer: alert.customer ?? alert.customer_id,
  riskScore: alert.risk_score ?? alert.riskScore,
  riskLevel: alert.risk_level ?? alert.riskLevel,
  createdAt: alert.created_at ?? alert.createdAt,
  status: alert.status === 'NEW' ? 'New' : alert.status === 'UNDER_REVIEW' ? 'Investigating' : alert.status,
  reasons: alert.reasons ?? [],
});

const alertStatusValue = (status) => ({
  New: 'NEW',
  Investigating: 'UNDER_REVIEW',
  Resolved: 'RESOLVED',
}[status] ?? status);

const alertActionValue = (action) => ({
  Allow: 'ALLOW',
  'Request Verification': 'REQUEST_VERIFICATION',
  'Under Review': 'UNDER_REVIEW',
  'Simulated Restriction': 'SIMULATED_RESTRICTION',
}[action] ?? action);

export const getDashboardSummary = async () => {
  try {
    const { data } = await api.get('/api/dashboard/summary');
    return {
      ...data,
      totalTransactions: data.total_transactions,
      lowRisk: data.low_risk_count,
      mediumRisk: data.medium_risk_count,
      highRisk: data.high_risk_count,
      newAlerts: data.new_alerts,
      underInvestigation: data.transactions_under_investigation,
      recentAlerts: (data.recently_flagged ?? []).map(normalizeTransaction),
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
    const [{ data: alertData }, { data: transactionData }] = await Promise.all([
      api.get('/api/alerts'),
      api.get('/api/transactions'),
    ]);
    const transactions = transactionData.map(normalizeTransaction);
    const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));
    return alertData.map((alert) => {
      const normalized = normalizeAlert(alert);
      const transaction = transactionById.get(normalized.transactionId);
      return {
        ...normalized,
        customer: transaction?.customer ?? normalized.customer,
        amount: transaction?.amount,
      };
    });
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
    return data;
  } catch (error) {
    console.warn('Falling back to mock customer timeline.', error);
    return null;
  }
};

export const simulateTransaction = async (payload) => {
  try {
    const request = {
      customer_id: payload.userId,
      sender: payload.sender ?? 'Simulator User',
      receiver: payload.userId,
      amount: Number(payload.amount),
      timestamp: `${payload.date}T${payload.time}:00`,
      location: payload.location,
      device: payload.deviceId,
      merchant: payload.merchant,
      transaction_type: payload.transactionType,
    };
    const { data } = await api.post('/api/transactions/simulate', request);
    return normalizeTransaction(data);
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
    const { data } = await api.patch(`/api/alerts/${alertId}`, { status: alertStatusValue(status) });
    return data;
  } catch (error) {
    console.warn('Alert update endpoint unavailable. Ignoring client-side update in mock mode.', error);
    return { id: alertId, status };
  }
};

export const postAlertAction = async (alertId, action) => {
  try {
    const { data } = await api.post(`/api/alerts/${alertId}/action`, { action: alertActionValue(action) });
    return data;
  } catch (error) {
    console.warn('Alert action endpoint unavailable. Local action accepted.', error);
    return { id: alertId, action, status: 'updated' };
  }
};

export default api;
