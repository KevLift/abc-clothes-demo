import api, { unwrap } from './api';

export const settingsService = {
  getPublic: async () => {
    const response = await api.get('/settings/public');
    return unwrap(response.data) || response.data;
  },

  getSettings: async () => {
    const response = await api.get('/settings');
    return unwrap(response.data) || response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return unwrap(response.data) || response.data;
  },
};
