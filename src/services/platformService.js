import api, { unwrap } from './api';

/**
 * Platform-operator endpoints. Requires PLATFORM_ADMIN or PLATFORM_SUPPORT.
 * Not visible to store owners / members.
 */
export const platformService = {
  getReports: async () => {
    const response = await api.get('/platform/reports');
    return unwrap(response.data) || response.data || {};
  },

  getDebug: async () => {
    const response = await api.get('/platform/debug');
    return unwrap(response.data) || response.data || {};
  },

  getConfig: async () => {
    const response = await api.get('/admin/config');
    return unwrap(response.data) || response.data || {};
  },

  updateConfig: async ({ maintenanceMode, featureFlags }) => {
    const response = await api.post('/admin/config', { maintenanceMode, featureFlags });
    return unwrap(response.data) || response.data || {};
  },
};
