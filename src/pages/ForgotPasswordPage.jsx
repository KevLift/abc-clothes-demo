import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authService.forgotPassword(email);
      setMessage('If that email exists, a reset link has been sent.');
    } catch {
      setError('Unable to process request. Please try again.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '480px' }}>
      <h1 style={{ marginBottom: '20px' }}>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid var(--color-separator)' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Reset Link</button>
      </form>
      {message && <p style={{ color: '#2e7d32', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: '#c62828', marginTop: '15px' }}>{error}</p>}
      <p style={{ marginTop: '20px' }}><Link to="/account">Back to login</Link></p>
    </div>
  );
};

export default ForgotPasswordPage;
