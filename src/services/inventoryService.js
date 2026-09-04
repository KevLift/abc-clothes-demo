import api, { unwrap, unwrapPage } from './api';

export const inventoryService = {
  getAvailability: async (variantId) => {
    const response = await api.get(`/inventory/availability/${variantId}`);
    return unwrap(response.data) || response.data;
  },

  getBulkAvailability: async (variantIds) => {
    const response = await api.post('/inventory/availability/bulk', { variantIds });
    return unwrap(response.data) || response.data;
  },

  getSnapshot: async (variantId) => {
    const response = await api.get(`/inventory/admin/snapshot/${variantId}`);
    return unwrap(response.data) || response.data;
  },

  adjustStock: async (data) => {
    const response = await api.post('/inventory/admin/adjust', data);
    return unwrap(response.data) || response.data;
  },

  getLowStock: async (params = {}) => {
    const response = await api.get('/inventory/admin/low-stock', { params });
    return unwrapPage(response.data);
  },
};
