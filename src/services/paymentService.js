import api, { unwrap, unwrapPage } from './api';

export const paymentService = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return unwrap(response.data) || response.data;
  },

  listPayments: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return unwrapPage(response.data);
  },

  getPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return unwrap(response.data) || response.data;
  },

  getPaymentByOrder: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return unwrap(response.data) || response.data;
  },

  getMyPayments: async () => {
    const response = await api.get('/payments/me');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  refund: async (refundData) => {
    const response = await api.post('/payments/refund', refundData);
    return unwrap(response.data) || response.data;
  },

  getMethods: async () => {
    const response = await api.get('/payments/methods');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  deleteMethod: async (methodId) => {
    await api.delete(`/payments/methods/${methodId}`);
  },
};
