import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { useStoreCategories } from '../../hooks/useStoreCategories';

const Footer = () => {
  const location = useLocation();
  const { navItems } = useStoreCategories();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: 'var(--color-dark-bg)',
      color: 'white',
      padding: '60px 0 20px',
      marginTop: 'auto',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        marginBottom: '40px',
      }}>
        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>PAGES</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop All</Link></li>
            {navItems.slice(0, 6).map((cat) => (
              <li key={cat.id || cat.to}>
                <Link to={cat.to}>{cat.label}</Link>
              </li>
            ))}
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>ABOUT</h3>
          <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.8' }}>
            ABC Clothes is Sri Lanka&apos;s leading bespoke designer label catering high end luxury garments and accessories.
            With years of experience in tailoring, we are the one-stop store for all your clothing needs.
          </p>
        </div>

        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>CONTACT</h3>
          <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.8' }}>
            123 Fashion Avenue<br />
            Colombo 07, Sri Lanka<br />
            +94 11 234 5678<br />
            hello@abcclothes.lk
          </p>
        </div>

        <div>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>FOLLOW US</h3>
          <div style={{ display: 'flex', gap: '15px', fontSize: '18px' }}>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://pinterest.com" aria-label="Pinterest"><FaPinterestP /></a>
            <a href="https://youtube.com" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#999',
      }}>
        © {new Date().getFullYear()} ABC Clothes. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
