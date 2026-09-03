import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        height: '480px',
        backgroundImage: `url(https://images.unsplash.com/photo-1542190891-2093d38760f2?w=1600&h=500&fit=crop&auto=format&q=80)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
        >
          <h1 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '15px' }}>About Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-heading)', fontSize: '16px', letterSpacing: '2px' }}>
            Luxury tailoring since 2008
          </p>
        </motion.div>
      </div>

      <div className="container" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', marginBottom: '80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{ marginBottom: '25px' }}>Our Story</h2>
            <p style={{ fontSize: '16px', lineHeight: 1.9, color: 'var(--color-body-text)' }}>
              ABC Clothes is Sri Lanka's leading bespoke designer label catering high end luxury garments and accessories.
              With over 15 years of experience in tailoring, we are the one-stop store for all your wedding grooming needs.
              We specialize in creating unique, high-quality garments that blend traditional Sri Lankan craftsmanship with modern design aesthetics.
            </p>
          </motion.div>
        </div>

        {/* Mission / Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          {[
            { title: 'Our Mission', text: 'To provide our clients with unparalleled tailoring quality and exceptional service, ensuring every garment fits perfectly and makes them feel confident and elegant.' },
            { title: 'Our Vision', text: 'To be globally recognized as a premier luxury fashion house that sets the standard for bespoke tailoring and design innovation in South Asia.' },
            { title: 'Our Values', text: 'Excellence in craftsmanship, respect for tradition, and innovation in design. We believe that every garment tells a story and we are committed to making yours extraordinary.' }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{
                padding: '40px 30px',
                border: '1px solid var(--color-separator)',
                textAlign: 'center'
              }}
            >
              <h3 style={{ marginBottom: '15px' }}>{card.title}</h3>
              <p style={{ color: 'var(--color-body-text)', lineHeight: 1.7 }}>{card.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Process */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ marginBottom: '50px' }}>The Bespoke Process</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px' }}>
            {[
              { step: '01', title: 'Consultation', desc: 'Discuss your vision and requirements with our expert designers.' },
              { step: '02', title: 'Fabric Selection', desc: 'Choose from our wide range of premium imported fabrics from Italy and the UK.' },
              { step: '03', title: 'Fitting Sessions', desc: 'Multiple fittings to ensure the garment fits flawlessly to your measurements.' },
              { step: '04', title: 'Delivery', desc: 'Your finished garment is delivered with precision and care, ready to wear.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ flex: '1 1 180px', maxWidth: '220px' }}
              >
                <div style={{ fontSize: '40px', color: 'var(--color-accent)', marginBottom: '15px', fontFamily: 'var(--font-heading-alt)' }}>
                  {item.step}
                </div>
                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>{item.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-body-text)', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Store Image */}
        <img
          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&h=400&fit=crop&auto=format&q=80"
          alt="ABC Clothes Store"
          style={{ width: '100%', height: '400px', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default AboutPage;
