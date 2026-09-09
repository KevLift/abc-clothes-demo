import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { normalizeProduct } from '../utils/productHelpers';
import { saveVariantsWithStock } from '../utils/saveVariantsWithStock';
import { useProductVariantState } from '../hooks/useProductVariantState';
import Breadcrumb from '../components/UI/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { canAccessAdmin } from '../utils/roles';
import { FaHeart, FaRegHeart, FaEdit } from 'react-icons/fa';
import ProductFormModal from '../components/Admin/ProductFormModal';
import ProductCard from '../components/Product/ProductCard';
import Select from '../components/UI/Select';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewError, setReviewError] = useState('');
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();

  const {
    availableSizes,
    availableColors,
    selectedSize,
    selectedColor,
    selectSize,
    selectColor,
    quantity,
    setQuantity,
    selectedVariant,
    price,
    compareAtPrice,
    stockMessage,
    inStock,
    canAddToCart,
    maxQty,
    isCombinationInStock,
  } = useProductVariantState(product);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        let data;
        const isUuid = /^[0-9a-f-]{36}$/i.test(id);
        try {
          data = isUuid
            ? await productService.getProductById(id)
            : await productService.getProductBySlug(id);
        } catch {
          data = await productService.getProductBySlug(id).catch(() => null);
          if (!data) data = await productService.getProductById(id);
        }
        const p = normalizeProduct(data);
        setProduct(p);

        reviewService.getProductReviews(p.id).then(setReviews).catch(() => setReviews([]));

        if (p.categoryId || p.categorySlug) {
          const page = await productService.getProducts({
            page: 0,
            size: 8,
            categorySlug: p.categorySlug,
          }).catch(() => ({ content: [] }));
          setRelated(
            (page.content || [])
              .map(normalizeProduct)
              .filter((r) => r.id !== p.id)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (isLoading) return <div style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return null;

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      alert(inStock ? 'Please select a valid size and color.' : 'This combination is out of stock.');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product, selectedSize, selectedColor, quantity);
    } catch {
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditSave = async (data) => {
    try {
      const { variants, ...raw } = data;
      await productService.updateProduct(product.id, {
        name: raw.name,
        slug: raw.slug,
        description: raw.description,
        categoryId: raw.categoryId || undefined,
        price: raw.price,
        ...(raw.compareAtPrice != null ? { compareAtPrice: raw.compareAtPrice } : {}),
        currency: raw.currency,
        featured: raw.featured,
        ...(raw.attributes ? { attributes: raw.attributes } : {}),
      });
      if (variants?.length) {
        const errors = await saveVariantsWithStock(product.id, variants, raw.currency || 'LKR');
        if (errors.length) alert(`Saved with some stock errors:\n${errors.join('\n')}`);
      }
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update product', err);
      alert(err.response?.data?.message || 'Failed to update product. Please try again.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      setReviewError('Please log in as a customer to leave a review.');
      return;
    }
    try {
      await reviewService.createReview({
        productId: product.id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        body: reviewForm.body,
      });
      setReviewForm({ rating: 5, title: '', body: '' });
      alert('Review submitted for moderation. Thank you!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review. You may need a completed order.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <Breadcrumb />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '60px' }}>
        <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
          <img
            src={product.images?.[0] || product.image || '/images/product-placeholder.svg'}
            alt={product.name}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: '1 1 40%', minWidth: '300px', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '32px', margin: 0 }}>{product.name}</h1>
            {canAccessAdmin(user) && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  backgroundColor: 'white', color: 'var(--color-accent)', border: 'none',
                  borderRadius: '50%', width: '35px', height: '35px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}
                title="Edit Product"
              >
                <FaEdit size={16} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
            {compareAtPrice ? (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '15px' }}>
                  {formatPrice(compareAtPrice, product.currency)}
                </span>
                <span>{formatPrice(price, product.currency)}</span>
              </>
            ) : (
              <span>{formatPrice(price, product.currency)}</span>
            )}
          </div>

          <p style={{ color: 'var(--color-body-text)', marginBottom: '20px', fontSize: '15px' }}>
            {product.description}
          </p>

          {stockMessage && (
            <p style={{
              fontSize: '13px',
              marginBottom: '20px',
              color: !inStock || stockMessage.includes('Out') || stockMessage.includes('Select')
                ? '#c62828'
                : '#2e7d32',
              fontWeight: 600,
            }}
            >
              {stockMessage}
            </p>
          )}

          {availableSizes.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Size</h5>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {availableSizes.map((size) => {
                  const comboOk = !selectedColor || isCombinationInStock(size, selectedColor);
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => selectSize(size)}
                      style={{
                        border: `1px solid ${selectedSize === size ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                        padding: '8px 20px',
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
            <div style={{ marginBottom: '40px' }}>
              <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Color</h5>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {availableColors.map((color) => {
                  const comboOk = !selectedSize || isCombinationInStock(selectedSize, color);
                  return (
                    <button
                      type="button"
                      key={color}
                      onClick={() => selectColor(color)}
                      style={{
                        border: `1px solid ${selectedColor === color ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                        padding: '8px 20px',
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

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-separator)' }}>
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '15px 20px' }}>-</button>
              <input type="number" value={quantity} readOnly style={{ width: '50px', textAlign: 'center', border: 'none' }} />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                style={{ padding: '15px 20px' }}
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
              style={{
                flex: 1,
                padding: '15px 30px',
                opacity: canAddToCart ? 1 : 0.55,
                cursor: canAddToCart ? 'pointer' : 'not-allowed',
              }}
            >
              {adding ? 'Adding...' : (!inStock ? 'Out of Stock' : 'Add to Cart')}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              style={{ fontSize: '28px', color: isInWishlist(product.id) ? 'var(--color-accent)' : 'var(--color-heading-text)' }}
            >
              {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-separator)', paddingTop: '20px', fontSize: '12px' }}>
            <div><strong>SKU:</strong> {selectedVariant?.sku || product.sku || product.id}</div>
            <div style={{ marginTop: '8px' }}>
              <strong>Category:</strong>{' '}
              <Link to={`/shop?category=${encodeURIComponent(product.categorySlug || product.category)}`}>
                {product.category || 'General'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-separator)', marginBottom: '30px' }}>
          {['description', ...(product.attributes?.length ? ['specifications'] : []), 'reviews'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                textTransform: 'capitalize',
                borderBottom: activeTab === tab ? '2px solid var(--color-heading-text)' : '2px solid transparent',
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'description' && (
          <p style={{ color: 'var(--color-body-text)', lineHeight: 1.8 }}>{product.description || 'No description.'}</p>
        )}
        {activeTab === 'specifications' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {(product.attributes || []).map((attr) => (
                <tr key={attr.attributeId} style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <td style={{ padding: '10px 0', width: '35%', color: 'var(--color-body-text)', fontWeight: 600 }}>{attr.label}</td>
                  <td style={{ padding: '10px 0' }}>
                    {attr.type === 'BOOLEAN'
                      ? (attr.valueBoolean ? 'Yes' : 'No')
                      : attr.type === 'SELECT'
                        ? (attr.optionLabel || attr.optionValue)
                        : attr.type === 'NUMBER'
                          ? attr.valueNumber
                          : attr.valueText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-body-text)' }}>No reviews yet.</p>
            ) : reviews.map((r) => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--color-separator)', paddingBottom: '15px', marginBottom: 15 }}>
                <strong>{r.title}</strong> — {r.rating}/5
                <p style={{ color: 'var(--color-body-text)' }}>{r.body}</p>
              </div>
            ))}
            <form onSubmit={handleSubmitReview} style={{ maxWidth: '500px', marginTop: '20px' }}>
              <h4 style={{ marginBottom: '15px' }}>Write a Review</h4>
              {reviewError && <p style={{ color: '#c62828', marginBottom: '10px' }}>{reviewError}</p>}
              <label style={{ display: 'block', marginBottom: '10px' }}>
                Rating
                <Select
                  fullWidth
                  value={String(reviewForm.rating)}
                  onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
                  style={{ marginTop: 5 }}
                  options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` }))}
                />
              </label>
              <input
                placeholder="Title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <textarea
                placeholder="Your review"
                value={reviewForm.body}
                onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                required
                rows={4}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <button type="submit" className="btn btn-primary">Submit Review</button>
            </form>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 20 }}>You May Also Like</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        productToEdit={product}
      />
    </div>
  );
};

export default ProductDetailPage;
