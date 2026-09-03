import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container text-center" style={{ paddingTop: '150px', paddingBottom: '100px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '80px', marginBottom: '20px', color: 'var(--color-separator)' }}>404</h1>
      <h2 style={{ marginBottom: '30px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-body-text)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '15px 40px' }}>
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
