import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
    </div>
  );
};

export default AdminDashboardPage;
