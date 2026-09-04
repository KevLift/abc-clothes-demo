import api, { unwrap, unwrapPage } from './api';

export const orderService = {
  placeOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return unwrap(response.data) || response.data;
  },

  getStoreOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return unwrapPage(response.data);
  },

  getUserOrders: async (userId, params = {}) => {
    const response = await api.get(`/orders/user/${userId}`, { params });
    return unwrapPage(response.data);
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return unwrap(response.data) || response.data;
  },

  getOrderByNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return unwrap(response.data) || response.data;
  },

  getOrderItems: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/items`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  getOrderHistory: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/history`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  trackOrder: async (orderNumber, email) => {
    const response = await api.get('/orders/track', {
      params: { orderNumber, email },
    });
    return unwrap(response.data) || response.data;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/cancel`, null, {
      params: reason ? { reason } : {},
    });
    return unwrap(response.data) || response.data;
  },

  markPaid: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/pay`);
    return unwrap(response.data) || response.data;
  },

  shipOrder: async (orderId, shipRequest = {}) => {
    const response = await api.post(`/orders/${orderId}/ship`, shipRequest);
    return unwrap(response.data) || response.data;
  },

  deliverOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/deliver`);
    return unwrap(response.data) || response.data;
  },
};
