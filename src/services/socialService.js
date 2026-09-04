import api, { unwrap } from './api';

export const socialService = {
  listAccounts: async () => {
    const response = await api.get('/social/accounts');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  connectAccount: async (data) => {
    const response = await api.post('/social/accounts', data);
    return unwrap(response.data) || response.data;
  },

  getFacebookAuthUrl: async (redirectUri) => {
    const response = await api.get('/social/facebook/authorization-url', {
      params: redirectUri ? { redirectUri } : {},
    });
    return unwrap(response.data) || response.data;
  },

  facebookCallback: async (data) => {
    const response = await api.post('/social/facebook/callback', data);
    return unwrap(response.data) || response.data;
  },

  selectFacebookPage: async (data) => {
    const response = await api.post('/social/facebook/pages/select', data);
    return unwrap(response.data) || response.data;
  },
};
