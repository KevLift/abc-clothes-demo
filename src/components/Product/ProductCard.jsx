import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin } from '../../utils/roles';
import { FaHeart, FaRegHeart, FaEye, FaShoppingBag, FaEdit } from 'react-icons/fa';
import ProductQuickView from './ProductQuickView';
import ProductFormModal from '../Admin/ProductFormModal';
import { productService } from '../../services/productService';
import { saveVariantsWithStock } from '../../utils/saveVariantsWithStock';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const openEdit = async (e) => {
    e.preventDefault();
    try {
      const full = await productService.getProductById(product.id);
      setEditProduct(full);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not load product for editing.');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product, product.sizes?.[0], product.colors?.[0], 1);
    } catch {
      alert('Failed to add to cart');
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleEditSave = async (data) => {
    try {
      const { variants, ...raw } = data;
      const productPayload = {
        name: raw.name,
        slug: raw.slug,
        description: raw.description,
        categoryId: raw.categoryId || undefined,
        price: raw.price,
        ...(raw.compareAtPrice != null ? { compareAtPrice: raw.compareAtPrice } : {}),
        currency: raw.currency,
        featured: raw.featured,
        ...(raw.attributes ? { attributes: raw.attributes } : {}),
      };
      await productService.updateProduct(product.id, productPayload);

      if (variants?.length) {
        const errors = await saveVariantsWithStock(product.id, variants, raw.currency || 'LKR');
        if (errors.length) alert(`Saved with some stock errors:\n${errors.join('\n')}`);
      }

      setIsEditModalOpen(false);
      setEditProduct(null);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update product', err);
      alert(err.response?.data?.message || 'Failed to update product. Please try again.');
    }
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
          {canAccessAdmin(user) && (
            <button 
              onClick={openEdit}
              style={{ 
                position: 'absolute', top: '10px', right: '10px', zIndex: 20, 
                backgroundColor: 'white', color: 'var(--color-accent)', border: 'none', 
                borderRadius: '50%', width: '35px', height: '35px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              title="Edit Product"
            >
              <FaEdit size={16} />
            </button>
          )}
          
          <img 
            src={product.images?.[0] || product.primaryImageUrl || product.image || '/images/product-placeholder.svg'} 
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.dataset.fallback === '1') return;
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = '/images/product-placeholder.svg';
            }}
            style={{ 
              width: '100%', 
              height: '400px', 
              objectFit: 'cover',
              transition: 'transform var(--transition-slow)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              backgroundColor: 'var(--color-light-bg)',
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
                <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '10px' }}>{formatPrice(product.basePrice || product.price, product.currency)}</span>
                <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(product.salePrice, product.currency)}</span>
              </>
            ) : (
              <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(product.basePrice || product.price, product.currency)}</span>
            )}
          </div>
        </div>
      </div>

      {showQuickView && (
        <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />
      )}
      
      <ProductFormModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditProduct(null); }}
        onSave={handleEditSave}
        productToEdit={editProduct || product}
      />
    </>
  );
};

export default ProductCard;
