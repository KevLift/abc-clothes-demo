import api from './api';

export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data.content || response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getFeaturedProducts: async () => {
    const response = await api.get('/products');
    // For now, use the first few products as featured if no specific endpoint exists,
    // or just return the content.
    return (response.data.content || response.data).slice(0, 4);
  },
  
  getNewArrivals: async () => {
    const response = await api.get('/products');
    // For now, use the first few products or sorted products
    return (response.data.content || response.data).slice(0, 4);
  },
  
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
