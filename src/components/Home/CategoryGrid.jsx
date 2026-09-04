import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../../services/productService';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=600&fit=crop&auto=format&q=80',
];

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getCategories()
      .then((cats) => {
        const roots = (cats || []).filter((c) => !c.parentId);
        setCategories(roots);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Categories</h3>
        <p style={{ color: 'var(--color-body-text)', marginTop: 20 }}>Loading collections...</p>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Categories</h3>
        <p style={{ color: 'var(--color-body-text)', marginTop: 20, maxWidth: 480, marginInline: 'auto' }}>
          Collections will appear here once the store adds clothing categories.
        </p>
        <Link to="/shop" className="btn btn-outline" style={{ marginTop: 20, display: 'inline-block' }}>
          Browse Shop
        </Link>
      </section>
    );
  }

  return (
    <section style={{ padding: '0 0 60px' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <h3>Categories</h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            style={{
              flex: '1 1 300px',
              height: '500px',
              position: 'relative',
              overflow: 'hidden',
              margin: '10px',
            }}
          >
            <Link
              to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
              style={{ display: 'block', height: '100%' }}
            >
              <img
                src={cat.imageUrl || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: '40px', left: '40px',
                backgroundColor: 'rgba(255,255,255,0.92)', padding: '25px 30px',
              }}>
                <h2 style={{ marginBottom: '5px', fontSize: '22px' }}>{cat.name}</h2>
                <p style={{ color: 'var(--color-section-heading)', fontSize: '13px', marginBottom: '12px' }}>
                  {cat.description || 'Shop the collection'}
                </p>
                <span style={{
                  borderBottom: '1px solid var(--color-heading-text)',
                  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  Browse Products
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
