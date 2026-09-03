import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';

const AccountPage = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const data = await orderService.getUserOrders();
          setOrders(data);
        } catch (err) {
          console.error("Failed to fetch orders", err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (!success) {
      setError('Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const success = await register(registerData.name, registerData.email, registerData.password);
    if (!success) {
      setError('Registration failed');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '20px' }}>
            <h1>My Account</h1>
            <button onClick={logout} className="btn btn-outline">Logout</button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ marginBottom: '20px' }}>Profile Information</h3>
              <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '30px', borderRadius: '4px' }}>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button className="btn btn-outline" style={{ marginTop: '20px' }}>Edit Profile</button>
              </div>
            </div>
            
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ marginBottom: '20px' }}>Order History</h3>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div style={{ border: '1px solid var(--color-separator)', padding: '30px', borderRadius: '4px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-body-text)' }}>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid var(--color-separator)', padding: '20px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong>Order #{order.id.substring(0, 8)}</strong>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#d1e7dd',
                          color: order.status === 'PENDING' ? '#856404' : '#0f5132'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--color-body-text)', marginBottom: '10px' }}>
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div style={{ fontSize: '14px' }}>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                            <span>{item.quantity}x {item.productName}</span>
                            <span>{formatPrice(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--color-separator)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '70vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', marginBottom: '30px' }}>
          <button 
            onClick={() => { setIsLoginView(true); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '15px', 
              borderBottom: isLoginView ? '2px solid var(--color-heading-text)' : '2px solid var(--color-separator)',
              color: isLoginView ? 'var(--color-heading-text)' : 'var(--color-body-text)',
              fontSize: '16px',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLoginView(false); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '15px', 
              borderBottom: !isLoginView ? '2px solid var(--color-heading-text)' : '2px solid var(--color-separator)',
              color: !isLoginView ? 'var(--color-heading-text)' : 'var(--color-body-text)',
              fontSize: '16px',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase'
            }}
          >
            Register
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        {isLoginView ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Email Address *</label>
              <input 
                type="email" 
                value={loginData.email} 
                onChange={e => setLoginData({...loginData, email: e.target.value})} 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Password *</label>
              <input 
                type="password" 
                value={loginData.password} 
                onChange={e => setLoginData({...loginData, password: e.target.value})} 
                required 
                style={inputStyle} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Full Name *</label>
              <input 
                type="text" 
                value={registerData.name} 
                onChange={e => setRegisterData({...registerData, name: e.target.value})} 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Email Address *</label>
              <input 
                type="email" 
                value={registerData.email} 
                onChange={e => setRegisterData({...registerData, email: e.target.value})} 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Password *</label>
              <input 
                type="password" 
                value={registerData.password} 
                onChange={e => setRegisterData({...registerData, password: e.target.value})} 
                required 
                style={inputStyle} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  border: '1px solid var(--color-separator)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
};

export default AccountPage;
