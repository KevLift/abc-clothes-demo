import React from 'react';
import { motion } from 'framer-motion';

const BrandBanner = () => {
  return (
    <section className="section" style={{ backgroundColor: 'var(--color-dark-bg)', padding: '100px 0', marginTop: '60px' }}>
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ color: 'white', maxWidth: '800px', margin: '0 auto', fontSize: '24px', lineHeight: '1.6' }}>
            ABC Clothes specialises in catering both the bride and groom for a hassle free wedding experience delivering only the best tailored suits and dresses.
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandBanner;
