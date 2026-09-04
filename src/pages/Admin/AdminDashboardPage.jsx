import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/admin/dashboard/stats');
        setStats(statsRes.data);
        
        const ordersRes = await api.get('/admin/orders');
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), color: '#3498db' },
    { title: 'Total Orders', value: stats.totalOrders, color: '#2ecc71' },
    { title: 'Total Products', value: stats.totalProducts, color: '#f39c12' },
    { title: 'Total Users', value: stats.totalUsers, color: '#9b59b6' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {statCards.map(card => (
          <div key={card.title} style={{ 
            flex: '1 1 200px', 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            borderTop: `4px solid ${card.color}`
          }}>
            <h3 style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>{card.title}</h3>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#2c3e50' }}>Site Traffic</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#95a5a6' }}>
            Analytics integration coming soon
          </div>
        </div>

        <div style={{ flex: '2 1 600px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#2c3e50' }}>Recent Orders</h2>
            <a href="/admin/orders" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>View All</a>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Order ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>No recent orders.</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>#{order.id.substring(0, 8)}</td>
                    <td style={{ padding: '12px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{formatPrice(order.totalAmount)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                        backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#d1e7dd',
                        color: order.status === 'PENDING' ? '#856404' : '#0f5132'
                      }}>
                        {order.status}
                      </span>
                    </td>
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
