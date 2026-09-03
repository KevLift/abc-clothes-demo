import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          ABC Admin
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                padding: '12px 15px',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
          <Link to="/" style={{ color: '#bdc3c7', textDecoration: 'underline' }}>&larr; Back to Shop</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
