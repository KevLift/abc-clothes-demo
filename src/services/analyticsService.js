import api, { unwrap } from './api';

export const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return unwrap(response.data) || response.data;
  },

  getSummary: async (from, to) => {
    const response = await api.get('/analytics/summary', {
      params: { from, to },
    });
    return unwrap(response.data) || response.data;
  },

  exportOrdersCsv: async (from, to) => {
    const response = await api.get('/reports/orders/export', {
      params: { format: 'csv', from, to },
      responseType: 'blob',
    });
    return response.data;
  },
};
