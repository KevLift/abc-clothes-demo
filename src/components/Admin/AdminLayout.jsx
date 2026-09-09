import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, isStoreOwner, isPlatformOperator } from '../../utils/roles';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Lock document scroll so only sidebar / content panes move
  useEffect(() => {
    const { style: htmlStyle } = document.documentElement;
    const { style: bodyStyle } = document.body;
    const prevHtml = htmlStyle.overflow;
    const prevBody = bodyStyle.overflow;
    htmlStyle.overflow = 'hidden';
    bodyStyle.overflow = 'hidden';
    return () => {
      htmlStyle.overflow = prevHtml;
      bodyStyle.overflow = prevBody;
    };
  }, []);

  const allNav = [
    { name: 'Dashboard', path: '/admin', permission: null },
    { name: 'Products', path: '/admin/products', permission: 'products:view' },
    { name: 'Categories', path: '/admin/categories', permission: 'products:update' },
    { name: 'Inventory', path: '/admin/inventory', permission: 'inventory:view' },
    { name: 'Orders', path: '/admin/orders', permission: 'orders:view' },
    { name: 'Payments', path: '/admin/payments', permission: 'orders:view' },
    { name: 'Customers', path: '/admin/customers', permission: 'customers:view' },
    { name: 'Team', path: '/admin/team', ownerOnly: true },
    { name: 'Reviews', path: '/admin/reviews', permission: 'products:update' },
    { name: 'Wishlist', path: '/admin/wishlist', permission: 'products:view' },
    { name: 'Analytics', path: '/admin/analytics', permission: 'analytics:view' },
    { name: 'Notifications', path: '/admin/notifications', ownerOnly: true },
    { name: 'Inquiries', path: '/admin/inquiries', permission: 'customers:view' },
    { name: 'Settings', path: '/admin/settings', permission: 'settings:view' },
    { name: 'Social', path: '/admin/social', permission: 'settings:manage' },
    { name: 'Platform', path: '/admin/platform', platformRoles: ['PLATFORM_ADMIN', 'PLATFORM_SUPPORT'] },
    { name: 'Admin Config', path: '/admin/config', platformRoles: ['PLATFORM_ADMIN'] },
  ];

  const platformOperator = isPlatformOperator(user);

  const navItems = allNav.filter((item) => {
    // Platform operators only ever see the platform-scoped items.
    if (platformOperator) return Boolean(item.platformRoles?.includes(user?.role));
    if (item.platformRoles) return false;
    if (item.ownerOnly) return isStoreOwner(user);
    if (!item.permission) return true;
    return hasPermission(user, item.permission);
  });

  const handleLogout = async () => {
    await logout();
    navigate('/account');
  };

  return (
    <div className="sidebar-layout sidebar-layout--fixed">
      <aside className="sidebar-layout__aside sidebar-layout__aside--admin">
        <div className="sidebar-layout__aside-inner">
          <div>
            <h2 style={{
              color: 'white',
              marginBottom: '10px',
              fontSize: '20px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
            >
              ABC Admin
            </h2>
            <p style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '25px' }}>
              {user?.name || user?.email}
              <br />
              {user?.role}
            </p>
          </div>

          <nav className="sidebar-layout__nav">
            {navItems.map((item) => {
              const active = location.pathname === item.path
                || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    padding: '10px 12px',
                    color: 'white',
                    textDecoration: 'none',
                    backgroundColor: active ? '#34495e' : 'transparent',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #34495e', marginTop: 'auto' }}>
            <Link
              to="/"
              style={{
                color: '#bdc3c7',
                textDecoration: 'underline',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              ← Back to Shop
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #7f8c8d',
                color: '#ecf0f1',
                padding: '8px 12px',
                cursor: 'pointer',
                width: '100%',
                borderRadius: '4px',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="sidebar-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
