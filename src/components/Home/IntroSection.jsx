import React from 'react';
import { motion } from 'framer-motion';

const IntroSection = () => {
  return (
    <section className="section text-center" style={{ padding: '80px 20px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 style={{ marginBottom: '15px' }}>Luxury tailoring now in Sri Lanka</h3>
          <h2 style={{ lineHeight: '1.4' }}>
            ABC Clothes is the most prestigious designer wear label in Sri Lanka. Experience tailoring quality like never before.
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

export default IntroSection;
