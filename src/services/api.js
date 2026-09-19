import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

export const getDashboardSummary = async () => {
  try {
    const { data } = await api.get('/api/dashboard/summary');
    return data;
  } catch (error) {
    console.warn('Falling back to mock dashboard summary data.', error);
    return null;
  }
};

export const getTransactions = async () => {
  try {
    const { data } = await api.get('/api/transactions');
    return data;
  } catch (error) {
    console.warn('Falling back to mock transactions data.', error);
    return null;
  }
};

export const getTransactionById = async (transactionId) => {
  try {
    const { data } = await api.get(`/api/transactions/${transactionId}`);
    return data;
  } catch (error) {
    console.warn('Falling back to mock transaction detail data.', error);
    return null;
  }
};

export const getAlerts = async () => {
  try {
    const { data } = await api.get('/api/alerts');
    return data;
  } catch (error) {
    console.warn('Falling back to mock alerts data.', error);
    return null;
  }
};

export const getAlertById = async (alertId) => {
  try {
    const { data } = await api.get(`/api/alerts/${alertId}`);
    return data;
  } catch (error) {
    console.warn('Falling back to mock alert detail data.', error);
    return null;
  }
};

export const getCustomerTransactions = async (customerId) => {
  try {
    const { data } = await api.get(`/api/customers/${customerId}/transactions`);
    return data;
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
    const { data } = await api.post('/api/transactions/simulate', payload);
    return data;
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

export default api;
