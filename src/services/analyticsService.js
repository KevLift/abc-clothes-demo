import api, { unwrap } from './api';

/**
 * The analytics/reports endpoints bind their `from`/`to` params to `Instant`
 * (ISO-8601 date-time). The admin UI works in whole local days (`<input type="date">`
 * → `YYYY-MM-DD`), so widen each end of the range to a full instant before sending:
 * `from` to local start-of-day, `to` to local end-of-day. Falsy input is passed
 * through as `undefined` so axios drops the param and the backend applies its default.
 */
const startOfDayIso = (date) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined);
const endOfDayIso = (date) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined);

export const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return unwrap(response.data) || response.data;
  },

  getSummary: async (from, to) => {
    const response = await api.get('/analytics/summary', {
      params: { from: startOfDayIso(from), to: endOfDayIso(to) },
    });
    return unwrap(response.data) || response.data;
  },

  exportOrdersCsv: async (from, to, status) => {
    const response = await api.get('/reports/orders/export', {
      params: {
        format: 'csv',
        from: startOfDayIso(from),
        to: endOfDayIso(to),
        ...(status ? { status } : {}),
      },
      responseType: 'blob',
    });
    return response.data;
  },
};
