import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useCurrency } from '../../context/CurrencyContext';

const AdminAnalyticsPage = () => {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(null);
  const { formatPrice } = useCurrency();

  const load = async () => {
    setSummary(await analyticsService.getSummary(from, to));
  };

  useEffect(() => { load(); }, []);

  const exportCsv = async () => {
    const blob = await analyticsService.exportOrdersCsv(from, to);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Analytics</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>Refresh</button>
        <button className="btn btn-outline" onClick={exportCsv}>Export Orders CSV</button>
      </div>
      {!summary ? <p>Loading...</p> : (
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{formatPrice(summary.totalRevenue || 0, summary.currency)}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>Orders</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{summary.orderCount ?? summary.totalOrders ?? 0}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>AOV</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{formatPrice(summary.averageOrderValue || 0, summary.currency)}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>Fulfillment Rate</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{summary.fulfillmentRate != null ? `${summary.fulfillmentRate}%` : '—'}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 8, flex: '1 1 280px' }}>
          <h3>Top Products</h3>
          {(summary?.topProducts || []).length === 0 ? (
            <p style={{ color: '#95a5a6' }}>No sales in this range.</p>
          ) : (summary?.topProducts || []).map((p, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              {p.productName || p.name || p.productId} — {p.quantitySold ?? p.unitsSold ?? p.units ?? 0}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 8, flex: '1 1 280px' }}>
          <h3>Payment Type</h3>
          {(summary?.paymentMethodBreakdown || []).length === 0 ? (
            <p style={{ color: '#95a5a6' }}>No orders in this range.</p>
          ) : (summary.paymentMethodBreakdown || []).map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>{b.method === 'COD' ? 'Cash on Delivery' : 'Card'}</span>
              <span>{b.orderCount} orders — {formatPrice(b.revenue, summary.currency)}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 8, flex: '1 1 280px' }}>
          <h3>Order Status</h3>
          {(summary?.orderStatusBreakdown || []).length === 0 ? (
            <p style={{ color: '#95a5a6' }}>No orders in this range.</p>
          ) : (summary.orderStatusBreakdown || []).map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>{b.status}</span>
              <span>{b.orderCount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
