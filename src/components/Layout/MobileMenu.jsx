import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '300px',
            height: '100vh',
            backgroundColor: 'var(--color-primary-bg)',
            zIndex: 10000,
            padding: '40px 20px',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
          }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '24px' }}
          >
            <FaTimes />
          </button>

          <h2 style={{ marginBottom: '30px', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>MENU</h2>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-nav)', fontSize: '14px', textTransform: 'uppercase' }}>
            <Link to="/" onClick={onClose}>Home</Link>
            <Link to="/shop?category=Men" onClick={onClose}>Men's Collection</Link>
            <Link to="/shop?category=Women" onClick={onClose}>Women's Collection</Link>
            <Link to="/about" onClick={onClose}>About Us</Link>
            <Link to="/blog" onClick={onClose}>Blog</Link>
            <Link to="/contact" onClick={onClose}>Contact</Link>
            
            <hr style={{ borderColor: 'var(--color-separator)' }} />
            
            <Link to="/account" onClick={onClose}>My Account</Link>
            <Link to="/wishlist" onClick={onClose}>Wishlist</Link>
          </nav>
        </motion.div>
      )}
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'black',
            zIndex: 9999
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
