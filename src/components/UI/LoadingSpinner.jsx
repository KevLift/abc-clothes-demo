import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: 'var(--color-primary-bg)',
      zIndex: 99999
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: '50px',
          height: '50px',
          border: '3px solid var(--color-separator)',
          borderTop: '3px solid var(--color-accent)',
          borderRadius: 0
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
