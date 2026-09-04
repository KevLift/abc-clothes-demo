import api, { unwrap, unwrapList, unwrapPage } from './api';

const mapProduct = (p) => {
  if (!p) return null;
  const imageList = (p.images || [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  const primary = p.primaryImageUrl || p.imageUrl || imageList[0] || p.image || '';
  const images = imageList.length ? imageList : (primary ? [primary] : []);
  return {
    ...p,
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price ?? p.basePrice ?? p.salePrice ?? 0,
    salePrice: p.compareAtPrice ? (p.price ?? p.basePrice) : null,
    compareAtPrice: p.compareAtPrice,
    featured: p.featured ?? p.isFeatured ?? false,
    category: p.categoryName || p.category || '',
    categoryName: p.categoryName || p.category || '',
    categorySlug: p.categorySlug,
    categoryId: p.categoryId,
    primaryImageUrl: primary,
    image: primary,
    images,
    variants: p.variants || [],
    sku: p.sku,
    status: p.status,
  };
};

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    const page = unwrapPage(response.data);
    return { ...page, content: page.content.map(mapProduct) };
  },

  getAdminProducts: async (params = {}) => {
    const response = await api.get('/products/admin', { params });
    const page = unwrapPage(response.data);
    return { ...page, content: page.content.map(mapProduct) };
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return mapProduct(unwrap(response.data) || response.data);
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return mapProduct(unwrap(response.data) || response.data);
  },

  searchProducts: async (q, page = 0, size = 20) => {
    const response = await api.get('/products/search', { params: { q, page, size } });
    const data = unwrap(response.data) || response.data;
    const list = Array.isArray(data) ? data : unwrapList(response.data);
    return list.map(mapProduct);
  },

  filterProducts: async (filterRequest) => {
    const response = await api.post('/products/filter', filterRequest);
    const page = unwrapPage(response.data);
    return { ...page, content: page.content.map(mapProduct) };
  },

  getFeaturedProducts: async (size = 4) => {
    try {
      const page = await productService.filterProducts({ featured: true, page: 0, size });
      if (page.content.length) return page.content;
    } catch {
      // fall through
    }
    const page = await productService.getProducts({ page: 0, size });
    return page.content.filter((p) => p.featured).slice(0, size) || page.content.slice(0, size);
  },

  getNewArrivals: async (size = 4) => {
    const page = await productService.getProducts({ page: 0, size });
    return page.content.slice(0, size);
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : unwrapList(response.data);
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return unwrap(response.data) || response.data;
  },

  getCategoryChildren: async (id) => {
    const response = await api.get(`/categories/${id}/children`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  createCategory: async (data) => {
    const response = await api.post('/categories', {
      sortOrder: 0,
      ...data,
    });
    return unwrap(response.data) || response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return unwrap(response.data) || response.data;
  },

  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`);
  },

  getCategoryAttributes: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}/attributes`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  createCategoryAttribute: async (categoryId, data) => {
    const response = await api.post(`/categories/${categoryId}/attributes`, data);
    return unwrap(response.data) || response.data;
  },

  updateCategoryAttribute: async (attributeId, data) => {
    const response = await api.put(`/category-attributes/${attributeId}`, data);
    return unwrap(response.data) || response.data;
  },

  deleteCategoryAttribute: async (attributeId) => {
    await api.delete(`/category-attributes/${attributeId}`);
  },

  getAttributeOptions: async (attributeId) => {
    const response = await api.get(`/category-attributes/${attributeId}/options`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  createAttributeOption: async (attributeId, data) => {
    const response = await api.post(`/category-attributes/${attributeId}/options`, data);
    return unwrap(response.data) || response.data;
  },

  updateAttributeOption: async (optionId, data) => {
    const response = await api.put(`/category-attribute-options/${optionId}`, data);
    return unwrap(response.data) || response.data;
  },

  deleteAttributeOption: async (optionId) => {
    await api.delete(`/category-attribute-options/${optionId}`);
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return mapProduct(unwrap(response.data) || response.data);
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return mapProduct(unwrap(response.data) || response.data);
  },

  publishProduct: async (id) => {
    const response = await api.patch(`/products/${id}/publish`);
    return mapProduct(unwrap(response.data) || response.data);
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  },

  getVariants: async (productId) => {
    const response = await api.get(`/products/${productId}/variants`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  createVariant: async (productId, data) => {
    const response = await api.post(`/products/${productId}/variants`, data);
    return unwrap(response.data) || response.data;
  },

  updateVariant: async (productId, variantId, data) => {
    const response = await api.put(`/products/${productId}/variants/${variantId}`, data);
    return unwrap(response.data) || response.data;
  },

  deleteVariant: async (productId, variantId) => {
    await api.delete(`/products/${productId}/variants/${variantId}`);
  },

  getImages: async (productId) => {
    const response = await api.get(`/products/${productId}/images`);
    const data = unwrap(response.data) || response.data;
    return Array.isArray(data) ? data : [];
  },

  addImage: async (productId, data) => {
    const response = await api.post(`/products/${productId}/images`, data);
    return unwrap(response.data) || response.data;
  },

  uploadImage: async (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/products/${productId}/images/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(response.data) || response.data;
  },

  deleteImage: async (productId, imageId) => {
    await api.delete(`/products/${productId}/images/${imageId}`);
  },
};
