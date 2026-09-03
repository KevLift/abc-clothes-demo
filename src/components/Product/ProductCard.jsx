import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FaHeart, FaRegHeart, FaEye, FaShoppingBag } from 'react-icons/fa';
import ProductQuickView from './ProductQuickView';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, product.sizes[0], product.colors[0], 1);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <>
      <div 
        style={{ position: 'relative', overflow: 'hidden', marginBottom: '30px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} style={{ display: 'block', position: 'relative' }}>
          {product.salePrice && (
            <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--color-accent)', color: 'white', padding: '5px 10px', fontSize: '11px', textTransform: 'uppercase', zIndex: 10 }}>
              Sale
            </span>
          )}
          {product.isNew && !product.salePrice && (
            <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--color-heading-text)', color: 'white', padding: '5px 10px', fontSize: '11px', textTransform: 'uppercase', zIndex: 10 }}>
              New
            </span>
          )}
          
          <img 
            src={product.images[0]} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '400px', 
              objectFit: 'cover',
              transition: 'transform var(--transition-slow)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }} 
          />
          
          {/* Hover Actions Overlay */}
          <div style={{
            position: 'absolute',
            bottom: isHovered ? '0' : '-50px',
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '15px 0',
            transition: 'bottom var(--transition-normal)',
            opacity: isHovered ? 1 : 0
          }}>
            <button onClick={handleAddToCart} title="Add to Cart" style={{ color: 'var(--color-heading-text)' }}><FaShoppingBag size={18} /></button>
            <button onClick={(e) => { e.preventDefault(); setShowQuickView(true); }} title="Quick View" style={{ color: 'var(--color-heading-text)' }}><FaEye size={18} /></button>
            <button onClick={handleToggleWishlist} title="Wishlist" style={{ color: isInWishlist(product.id) ? 'var(--color-accent)' : 'var(--color-heading-text)' }}>
              {isInWishlist(product.id) ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
            </button>
          </div>
        </Link>
        
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '5px', color: 'var(--color-body-text)', textTransform: 'none', letterSpacing: 'normal' }}>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}>
            {product.salePrice ? (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '10px' }}>{formatPrice(product.basePrice || product.price)}</span>
                <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(product.salePrice)}</span>
              </>
            ) : (
              <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(product.basePrice || product.price)}</span>
            )}
          </div>
        </div>
      </div>

      {showQuickView && (
        <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};

export default ProductCard;
