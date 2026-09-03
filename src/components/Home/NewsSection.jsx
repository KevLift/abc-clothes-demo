import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NewsSection = () => {
  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h3>In the News</h3>
      </div>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '40px', alignItems: 'center' }}>
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ flex: '1 1 400px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1542190891-2093d38760f2?w=900&h=600&fit=crop&auto=format&q=80"
            alt="News Banner"
            style={{ width: '100%', height: '500px', objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          />
        </motion.div>

        {/* Text Block */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ flex: '1 1 300px', padding: '20px 0' }}
        >
          <h5 style={{ marginBottom: '20px', lineHeight: 1.4 }}>
            <em>Ciao Italia!</em> ABCs debut international wedding in Milan
          </h5>
          <p style={{ marginBottom: '30px', color: 'var(--color-body-text)', lineHeight: 1.8 }}>
            Internationally acclaimed designer did his most recent international wedding in the Fashion capital of Milan in a modernist villa for a blooming couple in the midst of loved ones and friends. Both the groom and the bride were dressed by ABC Clothes...
          </p>
          <Link to="/blog" className="btn btn-outline">
            Read More
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
