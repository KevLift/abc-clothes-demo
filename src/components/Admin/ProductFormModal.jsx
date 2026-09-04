import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import Select from '../UI/Select';
import { parseVariantOptions } from '../../utils/productHelpers';

const modalStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const modalContentStyle = {
  backgroundColor: 'white', padding: '30px', borderRadius: '8px',
  width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
};
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };

const emptyVariant = () => ({
  name: '', sku: '', price: '', compareAtPrice: '', size: '', color: '', position: 0, active: true,
});

const slugPart = (value) => String(value || '')
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 20);

const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', categoryId: '', sku: '',
    price: '', compareAtPrice: '', featured: false, currency: 'LKR',
    variants: [emptyVariant()], images: [],
  });

  useEffect(() => {
    if (!isOpen) return;
    productService.getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (productToEdit) {
      const mappedVariants = (productToEdit.variants || []).map((v) => {
        const opts = parseVariantOptions(v);
        return {
          id: v.id,
          name: v.name || '',
          sku: v.sku || '',
          price: v.price || '',
          compareAtPrice: v.compareAtPrice || '',
          size: opts.size || '',
          color: opts.color || '',
          position: v.position || 0,
          active: v.active !== false,
        };
      });
      setFormData({
        name: productToEdit.name || '',
        slug: productToEdit.slug || '',
        description: productToEdit.description || '',
        categoryId: productToEdit.categoryId || '',
        sku: productToEdit.sku || '',
        price: productToEdit.price || productToEdit.basePrice || '',
        compareAtPrice: productToEdit.compareAtPrice || '',
        featured: productToEdit.featured || false,
        currency: productToEdit.currency || 'LKR',
        variants: mappedVariants.length ? mappedVariants : [emptyVariant()],
        images: productToEdit.images || [],
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        sku: `SKU-${Math.floor(Math.random() * 1000000)}`,
        price: '',
        compareAtPrice: '',
        featured: false,
        currency: 'LKR',
        variants: [emptyVariant()],
        images: [],
      });
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const updateVariant = (index, field, value) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      if (field === 'size' || field === 'color') {
        const size = field === 'size' ? value : variants[index].size;
        const color = field === 'color' ? value : variants[index].color;
        variants[index].name = [size, color].filter(Boolean).join(' / ') || variants[index].name;
        if (!variants[index].sku) {
          const base = slugPart(prev.sku) || 'SKU';
          const parts = [base, slugPart(size), slugPart(color)].filter(Boolean);
          variants[index].sku = parts.join('-');
        }
      }
      return { ...prev, variants };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !productToEdit?.id) {
      alert('Save the product first, then upload images while editing.');
      return;
    }
    setUploading(true);
    try {
      const img = await productService.uploadImage(productToEdit.id, file);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), img.url || img],
      }));
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = formData.slug
      || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const variants = (formData.variants || [])
      .map((v, i) => {
        const size = (v.size || '').trim();
        const color = (v.color || '').trim();
        const name = (v.name || [size, color].filter(Boolean).join(' / ')).trim();
        const sku = (v.sku || [slugPart(formData.sku) || 'SKU', slugPart(size), slugPart(color)]
          .filter(Boolean)
          .join('-')).trim();
        if (!size && !color && !name) return null;
        if (!sku) return null;
        return {
          id: v.id,
          name: name || sku,
          sku,
          price: parseFloat(v.price || formData.price) || 0,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
          currency: formData.currency || 'LKR',
          optionValues: JSON.stringify({
            ...(size ? { size } : {}),
            ...(color ? { color } : {}),
          }),
          position: i,
          active: v.active !== false,
          size,
          color,
        };
      })
      .filter(Boolean);

    const payload = {
      name: formData.name,
      slug,
      description: formData.description,
      categoryId: formData.categoryId,
      sku: formData.sku,
      price: parseFloat(formData.price) || 0,
      featured: !!formData.featured,
      currency: formData.currency || 'LKR',
      variants,
    };

    if (formData.compareAtPrice) {
      payload.compareAtPrice = parseFloat(formData.compareAtPrice);
    }

    onSave(payload);
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>Name *</label>
            <input required style={inputStyle} name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div style={formGroupStyle}>
            <label>Slug</label>
            <input style={inputStyle} name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated if empty" />
          </div>
          <div style={formGroupStyle}>
            <label>SKU *</label>
            <input required style={inputStyle} name="sku" value={formData.sku} onChange={handleChange} />
          </div>
          <div style={formGroupStyle}>
            <label>Category *</label>
            {categories.length === 0 ? (
              <p style={{ color: '#c62828', fontSize: 13, margin: '8px 0' }}>
                No categories yet. Create clothing categories under Admin → Categories first.
              </p>
            ) : (
              <Select
                required
                fullWidth
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                placeholder="Select category"
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map((cat) => {
                    const parent = categories.find((p) => p.id === cat.parentId);
                    const label = parent ? `${parent.name} › ${cat.name}` : cat.name;
                    return { value: cat.id, label };
                  }),
                ]}
              />
            )}
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
              <label>Compare at Price</label>
              <input style={inputStyle} type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice || ''} onChange={handleChange} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Featured
          </label>

          <h4 style={{ marginBottom: '6px' }}>Variants (Size / Color)</h4>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
            Each size/color combination becomes a selectable option on the product page for customers.
          </p>
          {formData.variants.map((v, index) => (
            <div key={index} style={{ border: '1px solid #eee', padding: '12px', marginBottom: '10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={inputStyle} placeholder="Size (e.g. M, L, XL)" value={v.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} />
                <input style={inputStyle} placeholder="Color (e.g. Navy, Black)" value={v.color} onChange={(e) => updateVariant(index, 'color', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={inputStyle} placeholder="Variant name" value={v.name} onChange={(e) => updateVariant(index, 'name', e.target.value)} />
                <input style={inputStyle} placeholder="Variant SKU" value={v.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)} />
                <input style={inputStyle} type="number" step="0.01" placeholder="Price" value={v.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} />
              </div>
              <button type="button" onClick={() => setFormData((prev) => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index),
              }))}>Remove</button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginBottom: '20px' }}
            onClick={() => setFormData((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))}
          >
            Add Variant
          </button>

          {productToEdit?.id && (
            <div style={formGroupStyle}>
              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p>Uploading...</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {(formData.images || []).map((img, i) => (
                  <img
                    key={i}
                    src={typeof img === 'string' ? img : img.url}
                    alt=""
                    style={{ width: 60, height: 60, objectFit: 'cover' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
