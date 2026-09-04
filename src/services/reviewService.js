import api, { unwrap, unwrapPage } from './api';

export const reviewService = {
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return unwrap(response.data) || response.data;
  },

  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  getMyReviews: async () => {
    const response = await api.get('/reviews/me');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  getPendingReviews: async (params = {}) => {
    const response = await api.get('/reviews/pending', { params });
    return unwrapPage(response.data);
  },

  approveReview: async (reviewId) => {
    const response = await api.patch(`/reviews/${reviewId}/approve`);
    return unwrap(response.data) || response.data;
  },

  rejectReview: async (reviewId) => {
    const response = await api.patch(`/reviews/${reviewId}/reject`);
    return unwrap(response.data) || response.data;
  },
};
