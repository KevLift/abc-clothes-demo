import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter, FaPinterestP, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-dark-bg)',
      color: 'white',
      padding: '60px 0 20px',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Column 1: Pages */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>PAGES</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop?category=Women">Women's Collection</Link></li>
            <li><Link to="/shop?category=Men">Men's Collection</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Column 2: About */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>ABOUT</h3>
          <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.8' }}>
            ABC Clothes is Sri Lanka's leading bespoke designer label catering high end luxury garments and accessories. 
            With years of experience in tailoring, we are the one-stop store for all your clothing needs.
          </p>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>CONTACT</h3>
          <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.8' }}>
            Address: 123 Fashion Avenue, Colombo, Sri Lanka<br/><br/>
            Phone: (+94) 112 345 678<br/><br/>
            Email: info@abcclothes.lk
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <a href="#" style={{ color: 'white' }}><FaTwitter /></a>
            <a href="#" style={{ color: 'white' }}><FaFacebookF /></a>
            <a href="#" style={{ color: 'white' }}><FaInstagram /></a>
            <a href="#" style={{ color: 'white' }}><FaYoutube /></a>
            <a href="#" style={{ color: 'white' }}><FaPinterestP /></a>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>NEWSLETTER</h3>
          <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '15px' }}>
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form style={{ display: 'flex' }} onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              style={{
                padding: '10px',
                border: 'none',
                flex: 1,
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 15px' }}
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid #333',
        paddingTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        fontSize: '12px',
        color: '#888'
      }}>
        <p>&copy; {new Date().getFullYear()} ABC Clothes. All rights reserved.</p>
        <div>
          <span>Secure Payments</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
