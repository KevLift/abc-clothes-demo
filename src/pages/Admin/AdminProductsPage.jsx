import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { useCurrency } from '../../context/CurrencyContext';
import ProductFormModal from '../../components/Admin/ProductFormModal';
import Select from '../../components/UI/Select';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { formatPrice } = useCurrency();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAdminProducts({
        page,
        size: 20,
        ...(status ? { status } : {}),
      });
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, status]);

  const handleSaveProduct = async (productData) => {
    try {
      const { variants, ...raw } = productData;
      // UpdateProductRequest has no sku — sending it causes Jackson 400.
      const productPayload = productToEdit
        ? {
            name: raw.name,
            slug: raw.slug,
            description: raw.description,
            categoryId: raw.categoryId || undefined,
            price: raw.price,
            ...(raw.compareAtPrice != null ? { compareAtPrice: raw.compareAtPrice } : {}),
            currency: raw.currency,
            featured: raw.featured,
          }
        : {
            name: raw.name,
            slug: raw.slug,
            description: raw.description,
            categoryId: raw.categoryId,
            sku: raw.sku,
            price: raw.price,
            ...(raw.compareAtPrice != null ? { compareAtPrice: raw.compareAtPrice } : {}),
            currency: raw.currency,
            featured: !!raw.featured,
          };

      let saved;
      if (productToEdit) {
        saved = await productService.updateProduct(productToEdit.id, productPayload);
      } else {
        saved = await productService.createProduct(productPayload);
      }

      const productId = saved.id || productToEdit?.id;
      if (productId && variants?.length) {
        for (const v of variants) {
          const variantBody = {
            name: v.name,
            sku: v.sku,
            price: v.price,
            ...(v.compareAtPrice != null ? { compareAtPrice: v.compareAtPrice } : {}),
            currency: v.currency || raw.currency || 'LKR',
            optionValues: v.optionValues,
            position: v.position ?? 0,
            active: v.active !== false,
          };
          if (v.id) {
            await productService.updateVariant(productId, v.id, variantBody).catch(() => {});
          } else {
            await productService.createVariant(productId, variantBody).catch(() => {});
          }
        }
      }

      setIsModalOpen(false);
      setProductToEdit(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
      const msg = err.response?.data?.message || err.message || 'Please try again.';
      alert(`Failed to save product: ${msg}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch {
      alert('Failed to delete product.');
    }
  };

  const handlePublish = async (id) => {
    try {
      await productService.publishProduct(id);
      fetchProducts();
    } catch {
      alert('Failed to publish product.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1>Products Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Select
            value={status}
            onChange={(v) => { setStatus(v); setPage(0); }}
            aria-label="Filter products by status"
            options={[
              { value: '', label: 'All statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
          <button
            onClick={() => { setProductToEdit(null); setIsModalOpen(true); }}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>SKU</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center' }}>No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{p.name}</td>
                    <td style={{ padding: '12px' }}>{p.sku}</td>
                    <td style={{ padding: '12px' }}>{formatPrice(p.price)}</td>
                    <td style={{ padding: '12px' }}>{p.status || '—'}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setProductToEdit(p); setIsModalOpen(true); }} style={{ color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                      {p.status !== 'ACTIVE' && (
                        <button onClick={() => handlePublish(p.id)} style={{ color: '#27ae60', background: 'none', border: 'none', cursor: 'pointer' }}>Publish</button>
                      )}
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page + 1} / {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setProductToEdit(null); }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default AdminProductsPage;
