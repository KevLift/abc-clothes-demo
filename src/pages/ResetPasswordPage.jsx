import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.resetPassword(token, password);
      setMessage('Password updated. You can now log in.');
    } catch {
      setError('Reset failed. The link may be invalid or expired.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '480px' }}>
      <h1 style={{ marginBottom: '20px' }}>Reset Password</h1>
      {!token ? (
        <p>Missing reset token.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid var(--color-separator)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Password</button>
        </form>
      )}
      {message && <p style={{ color: '#2e7d32', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: '#c62828', marginTop: '15px' }}>{error}</p>}
      <p style={{ marginTop: '20px' }}><Link to="/account">Back to login</Link></p>
    </div>
  );
};

export default ResetPasswordPage;
