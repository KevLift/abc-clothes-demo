import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useCurrency } from '../../context/CurrencyContext';

const AdminAnalyticsPage = () => {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportStatus, setExportStatus] = useState('');
  const { formatPrice } = useCurrency();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await analyticsService.getSummary(from, to));
    } catch (err) {
      console.error('Failed to load analytics', err);
      setSummary(null);
      setError('Could not load analytics for this range. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCsv = async () => {
    try {
      const blob = await analyticsService.exportOrdersCsv(from, to, exportStatus);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = exportStatus ? `-${exportStatus.toLowerCase()}` : '';
      a.download = `orders-${from}-${to}${suffix}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export orders CSV', err);
      setError('Could not export orders for this range. Please try again.');
    }
  };

  const fulfillmentPct = summary?.fulfillmentRate != null
    ? `${Math.round(summary.fulfillmentRate * 100)}%`
    : '—';

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Analytics</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <select
            value={exportStatus}
            onChange={(e) => setExportStatus(e.target.value)}
            aria-label="Orders to include in the export"
            style={{ padding: '8px 10px' }}
          >
            <option value="">Completed orders</option>
            <option value="ALL">All orders</option>
            <option value="PENDING_PAYMENT">Pending payment</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button className="btn btn-outline" onClick={exportCsv}>Export Orders CSV</button>
        </span>
      </div>

      {error && (
        <p style={{ color: '#c0392b', marginBottom: 20 }}>{error}</p>
      )}

      {loading ? <p>Loading...</p> : !summary ? null : (
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 0, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{formatPrice(summary.revenue || 0, summary.currency)}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 0, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>Orders</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{summary.orderCount ?? summary.totalOrders ?? 0}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 0, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>AOV</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{formatPrice(summary.averageOrderValue || 0, summary.currency)}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 0, minWidth: 180 }}>
            <div style={{ color: '#7f8c8d', fontSize: 13 }}>Fulfillment Rate</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{fulfillmentPct}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 0, flex: '1 1 280px' }}>
          <h3>Top Products</h3>
          {(summary?.topProducts || []).length === 0 ? (
            <p style={{ color: '#95a5a6' }}>No sales in this range.</p>
          ) : (summary?.topProducts || []).map((p, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              {p.productName || p.name || p.productId} — {p.quantitySold ?? p.unitsSold ?? p.units ?? 0}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 0, flex: '1 1 280px' }}>
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

        <div style={{ background: 'white', padding: 20, borderRadius: 0, flex: '1 1 280px' }}>
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
