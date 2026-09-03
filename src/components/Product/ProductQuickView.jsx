import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductQuickView = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '20px', zIndex: 10 }}
          >
            <FaTimes />
          </button>

          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
             {/* Layout splits into two cols on desktop */}
             <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                <div style={{ flex: '1 1 50%', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{product.name}</h2>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
                    {product.salePrice ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '10px' }}>Rs. {product.price.toLocaleString()}</span>
                        <span style={{ color: 'var(--color-heading-text)' }}>Rs. {product.salePrice.toLocaleString()}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-heading-text)' }}>Rs. {product.price.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <p style={{ color: 'var(--color-body-text)', marginBottom: '30px' }}>{product.description}</p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Size</h5>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          style={{
                            border: `1px solid ${selectedSize === size ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                            padding: '5px 15px',
                            backgroundColor: selectedSize === size ? 'var(--color-heading-text)' : 'transparent',
                            color: selectedSize === size ? 'white' : 'var(--color-body-text)'
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Color</h5>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.colors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{
                            border: `1px solid ${selectedColor === color ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                            padding: '5px 15px',
                            backgroundColor: selectedColor === color ? 'var(--color-heading-text)' : 'transparent',
                            color: selectedColor === color ? 'white' : 'var(--color-body-text)'
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', border: '1px solid var(--color-separator)' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 15px' }}>-</button>
                      <input 
                        type="number" 
                        value={quantity} 
                        readOnly 
                        style={{ width: '50px', textAlign: 'center', border: 'none', outline: 'none' }} 
                      />
                      <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '10px 15px' }}>+</button>
                    </div>
                    
                    <button 
                      className="btn btn-primary" 
                      onClick={handleAddToCart}
                      style={{ flex: 1 }}
                    >
                      Add to Cart
                    </button>
                    
                    <button 
                      onClick={() => toggleWishlist(product)}
                      style={{ fontSize: '24px', color: isInWishlist(product.id) ? 'var(--color-accent)' : 'var(--color-heading-text)' }}
                    >
                      {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ProductQuickView;
