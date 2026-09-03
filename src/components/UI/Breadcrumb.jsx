import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav style={{ padding: '20px 0', fontSize: '12px', color: 'var(--color-body-text)', textTransform: 'uppercase' }}>
      <Link to="/" style={{ color: 'var(--color-section-heading)' }}>Home</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <span key={name}>
            <span style={{ margin: '0 10px' }}>/</span>
            {isLast ? (
              <span style={{ color: 'var(--color-heading-text)' }}>{name.replace(/-/g, ' ')}</span>
            ) : (
              <Link to={routeTo} style={{ color: 'var(--color-section-heading)' }}>{name.replace(/-/g, ' ')}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
