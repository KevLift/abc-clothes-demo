import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/admin/orders');
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Orders Management</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Order ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Total</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>#{order.id.substring(0, 8)}</td>
                  <td style={{ padding: '15px' }}>{order.userId}</td>
                  <td style={{ padding: '15px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '15px' }}>{formatPrice(order.totalAmount)}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '5px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#d1e7dd',
                      color: order.status === 'PENDING' ? '#856404' : '#0f5132'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button style={{ color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}>Update Status</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
