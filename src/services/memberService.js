import api, { unwrap, unwrapPage } from './api';

export const memberService = {
  list: async (params = {}) => {
    const response = await api.get('/members', { params });
    return unwrapPage(response.data);
  },

  add: async (data) => {
    const response = await api.post('/members', data);
    return unwrap(response.data) || response.data;
  },

  remove: async (memberId) => {
    await api.delete(`/members/${memberId}`);
  },

  getPermissions: async (memberId) => {
    const response = await api.get(`/members/${memberId}/permissions`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  grantPermission: async (memberId, permission) => {
    // Backend expects Permission enum name (e.g. PRODUCTS_VIEW) or key via custom deserializer
    const enumName = permission.includes(':')
      ? permission.toUpperCase().replace(':', '_')
      : permission;
    const response = await api.post(`/members/${memberId}/permissions`, {
      permission: enumName,
    });
    return unwrap(response.data) || response.data;
  },

  revokePermission: async (memberId, permission) => {
    await api.delete(`/members/${memberId}/permissions/${encodeURIComponent(permission)}`);
  },

  getDelegatable: async () => {
    const response = await api.get('/permissions/delegatable');
    return unwrap(response.data) || response.data || [];
  },
};
