import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryGrid = () => {
  const categories = [
    {
      id: 1,
      title: "Groomswear",
      subtitle: "Bespoke suits & tuxedos",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&h=600&fit=crop&auto=format&q=80",
      link: "/shop?category=Men"
    },
    {
      id: 2,
      title: "Brideswear",
      subtitle: "Gowns & bridal couture",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop&auto=format&q=80",
      link: "/shop?category=Women"
    }
  ];

  return (
    <section style={{ padding: '0 0 60px' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <h3>Categories</h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            style={{
              flex: '1 1 300px',
              height: '500px',
              position: 'relative',
              overflow: 'hidden',
              margin: '10px',
              cursor: 'pointer'
            }}
          >
            <Link to={cat.link} style={{ display: 'block', height: '100%' }}>
              <img
                src={cat.image}
                alt={cat.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                backgroundColor: 'rgba(255,255,255,0.92)',
                padding: '25px 30px',
                zIndex: 2
              }}>
                <h2 style={{ marginBottom: '5px', fontSize: '22px' }}>{cat.title}</h2>
                <p style={{ color: 'var(--color-section-heading)', fontSize: '13px', marginBottom: '12px' }}>{cat.subtitle}</p>
                <span style={{
                  borderBottom: '1px solid var(--color-heading-text)',
                  paddingBottom: '2px',
                  fontFamily: 'var(--font-nav)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '11px'
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
