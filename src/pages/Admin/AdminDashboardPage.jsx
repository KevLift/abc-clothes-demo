import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { orderService } from '../../services/orderService';
import { useCurrency } from '../../context/CurrencyContext';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const to = new Date().toISOString().slice(0, 10);
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const [statsData, analyticsData, ordersPage] = await Promise.all([
          analyticsService.getDashboardStats().catch(() => null),
          analyticsService.getSummary(from, to).catch(() => null),
          orderService.getStoreOrders({ page: 0, size: 5 }).catch(() => ({ content: [] })),
        ]);

        setStats(statsData);
        setAnalytics(analyticsData);
        setRecentOrders(ordersPage.content || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats && !analytics) return <div>Failed to load stats.</div>;

  const statCards = [
    { title: 'Revenue (30d)', value: analytics?.totalRevenue != null ? formatPrice(analytics.totalRevenue) : '—' },
    { title: 'Orders (30d)', value: analytics?.orderCount ?? analytics?.totalOrders ?? '—' },
    { title: 'AOV', value: analytics?.averageOrderValue != null ? formatPrice(analytics.averageOrderValue) : '—' },
    { title: 'Total Products', value: stats?.totalProducts ?? '—' },
    { title: 'Total Orders', value: stats?.totalOrders ?? '—' },
    { title: 'Low Stock', value: stats?.lowStockCount ?? '—' },
    { title: 'Out of Stock', value: stats?.outOfStockCount ?? '—' },
    { title: 'Available Qty', value: stats?.totalAvailableQty ?? '—' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Dashboard Overview</h1>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {statCards.map((card) => (
          <div
            key={card.title}
            style={{
              flex: '1 1 180px',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '10px' }}>{card.title}</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', backgroundColor: 'white', padding: '25px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Top Products</h2>
          {(analytics?.topProducts || []).length === 0 ? (
            <p style={{ color: '#95a5a6' }}>No analytics data for the last 30 days.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {analytics.topProducts.map((p, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                  {p.productName || p.name || p.productId} — {p.quantitySold ?? p.units ?? ''} sold
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/analytics" style={{ color: '#3498db', fontSize: '14px' }}>View analytics →</Link>
        </div>

        <div style={{ flex: '2 1 500px', backgroundColor: 'white', padding: '25px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px' }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ color: '#3498db', fontSize: '14px' }}>View All</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>No recent orders.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{order.orderNumber || order.id?.substring?.(0, 8)}</td>
                    <td style={{ padding: '12px' }}>
                      {order.placedAt || order.createdAt
                        ? new Date(order.placedAt || order.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>{formatPrice(order.totalAmount)}</td>
                    <td style={{ padding: '12px' }}>{order.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
