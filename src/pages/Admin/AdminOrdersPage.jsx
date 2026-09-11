import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { useCurrency } from '../../context/CurrencyContext';
import Select from '../../components/UI/Select';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const { formatPrice } = useCurrency();

  const load = async () => {
    setLoading(true);
    try {
      const page = await orderService.getStoreOrders({
        page: 0,
        size: 50,
        ...(status ? { status } : {}),
      });
      setOrders(page.content || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const visibleOrders = paymentType
    ? orders.filter((o) => (o.paymentMethod || 'CARD') === paymentType)
    : orders;

  const openOrder = async (order) => {
    const full = await orderService.getOrderById(order.id);
    const hist = await orderService.getOrderHistory(order.id).catch(() => []);
    setSelected(full);
    setHistory(hist);
  };

  const act = async (action) => {
    if (!selected) return;
    try {
      if (action === 'pay') await orderService.markPaid(selected.id);
      if (action === 'ship') await orderService.shipOrder(selected.id, { trackingNumber: trackingNumber || undefined });
      if (action === 'deliver') await orderService.deliverOrder(selected.id);
      if (action === 'cancel') await orderService.cancelOrder(selected.id, 'Cancelled by admin');
      await openOrder(selected);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, gap: 10, flexWrap: 'wrap' }}>
        <h1>Orders Management</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Select
            value={paymentType}
            onChange={setPaymentType}
            aria-label="Filter orders by payment type"
            options={[
              { value: '', label: 'All types' },
              { value: 'CARD', label: 'Card' },
              { value: 'COD', label: 'Cash on Delivery' },
            ]}
          />
          <Select
            value={status}
            onChange={setStatus}
            aria-label="Filter orders by status"
            options={[
              { value: '', label: 'All' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'PAID', label: 'Paid' },
              { value: 'SHIPPED', label: 'Shipped' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {loading ? <div>Loading orders...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1.2fr 1fr' : '1fr', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: 12, textAlign: 'left' }}>Order</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Total</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 12 }}>{order.orderNumber || order.id.substring(0, 8)}</td>
                    <td style={{ padding: 12 }}>{order.userId}</td>
                    <td style={{ padding: 12 }}>{formatPrice(order.totalAmount, order.currency)}</td>
                    <td style={{ padding: 12 }}>{order.paymentMethod === 'COD' ? 'COD' : 'Card'}</td>
                    <td style={{ padding: 12 }}>{order.status}</td>
                    <td style={{ padding: 12 }}>
                      <button style={{ color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => openOrder(order)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
              <h3>{selected.orderNumber}</h3>
              <p>Status: <strong>{selected.status}</strong></p>
              <p>Payment: <strong>{selected.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}</strong></p>
              <p>Total: {formatPrice(selected.totalAmount, selected.currency)}</p>
              <div style={{ margin: '15px 0' }}>
                <input
                  placeholder="Tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 8 }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button className="btn btn-outline" onClick={() => act('pay')}>Mark Paid</button>
                  <button className="btn btn-outline" onClick={() => act('ship')}>Ship</button>
                  <button className="btn btn-outline" onClick={() => act('deliver')}>Deliver</button>
                  <button className="btn btn-outline" onClick={() => act('cancel')}>Cancel</button>
                </div>
              </div>
              <h4>Items</h4>
              {(selected.items || []).map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '4px 0' }}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                  )}
                  <span>{item.quantity}× {item.productName}</span>
                </div>
              ))}
              <h4 style={{ marginTop: 15 }}>History</h4>
              {history.map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: '#666' }}>
                  {h.status || h.toStatus} — {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                </div>
              ))}
              <button style={{ marginTop: 15 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
