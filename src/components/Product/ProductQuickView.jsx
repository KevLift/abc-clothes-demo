import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { productService } from '../../services/productService';
import { normalizeProduct } from '../../utils/productHelpers';
import { getApiErrorMessage } from '../../utils/errors';
import { useProductVariantState } from '../../hooks/useProductVariantState';

const QuickViewBody = ({ detail, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [adding, setAdding] = useState(false);

  const {
    availableSizes,
    availableColors,
    selectedSize,
    selectedColor,
    selectSize,
    selectColor,
    quantity,
    setQuantity,
    price,
    compareAtPrice,
    stockMessage,
    inStock,
    canAddToCart,
    maxQty,
    isCombinationInStock,
    isSizeAvailable,
    isColorAvailable,
  } = useProductVariantState(detail);

  const imageSrc = detail?.images?.[0] || detail?.image || '/images/product-placeholder.svg';

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      alert(inStock ? 'Please select a valid combination.' : 'Out of stock');
      return;
    }
    setAdding(true);
    try {
      await addToCart(detail, selectedSize, selectedColor, quantity);
      onClose();
    } catch (err) {
      alert(`Failed to add to cart: ${getApiErrorMessage(err)}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div style={{ flex: '1 1 50%', minWidth: '300px', background: 'var(--color-light-bg)' }}>
        <img
          src={imageSrc}
          alt={detail?.name || ''}
          onError={(e) => {
            if (e.currentTarget.dataset.fallback === '1') return;
            e.currentTarget.dataset.fallback = '1';
            e.currentTarget.src = '/images/product-placeholder.svg';
          }}
          style={{ width: '100%', height: '100%', minHeight: 360, objectFit: 'cover' }}
        />
      </div>

      <div style={{
        flex: '1 1 50%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{detail?.name}</h2>
        <div style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
          {compareAtPrice ? (
            <>
              <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '10px' }}>
                {formatPrice(compareAtPrice, detail?.currency)}
              </span>
              <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(price, detail?.currency)}</span>
            </>
          ) : (
            <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(price, detail?.currency)}</span>
          )}
        </div>

        {detail?.description ? (
          <p style={{ color: 'var(--color-body-text)', marginBottom: '20px' }}>{detail.description}</p>
        ) : null}

        {stockMessage && (
          <p style={{
            fontSize: 13,
            marginBottom: 16,
            fontWeight: 600,
            color: !inStock || stockMessage.includes('Out') || stockMessage.includes('Select')
              ? '#c62828'
              : '#2e7d32',
          }}
          >
            {stockMessage}
          </p>
        )}

        {availableSizes.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Size
            </h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {availableSizes.map((size) => {
                const comboOk = isCombinationInStock(size, selectedColor) || isSizeAvailable(size);
                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => selectSize(size)}
                    style={{
                      border: `1px solid ${selectedSize === size ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                      padding: '5px 15px',
                      backgroundColor: selectedSize === size ? 'var(--color-heading-text)' : 'transparent',
                      color: selectedSize === size ? 'white' : 'var(--color-body-text)',
                      opacity: comboOk ? 1 : 0.45,
                      textDecoration: comboOk ? 'none' : 'line-through',
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h5 style={{ fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Color
            </h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {availableColors.map((color) => {
                const comboOk = isCombinationInStock(selectedSize, color) || isColorAvailable(color);
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => selectColor(color)}
                    style={{
                      border: `1px solid ${selectedColor === color ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                      padding: '5px 15px',
                      backgroundColor: selectedColor === color ? 'var(--color-heading-text)' : 'transparent',
                      color: selectedColor === color ? 'white' : 'var(--color-body-text)',
                      opacity: comboOk ? 1 : 0.45,
                      textDecoration: comboOk ? 'none' : 'line-through',
                    }}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--color-separator)' }}>
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 15px' }}>-</button>
            <input
              type="number"
              value={quantity}
              readOnly
              style={{ width: '50px', textAlign: 'center', border: 'none', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              style={{ padding: '10px 15px' }}
              disabled={!inStock}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={adding || !canAddToCart}
            style={{ flex: 1, opacity: canAddToCart ? 1 : 0.55 }}
          >
            {adding ? 'Adding...' : (!inStock ? 'Out of Stock' : 'Add to Cart')}
          </button>

          <button
            type="button"
            onClick={() => toggleWishlist(detail)}
            style={{
              fontSize: '24px',
              color: isInWishlist(detail?.id) ? 'var(--color-accent)' : 'var(--color-heading-text)',
            }}
          >
            {isInWishlist(detail?.id) ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </>
  );
};

const ProductQuickView = ({ product, onClose }) => {
  const [detail, setDetail] = useState(() => normalizeProduct(product));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const full = await productService.getProductById(product.id);
        if (!cancelled) setDetail(normalizeProduct(full));
      } catch (err) {
        console.error('Quick view failed to load variants', err);
        if (!cancelled) setDetail(normalizeProduct(product));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [product]);

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
          padding: '20px',
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
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '20px', zIndex: 10 }}
          >
            <FaTimes />
          </button>

          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {loading || !detail ? (
                <p style={{ padding: 40 }}>Loading options...</p>
              ) : (
                <QuickViewBody detail={detail} onClose={onClose} />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ProductQuickView;
