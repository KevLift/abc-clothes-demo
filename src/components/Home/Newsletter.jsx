import React, { useState } from 'react';
import Toast from '../UI/Toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Mock saving email
      setShowToast(true);
      setEmail('');
    }
  };

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-light-bg)', padding: '60px 0' }}>
      <div className="container text-center">
        <h3 style={{ marginBottom: '15px' }}>Subscribe to our newsletter</h3>
        <p style={{ marginBottom: '30px', color: 'var(--color-body-text)' }}>
          Get the latest updates on new products and upcoming sales
        </p>
        
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex' }}>
          <input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: '12px 20px',
              border: '1px solid var(--color-separator)',
              borderRight: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Subscribe
          </button>
        </form>
      </div>
      <Toast 
        message="Successfully subscribed to the newsletter!" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </section>
  );
};

export default Newsletter;
