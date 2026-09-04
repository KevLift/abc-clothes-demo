import api, { unwrap, unwrapPage } from './api';

export const customerService = {
  list: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return unwrapPage(response.data);
  },

  getById: async (customerId) => {
    const response = await api.get(`/customers/${customerId}`);
    return unwrap(response.data) || response.data;
  },

  ban: async (customerId) => {
    const response = await api.post(`/customers/${customerId}/ban`);
    return unwrap(response.data) || response.data;
  },

  suspend: async (customerId) => {
    const response = await api.post(`/customers/${customerId}/suspend`);
    return unwrap(response.data) || response.data;
  },

  reactivate: async (customerId) => {
    const response = await api.post(`/customers/${customerId}/reactivate`);
    return unwrap(response.data) || response.data;
  },
};
