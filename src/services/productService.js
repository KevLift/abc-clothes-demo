import api from './api';

export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },
  
  getNewArrivals: async () => {
    const response = await api.get('/products/new-arrivals');
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};
