import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeaturedCollection = () => {
  return (
    <section style={{ padding: '80px 0', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h3>Collections</h3>
      </div>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
        {/* Text Block */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ flex: '1 1 350px', padding: '20px 0' }}
        >
          <h5 style={{ marginBottom: '20px', lineHeight: 1.4 }}>
            Introducing the GOLD LABEL<br/>from ABC Clothes
          </h5>
          <p style={{ marginBottom: '30px', color: 'var(--color-body-text)', lineHeight: 1.8 }}>
            Incorporating fine Italian tailoring with modern design, our Gold label suits are a fusion of quality materials and luxury fashion. The highest quality linens, silks and wools have been used to tailor these fine suits all the way from Milan, Italy.
          </p>
          <Link to="/shop?category=Men" className="btn btn-outline">
            View Collection
          </Link>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ flex: '1 1 400px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=900&h=700&fit=crop&auto=format&q=80"
            alt="Gold Label Collection"
            style={{ width: '100%', height: '550px', objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
