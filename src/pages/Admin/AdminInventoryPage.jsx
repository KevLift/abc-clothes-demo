import React, { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import Select from '../../components/UI/Select';

const AdminInventoryPage = () => {
  const [lowStock, setLowStock] = useState([]);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState('REPLENISH');
  const [reason, setReason] = useState('Manual admin adjustment');
  const [snapshot, setSnapshot] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [low, adminProducts] = await Promise.all([
      inventoryService.getLowStock({ page: 0, size: 50, threshold: 5 }).catch(() => ({ content: [] })),
      productService.getAdminProducts({ page: 0, size: 50 }).catch(() => ({ content: [] })),
    ]);
    setLowStock(low.content || []);
    setProducts(adminProducts.content || []);
  };

  useEffect(() => { load(); }, []);

  const adjust = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await inventoryService.adjustStock({
        variantId,
        adjustmentType,
        quantity: Math.abs(Number(quantity)),
        reason,
      });
      setMessage('Stock adjusted');
      const snap = await inventoryService.getSnapshot(variantId);
      setSnapshot(snap);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Adjust failed');
    }
  };

  const loadSnapshot = async () => {
    if (!variantId) return;
    setSnapshot(await inventoryService.getSnapshot(variantId));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Inventory</h1>
      {message && <p>{message}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          <h3>Adjust Stock</h3>
          <form onSubmit={adjust}>
            <input
              placeholder="Variant UUID"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <Select
              fullWidth
              value={adjustmentType}
              onChange={setAdjustmentType}
              style={{ marginBottom: 8 }}
              options={[
                { value: 'REPLENISH', label: 'Replenish (add)' },
                { value: 'WRITE_DOWN', label: 'Write down (remove)' },
              ]}
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={loadSnapshot}>View Snapshot</button>
              <button type="submit" className="btn btn-primary">Adjust</button>
            </div>
          </form>
          {snapshot && (
            <pre style={{ marginTop: 15, background: '#f8f9fa', padding: 10, overflow: 'auto' }}>
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          )}
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          <h3>Low Stock</h3>
          {lowStock.length === 0 ? <p>No low stock items.</p> : lowStock.map((item, i) => (
            <div key={item.variantId || i} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: 14 }}>
              Variant {item.variantId || item.id}: available {item.availableQty ?? item.available ?? '—'}
              <button style={{ marginLeft: 8 }} onClick={() => setVariantId(item.variantId || item.id)}>Select</button>
            </div>
          ))}
          <h3 style={{ marginTop: 20 }}>Products (for variants)</h3>
          {products.slice(0, 10).map((p) => (
            <div key={p.id} style={{ fontSize: 13, marginBottom: 6 }}>
              {p.name}
              <button style={{ marginLeft: 8 }} onClick={async () => {
                const variants = await productService.getVariants(p.id);
                if (variants[0]) setVariantId(variants[0].id);
              }}>Use first variant</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
