import api, { getCartSessionId, clearCartSessionId, unwrap } from './api';

export const cartService = {
  getGuestCart: async () => {
    const response = await api.get('/cart/guest/me');
    return unwrap(response.data) || response.data;
  },

  addGuestItem: async ({ productId, variantId, quantity }) => {
    const response = await api.post('/cart/guest/items', {
      productId,
      variantId: variantId || null,
      quantity,
    });
    return unwrap(response.data) || response.data;
  },

  updateGuestItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/guest/items/${itemId}`, { quantity });
    return unwrap(response.data) || response.data;
  },

  removeGuestItem: async (itemId) => {
    await api.delete(`/cart/guest/items/${itemId}`);
  },

  clearGuestCart: async () => {
    await api.delete('/cart/guest/items');
  },

  getMyCart: async () => {
    const response = await api.get('/cart/me');
    return unwrap(response.data) || response.data;
  },

  addItem: async (cartId, { productId, variantId, quantity }) => {
    const response = await api.post(`/cart/${cartId}/items`, {
      productId,
      variantId: variantId || null,
      quantity,
    });
    return unwrap(response.data) || response.data;
  },

  updateItem: async (cartId, itemId, quantity) => {
    const response = await api.put(`/cart/${cartId}/items/${itemId}`, { quantity });
    return unwrap(response.data) || response.data;
  },

  removeItem: async (cartId, itemId) => {
    await api.delete(`/cart/${cartId}/items/${itemId}`);
  },

  clearCart: async (cartId) => {
    await api.delete(`/cart/${cartId}/items`);
  },

  mergeGuestCart: async () => {
    const sessionId = getCartSessionId();
    const response = await api.post('/cart/merge', { sessionId });
    clearCartSessionId();
    return unwrap(response.data) || response.data;
  },
};
