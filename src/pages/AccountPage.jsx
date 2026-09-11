import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { canAccessAdmin } from '../utils/roles';
import { getApiErrorMessage } from '../utils/errors';

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid var(--color-separator)',
  marginBottom: '10px',
};

const CHANNEL_LABELS = {
  WELCOME: 'Welcome',
  ORDER_CONFIRMED: 'Order confirmed',
  ORDER_SHIPPED: 'Order shipped',
  ORDER_DELIVERED: 'Order delivered',
  PAYMENT_COMPLETED: 'Payment received',
  PAYMENT_FAILED: 'Payment failed',
  PASSWORD_RESET: 'Password reset',
  CART_ABANDONED: 'Items left in your cart',
  INQUIRY_RESPONSE: 'Reply to your message',
  CUSTOM_MESSAGE: 'Message from the store',
};

const NotificationRow = ({ n, onRead }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen((wasOpen) => {
      if (!wasOpen && !n.isRead) onRead?.(n.id);
      return !wasOpen;
    });
  };
  const title = n.subject || CHANNEL_LABELS[n.channel] || n.channel || n.type || 'Notification';
  const when = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
  const body = n.body || '';
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(body);

  return (
    <div style={{ borderBottom: '1px solid var(--color-separator)', padding: '14px 0', opacity: n.isRead ? 0.55 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        {!n.isRead && (
          <span style={{ width: '7px', height: '7px', borderRadius: 0, background: 'var(--color-accent)', flexShrink: 0 }} />
        )}
        <strong>{title}</strong>
      </div>
      {when && <div style={{ fontSize: '12px', color: 'var(--color-body-text)', marginTop: '2px' }}>{when}</div>}
      {body && (
        <>
          <button
            type="button"
            onClick={toggle}
            style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-accent)', fontSize: '13px' }}
          >
            {open ? 'Hide message ▲' : 'View message ▼'}
          </button>
          {open && (looksHtml ? (
            <iframe
              title={`notification-${n.id}`}
              sandbox=""
              srcDoc={body}
              style={{ width: '100%', height: '420px', border: '1px solid var(--color-separator)', borderRadius: 0, marginTop: '8px', background: 'white' }}
            />
          ) : (
            <p style={{ fontSize: '14px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{body}</p>
          ))}
        </>
      )}
    </div>
  );
};

const AccountPage = () => {
  const { user, isAuthenticated, login, register, logout, logoutAllDevices, updateUserLocal } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [tab, setTab] = useState('orders');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'LK',
    isDefault: true,
  });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [trackForm, setTrackForm] = useState({ orderNumber: '', email: '' });
  const [trackResult, setTrackResult] = useState(null);
  const [message, setMessage] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const load = async () => {
      setLoadingOrders(true);
      try {
        if (user.role === 'CUSTOMER') {
          const page = await orderService.getUserOrders(user.userId);
          setOrders(page.content || []);
        } else {
          setOrders([]);
        }
        const [addrs, notifs] = await Promise.all([
          authService.getAddresses().catch(() => []),
          notificationService.getMine().catch(() => []),
        ]);
        setAddresses(Array.isArray(addrs) ? addrs : []);
        setNotifications(Array.isArray(notifs) ? notifs : []);

        const me = await authService.getMe().catch(() => null);
        if (me) {
          setProfileForm({
            firstName: me.firstName || '',
            lastName: me.lastName || '',
            phone: me.phone || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    load();
  }, [isAuthenticated, user?.userId, user?.role]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(loginData.email, loginData.password);
    if (!result.success) {
      setError(getApiErrorMessage(result.error, 'Invalid credentials'));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(registerData.name, registerData.email, registerData.password);
    if (!result.success) {
      setError(getApiErrorMessage(result.error, 'Registration failed'));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const updated = await authService.updateMe(profileForm);
      updateUserLocal({
        name: `${updated.firstName || profileForm.firstName} ${updated.lastName || profileForm.lastName}`.trim(),
        firstName: updated.firstName || profileForm.firstName,
        lastName: updated.lastName || profileForm.lastName,
      });
      setMessage('Profile updated');
    } catch {
      setMessage('Failed to update profile');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Password changed');
    } catch {
      setMessage('Failed to change password');
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await authService.createAddress(addressForm);
      const addrs = await authService.getAddresses();
      setAddresses(Array.isArray(addrs) ? addrs : []);
      setAddressForm({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        countryCode: 'LK',
        isDefault: true,
      });
      setMessage('Address saved');
    } catch {
      setMessage('Failed to save address');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId, 'Cancelled by customer');
      const page = await orderService.getUserOrders(user.userId);
      setOrders(page.content || []);
    } catch {
      alert('Could not cancel order');
    }
  };

  const trackOrder = async (e) => {
    e.preventDefault();
    try {
      const result = await orderService.trackOrder(trackForm.orderNumber, trackForm.email);
      setTrackResult(result);
    } catch {
      setTrackResult({ error: 'Order not found' });
    }
  };

  if (isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '60vh' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '20px' }}>
            <div>
              <h1>My Account</h1>
              <p style={{ color: 'var(--color-body-text)', marginTop: '5px' }}>
                {user.name} · {user.email} · {user.role}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {canAccessAdmin(user) && (
                <Link to="/admin" className="btn btn-primary">Admin Dashboard</Link>
              )}
              <button onClick={logout} className="btn btn-outline">Logout</button>
              <button
                onClick={async () => {
                  await logoutAllDevices();
                  setMessage('Signed out of all devices');
                }}
                className="btn btn-outline"
                title="Revoke every active session for this account"
              >
                Sign Out All Devices
              </button>
            </div>
          </div>

          {message && <p style={{ marginBottom: '20px', color: '#2e7d32' }}>{message}</p>}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
            {['orders', 'profile', 'addresses', 'notifications', 'track'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={tab === t ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Order History</h3>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div style={{ border: '1px solid var(--color-separator)', padding: '30px', textAlign: 'center' }}>
                  <p>You haven&apos;t placed any orders yet.</p>
                  <Link to="/shop" className="btn btn-primary" style={{ marginTop: '15px' }}>Shop Now</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const itemCount = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
                    return (
                      <div key={order.id} style={{ border: '1px solid var(--color-separator)', padding: '20px' }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setExpandedOrderId(isExpanded ? null : order.id); }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <strong>{order.orderNumber || order.id?.substring?.(0, 8)}</strong>
                            <span>{order.status}</span>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--color-body-text)', margin: '10px 0' }}>
                            Placed: {order.placedAt || order.createdAt
                              ? new Date(order.placedAt || order.createdAt).toLocaleString()
                              : '—'}
                            {' · '}{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{formatPrice(order.totalAmount, order.currency)}</p>
                            <span style={{ fontSize: '13px', color: 'var(--color-accent)' }}>
                              {itemCount} item{itemCount === 1 ? '' : 's'} — {isExpanded ? 'Hide' : 'View'} products {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div style={{ marginTop: '15px', borderTop: '1px solid var(--color-separator)', paddingTop: '15px' }}>
                            {(order.items || []).map((item) => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', marginTop: '10px' }}>
                                <img
                                  src={item.imageUrl || '/images/product-placeholder.svg'}
                                  alt=""
                                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 0, flexShrink: 0 }}
                                  onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                                />
                                <span style={{ flex: 1 }}>{item.quantity}× {item.productName}</span>
                                <span>{formatPrice(item.subtotal ?? item.totalPrice ?? item.lineTotal, order.currency)}</span>
                                {['PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status) && item.productId && (
                                  <Link to={`/product/${item.productId}#reviews`} style={{ color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>
                                    Write a review
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {['PENDING', 'PAID', 'CONFIRMED'].includes(order.status) && (
                          <button className="btn btn-outline" style={{ marginTop: '15px' }} onClick={() => cancelOrder(order.id)}>
                            Cancel Order
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <form onSubmit={saveProfile}>
                <h3 style={{ marginBottom: '15px' }}>Profile</h3>
                <input style={inputStyle} placeholder="First name" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                <input style={inputStyle} placeholder="Last name" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                <input style={inputStyle} placeholder="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </form>
              <form onSubmit={changePassword}>
                <h3 style={{ marginBottom: '15px' }}>Change Password</h3>
                <input style={inputStyle} type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                <input style={inputStyle} type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
                <button type="submit" className="btn btn-primary">Update Password</button>
              </form>
            </div>
          )}

          {tab === 'addresses' && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>Addresses</h3>
              {addresses.map((a) => (
                <div key={a.id} style={{ border: '1px solid var(--color-separator)', padding: '15px', marginBottom: '10px' }}>
                  <strong>{a.fullName || a.name}</strong>
                  <p style={{ fontSize: '14px' }}>
                    {a.addressLine1 || a.line1}, {a.city}, {a.postalCode}, {a.countryCode || a.country}
                  </p>
                  <button className="btn btn-outline" onClick={async () => {
                    await authService.deleteAddress(a.id);
                    setAddresses(await authService.getAddresses());
                  }}>Delete</button>
                </div>
              ))}
              <form onSubmit={addAddress} style={{ marginTop: '20px', maxWidth: '400px' }}>
                <h4>Add Address</h4>
                {['fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'countryCode'].map((key) => (
                  <input
                    key={key}
                    style={inputStyle}
                    placeholder={key}
                    value={addressForm[key]}
                    onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
                    required={['fullName', 'addressLine1', 'city', 'postalCode', 'countryCode'].includes(key)}
                  />
                ))}
                <button type="submit" className="btn btn-primary">Save Address</button>
              </form>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3>Notifications</h3>
                <button className="btn btn-outline" onClick={async () => {
                  await notificationService.markAllRead();
                  setNotifications(await notificationService.getMine());
                }}>Mark all read</button>
              </div>
              {notifications.length === 0 ? (
                <p>No notifications.</p>
              ) : (
                notifications.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onRead={async (id) => {
                      setNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
                      try {
                        await notificationService.markRead(id);
                      } catch {
                        // non-critical — list refreshes on next visit
                      }
                    }}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'track' && (
            <form onSubmit={trackOrder} style={{ maxWidth: '400px' }}>
              <h3 style={{ marginBottom: '15px' }}>Track Order</h3>
              <input style={inputStyle} placeholder="Order number" value={trackForm.orderNumber} onChange={(e) => setTrackForm({ ...trackForm, orderNumber: e.target.value })} required />
              <input style={inputStyle} type="email" placeholder="Email" value={trackForm.email} onChange={(e) => setTrackForm({ ...trackForm, email: e.target.value })} required />
              <button type="submit" className="btn btn-primary">Track</button>
              {trackResult && (trackResult.error ? (
                <p style={{ marginTop: '20px', color: '#c62828' }}>{trackResult.error}</p>
              ) : (
                <div style={{ marginTop: '20px', border: '1px solid var(--color-separator)', borderRadius: 0, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <strong>{trackResult.orderNumber}</strong>
                    <span style={{ fontWeight: 700, letterSpacing: '0.5px', color: 'var(--color-accent)' }}>
                      {(trackResult.status || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  {[
                    ['Placed', trackResult.placedAt],
                    ['Shipped', trackResult.shippedAt],
                    ['Delivered', trackResult.deliveredAt],
                  ].map(([label, ts]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' }}>
                      <span style={{ color: 'var(--color-body-text)' }}>{label}</span>
                      <span>{ts ? new Date(ts).toLocaleString() : '—'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '60vh' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>{isLoginView ? 'Login' : 'Register'}</h1>
        {error && <p style={{ color: '#c62828', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

        {isLoginView ? (
          <form onSubmit={handleLoginSubmit}>
            <input style={inputStyle} type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
            <input style={inputStyle} type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '15px' }}>Login</button>
            <p style={{ textAlign: 'center', fontSize: '14px' }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <input style={inputStyle} placeholder="Full name" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} required />
            <input style={inputStyle} type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
            <input style={inputStyle} type="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
            {isLoginView ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AccountPage;
