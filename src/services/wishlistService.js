import api, { unwrap } from './api';

export const wishlistService = {
  getMine: async () => {
    const response = await api.get('/wishlist/me');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : data?.items || [];
  },

  add: async (productId) => {
    const response = await api.post('/wishlist/items', { productId });
    return unwrap(response.data) || response.data;
  },

  remove: async (productId) => {
    await api.delete(`/wishlist/items/${productId}`);
  },
};
