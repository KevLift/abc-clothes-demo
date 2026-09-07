import api, { unwrap } from './api';

export const notificationService = {
  getMine: async () => {
    const response = await api.get('/notifications/me');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/me/unread-count');
    const data = unwrap(response.data) || response.data;
    return data?.count ?? 0;
  },

  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return unwrap(response.data) || response.data;
  },

  markAllRead: async () => {
    const response = await api.patch('/notifications/me/read-all');
    return unwrap(response.data) || response.data;
  },

  delete: async (id) => {
    await api.delete(`/notifications/${id}`);
  },

  getFailed: async () => {
    const response = await api.get('/notifications/failed');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  retry: async (id) => {
    const response = await api.post(`/notifications/${id}/retry`);
    return unwrap(response.data) || response.data;
  },

  /** Store-owner: every notification sent to a given user. */
  getByUser: async (userId) => {
    const response = await api.get(`/notifications/user/${encodeURIComponent(userId)}`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  /** Store-owner: notifications tied to a domain object, e.g. ORDER / <orderId>. */
  getByReference: async (referenceType, referenceId) => {
    const response = await api.get(
      `/notifications/reference/${encodeURIComponent(referenceType)}/${encodeURIComponent(referenceId)}`,
    );
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },
};
