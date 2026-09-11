import React, { useState, useEffect } from 'react';
import Toast from '../components/UI/Toast';
import { inquiryService } from '../services/inquiryService';
import { settingsService } from '../services/settingsService';
import { getApiErrorMessage } from '../utils/errors';

const FALLBACK_PHONE = '(+94) 112 345 678';
const FALLBACK_EMAIL = 'info@abcclothes.lk';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    settingsService.getPublic().then(setStore).catch(() => {});
  }, []);

  const storePhone = store?.supportPhone?.trim() || FALLBACK_PHONE;
  const storeEmail = store?.storeEmail?.trim() || FALLBACK_EMAIL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await inquiryService.submitContact(formData);
      setShowToast(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>Contact Us</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h3 style={{ marginBottom: '20px' }}>Get in Touch</h3>
          <p style={{ marginBottom: '40px', color: 'var(--color-body-text)' }}>
            We'd love to hear from you. Please fill out the form below and we will get back to you as soon as possible.
          </p>
          
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: '#c62828', marginBottom: '15px' }}>{error}</p>}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Your Name *" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="email" 
                placeholder="Your Email *" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Subject" 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <textarea 
                placeholder="Your Message *" 
                required 
                rows="6"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                style={{ ...inputStyle, resize: 'vertical' }}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '15px 30px' }} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '40px', borderRadius: 0, height: '100%' }}>
            <h3 style={{ marginBottom: '20px' }}>Store Information</h3>
            
            <div style={{ marginBottom: '30px' }}>
              <h5 style={{ marginBottom: '5px' }}>Head Office & Flagship Store</h5>
              <p style={{ color: 'var(--color-body-text)', fontSize: '14px', lineHeight: 1.6 }}>
                123 Fashion Avenue<br/>
                Colombo 07<br/>
                Sri Lanka
              </p>
              <p style={{ color: 'var(--color-body-text)', fontSize: '14px', marginTop: '10px' }}>
                <strong>Phone:</strong> <a href={`tel:${storePhone.replace(/\s+/g, '')}`} style={{ color: 'inherit' }}>{storePhone}</a><br/>
                <strong>Email:</strong> <a href={`mailto:${storeEmail}`} style={{ color: 'inherit' }}>{storeEmail}</a>
              </p>
            </div>
            
            <div>
              <h5 style={{ marginBottom: '5px' }}>Opening Hours</h5>
              <p style={{ color: 'var(--color-body-text)', fontSize: '14px', lineHeight: 1.6 }}>
                Monday - Friday: 9:00 AM - 7:00 PM<br/>
                Saturday: 10:00 AM - 5:00 PM<br/>
                Sunday: Closed
              </p>
            </div>
            
            {/* Map Placeholder */}
            <div style={{ marginTop: '40px', width: '100%', height: '200px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Google Maps Embed
            </div>
          </div>
        </div>
      </div>
      
      <Toast 
        message="Your message has been sent successfully!" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '15px',
  border: '1px solid var(--color-separator)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
};

export default ContactPage;
