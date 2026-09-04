import api, { unwrap } from './api';

const mapAuthUser = (payload) => ({
  token: payload.accessToken,
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken,
  userId: payload.userId,
  name: `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || payload.email,
  email: payload.email,
  firstName: payload.firstName,
  lastName: payload.lastName,
  role: payload.role,
  permissions: payload.permissions || [],
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return mapAuthUser(unwrap(response.data));
  },

  register: async (name, email, password) => {
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'User';
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    return mapAuthUser(unwrap(response.data));
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return mapAuthUser(unwrap(response.data));
  },

  logout: async (refreshToken) => {
    if (!refreshToken) return;
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // ignore logout failures
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return unwrap(response.data);
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return unwrap(response.data);
  },

  verifyEmail: async (token) => {
    const response = await api.post(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return unwrap(response.data);
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return unwrap(response.data);
  },

  updateMe: async (data) => {
    const response = await api.put('/users/me', data);
    return unwrap(response.data);
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
    return unwrap(response.data);
  },

  getAddresses: async () => {
    const response = await api.get('/users/me/addresses');
    return Array.isArray(response.data) ? response.data : unwrap(response.data) || [];
  },

  createAddress: async (address) => {
    const response = await api.post('/users/me/addresses', address);
    return unwrap(response.data) || response.data;
  },

  updateAddress: async (addressId, address) => {
    const response = await api.put(`/users/me/addresses/${addressId}`, address);
    return unwrap(response.data) || response.data;
  },

  deleteAddress: async (addressId) => {
    await api.delete(`/users/me/addresses/${addressId}`);
  },

  getNotificationPreferences: async () => {
    const response = await api.get('/users/me/notification-preferences');
    return unwrap(response.data);
  },

  updateNotificationPreferences: async (prefs) => {
    const response = await api.put('/users/me/notification-preferences', prefs);
    return unwrap(response.data);
  },
};
