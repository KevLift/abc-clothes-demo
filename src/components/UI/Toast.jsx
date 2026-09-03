import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgColor = type === 'success' ? 'var(--color-success)' : 'var(--color-dark-bg)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: bgColor,
            color: 'white',
            padding: '15px 25px',
            borderRadius: '4px',
            zIndex: 9999,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span>{message}</span>
          <button 
            onClick={onClose}
            style={{ color: 'white', fontSize: '20px', marginLeft: '10px' }}
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
