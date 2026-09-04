import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';

const modalStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const formGroupStyle = {
  marginBottom: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px'
};

const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    featured: false,
    attributes: [],
    variants: [],
    images: []
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
        if (data.length > 0 && !formData.categoryId && !productToEdit) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit,
        price: productToEdit.price || productToEdit.salePrice || productToEdit.basePrice || '',
        compareAtPrice: productToEdit.compareAtPrice || '',
        sku: productToEdit.sku || '',
        featured: productToEdit.featured || productToEdit.isFeatured || false,
        categoryId: productToEdit.categoryId || categories[0]?.id || '',
        variants: productToEdit.variants || [],
        images: productToEdit.images || [],
        attributes: productToEdit.attributes || []
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        sku: `SKU-${Math.floor(Math.random() * 1000000)}`,
        price: '',
        compareAtPrice: '',
        featured: false,
        attributes: [],
        variants: [],
        images: []
      });
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.slug) {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    // Ensure numeric prices
    payload.price = parseFloat(payload.price) || 0;
    if (payload.compareAtPrice) {
      payload.compareAtPrice = parseFloat(payload.compareAtPrice);
    } else {
      delete payload.compareAtPrice;
    }

    onSave(payload);
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>Name *</label>
            <input required style={inputStyle} type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          
          <div style={formGroupStyle}>
            <label>SKU *</label>
            <input required style={inputStyle} type="text" name="sku" value={formData.sku} onChange={handleChange} />
          </div>

          <div style={formGroupStyle}>
            <label>Category *</label>
            <select required style={inputStyle} name="categoryId" value={formData.categoryId} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label>Description</label>
            <textarea style={inputStyle} name="description" value={formData.description || ''} onChange={handleChange} rows="3" />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label>Price *</label>
              <input required style={inputStyle} type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Compare at Price (Strike-through)</label>
              <input style={inputStyle} type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice || ''} onChange={handleChange} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Is Featured
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
