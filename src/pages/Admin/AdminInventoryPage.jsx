import React, { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import Select from '../../components/UI/Select';
import { parseVariantOptions } from '../../utils/productHelpers';

const AdminInventoryPage = () => {
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [variants, setVariants] = useState([]);
  const [variantId, setVariantId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingVariants, setLoadingVariants] = useState(false);

  const load = async () => {
    const [low, adminProducts] = await Promise.all([
      inventoryService.getLowStock({ page: 0, size: 50, threshold: 5 }).catch(() => ({ content: [] })),
      productService.getAdminProducts({ page: 0, size: 100 }).catch(() => ({ content: [] })),
    ]);
    setLowStock(low.content || []);
    setProducts(adminProducts.content || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedProductId) {
      setVariants([]);
      setVariantId('');
      return;
    }
    let cancelled = false;
    setLoadingVariants(true);
    productService.getProductById(selectedProductId)
      .then(async (full) => {
        if (cancelled) return;
        const list = full.variants || [];
        const withStock = await Promise.all(list.map(async (v) => {
          const opts = parseVariantOptions(v);
          let available = null;
          try {
            const snap = await inventoryService.getSnapshot(v.id);
            available = snap?.availableQty ?? snap?.available ?? 0;
          } catch {
            available = 0;
          }
          return { ...v, ...opts, available };
        }));
        setVariants(withStock);
        if (withStock[0]) {
          setVariantId(withStock[0].id);
          setStockQty(String(withStock[0].available ?? 0));
        }
      })
      .catch(() => {
        if (!cancelled) setVariants([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingVariants(false);
      });
    return () => { cancelled = true; };
  }, [selectedProductId]);

  useEffect(() => {
    const v = variants.find((x) => x.id === variantId);
    if (v) setStockQty(String(v.available ?? 0));
  }, [variantId, variants]);

  const saveStock = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await inventoryService.setAvailableQty(variantId, stockQty, 'Admin inventory page');
      setMessage('Stock updated');
      const snap = await inventoryService.getSnapshot(variantId);
      setSnapshot(snap);
      setVariants((prev) => prev.map((v) => (
        v.id === variantId ? { ...v, available: snap?.availableQty ?? Number(stockQty) } : v
      )));
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const variantLabel = (v) => {
    const opts = parseVariantOptions(v);
    const parts = [opts.size, opts.color, v.name, v.sku].filter(Boolean);
    return `${parts.join(' · ')} (stock: ${v.available ?? '—'})`;
  };

  return (
    <div>
      <h1 style={{ marginBottom: 10 }}>Inventory</h1>
      <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
        Set quantity per size/color variant. Checkout reserves stock; payment confirms the reduction.
      </p>
      {message && <p style={{ marginBottom: 12 }}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          <h3>Set Variant Stock</h3>
          <form onSubmit={saveStock}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Product</label>
            <Select
              fullWidth
              value={selectedProductId}
              onChange={setSelectedProductId}
              style={{ marginBottom: 12 }}
              placeholder="Select product"
              options={[
                { value: '', label: 'Select product' },
                ...products.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />

            <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Variant (size / color)</label>
            {loadingVariants ? (
              <p style={{ fontSize: 13 }}>Loading variants...</p>
            ) : (
              <Select
                fullWidth
                value={variantId}
                onChange={setVariantId}
                style={{ marginBottom: 12 }}
                placeholder="Select variant"
                options={[
                  { value: '', label: variants.length ? 'Select variant' : 'No variants' },
                  ...variants.map((v) => ({ value: v.id, label: variantLabel(v) })),
                ]}
              />
            )}

            <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Available quantity</label>
            <input
              type="number"
              min="0"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />

            <button type="submit" className="btn btn-primary" disabled={!variantId}>
              Save Stock
            </button>
          </form>

          {snapshot && (
            <pre style={{ marginTop: 15, background: '#f8f9fa', padding: 10, overflow: 'auto', fontSize: 12 }}>
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          )}
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          <h3>Low Stock</h3>
          {lowStock.length === 0 ? (
            <p>No low stock items.</p>
          ) : lowStock.map((item, i) => (
            <div key={item.variantId || i} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: 14 }}>
              Variant {item.variantId || item.id}: available {item.availableQty ?? item.available ?? '—'}
              <button
                type="button"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setVariantId(item.variantId || item.id);
                  setStockQty(String(item.availableQty ?? item.available ?? 0));
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
