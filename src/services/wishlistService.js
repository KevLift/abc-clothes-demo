import api, { unwrap, unwrapPage } from './api';

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

  /** Admin: products ranked by how many customers have wishlisted them. */
  getMostWishlisted: async (params = {}) => {
    const response = await api.get('/wishlist/admin/top-products', { params });
    return unwrapPage(response.data);
  },
};
