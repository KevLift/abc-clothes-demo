import api from './api';

export const orderService = {
  placeOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  }
};
