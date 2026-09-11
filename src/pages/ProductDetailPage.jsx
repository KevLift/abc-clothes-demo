import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { orderService } from '../services/orderService';
import { normalizeProduct } from '../utils/productHelpers';
import { saveVariantsWithStock } from '../utils/saveVariantsWithStock';
import { getApiErrorMessage } from '../utils/errors';
import { useProductVariantState } from '../hooks/useProductVariantState';
import Breadcrumb from '../components/UI/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { canAccessAdmin } from '../utils/roles';
import { FaHeart, FaRegHeart, FaEdit, FaStar, FaRegStar } from 'react-icons/fa';
import ProductFormModal from '../components/Admin/ProductFormModal';
import ProductCard from '../components/Product/ProductCard';
import StarRating from '../components/Product/StarRating';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    () => (typeof window !== 'undefined' && window.location.hash === '#reviews') ? 'reviews' : 'description',
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewOrderId, setReviewOrderId] = useState(null); // an order of mine that contains this product
  const [myReview, setMyReview] = useState(null); // this viewer's own review for this product (any status)
  const [reviewEligLoading, setReviewEligLoading] = useState(false);
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
    isSizeAvailable,
    isColorAvailable,
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

  // Reviews are verified-purchase: find one of my orders that contains this
  // product (and isn't cancelled/unpaid) to attach the review to, and check
  // whether I've already reviewed it.
  useEffect(() => {
    if (!product?.id || !isAuthenticated || user?.role !== 'CUSTOMER' || !user?.userId) {
      setReviewOrderId(null);
      setMyReview(null);
      return undefined;
    }
    let cancelled = false;
    setReviewEligLoading(true);
    Promise.all([
      orderService.getUserOrders(user.userId, { page: 0, size: 100 }).catch(() => ({ content: [] })),
      reviewService.getMyReviews().catch(() => []),
    ]).then(([ordersPage, myReviews]) => {
      if (cancelled) return;
      setMyReview((myReviews || []).find((r) => r.productId === product.id) || null);
      const blocked = ['PENDING_PAYMENT', 'CANCELLED', 'PAYMENT_FAILED'];
      const eligible = (ordersPage.content || []).find((o) =>
        !blocked.includes(o.status)
        && (o.items || []).some((i) => i.productId === product.id));
      setReviewOrderId(eligible?.id || null);
    }).finally(() => { if (!cancelled) setReviewEligLoading(false); });
    return () => { cancelled = true; };
  }, [product?.id, isAuthenticated, user?.role, user?.userId]);

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
    } catch (err) {
      alert(`Failed to add to cart: ${getApiErrorMessage(err)}`);
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
    if (!reviewOrderId) {
      setReviewError('You can review this product only after buying it.');
      return;
    }
    try {
      const created = await reviewService.createReview({
        productId: product.id,
        orderId: reviewOrderId,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        body: reviewForm.body,
      });
      // Show it right away for this shopper, flagged as awaiting approval.
      setMyReview({
        id: created?.id || `local-${Date.now()}`,
        productId: product.id,
        userId: user.userId,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        body: reviewForm.body,
        status: created?.status || 'PENDING',
        createdAt: created?.createdAt || new Date().toISOString(),
      });
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review.');
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
                  borderRadius: 0, width: '35px', height: '35px', display: 'flex',
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
                  const comboOk = isCombinationInStock(size, selectedColor) || isSizeAvailable(size);
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
                  const comboOk = isCombinationInStock(selectedSize, color) || isColorAvailable(color);
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
        {activeTab === 'reviews' && (() => {
          const approved = reviews || [];
          const count = approved.length;
          const avg = count ? approved.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;
          const showMine = myReview && !approved.some((r) => r.id === myReview.id);
          const list = [
            ...(showMine ? [{ ...myReview, __mine: true }] : []),
            ...approved.map((r) => ({ ...r, __mine: r.userId && r.userId === user?.userId })),
          ];
          const fmtDate = (d) => {
            try {
              return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            } catch { return ''; }
          };

          return (
            <div>
              {count > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  paddingBottom: 20, marginBottom: 24, borderBottom: '1px solid var(--color-separator)',
                }}>
                  <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: 'var(--color-heading-text)' }}>
                    {avg.toFixed(1)}
                  </div>
                  <div>
                    <StarRating value={avg} size={18} />
                    <div style={{ fontSize: 13, color: 'var(--color-body-text)', marginTop: 4 }}>
                      Based on {count} review{count === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>
              )}

              {list.length === 0 ? (
                <p style={{ color: 'var(--color-body-text)' }}>
                  No reviews yet. Be the first to review this product.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {list.map((r) => (
                    <div key={r.id} style={{ borderBottom: '1px solid var(--color-separator)', paddingBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <StarRating value={r.rating} size={14} />
                        {r.title && <strong style={{ color: 'var(--color-heading-text)' }}>{r.title}</strong>}
                        {r.__mine && r.status && r.status !== 'APPROVED' && (
                          <span style={{
                            fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px',
                            padding: '2px 8px', background: 'var(--color-light-bg)', color: 'var(--color-body-text)',
                          }}>
                            {r.status === 'REJECTED' ? 'Not published' : 'Awaiting approval'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-body-text)', marginBottom: 8 }}>
                        {r.__mine ? 'You' : 'Verified Buyer'}{r.createdAt ? ` · ${fmtDate(r.createdAt)}` : ''}
                      </div>
                      {r.body && (
                        <p style={{ color: 'var(--color-body-text)', margin: 0, lineHeight: 1.6 }}>{r.body}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 32 }}>
                <h4 style={{ marginBottom: 15, color: 'var(--color-heading-text)' }}>Write a Review</h4>
                {(!isAuthenticated || user?.role !== 'CUSTOMER') ? (
                  <p style={{ color: 'var(--color-body-text)' }}>
                    <Link to="/account" style={{ color: 'var(--color-accent)' }}>Log in</Link> as a customer to write a review.
                  </p>
                ) : reviewEligLoading ? (
                  <p style={{ color: 'var(--color-body-text)' }}>Checking your orders…</p>
                ) : myReview ? (
                  <p style={{ color: 'var(--color-body-text)' }}>
                    {myReview.status === 'APPROVED'
                      ? 'Thanks — your review is published above.'
                      : myReview.status === 'REJECTED'
                        ? 'Your review was not approved by the store.'
                        : 'Thanks — your review is awaiting approval and will appear once published.'}
                  </p>
                ) : !reviewOrderId ? (
                  <p style={{ color: 'var(--color-body-text)' }}>
                    You can write a review once you&apos;ve purchased this product.
                  </p>
                ) : (
                  <form onSubmit={handleSubmitReview} style={{ maxWidth: 520 }}>
                    {reviewError && <p style={{ color: '#c62828', marginBottom: 10 }}>{reviewError}</p>}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ display: 'block', fontSize: 13, color: 'var(--color-body-text)', marginBottom: 6 }}>Your rating</span>
                      <span style={{ display: 'inline-flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                            aria-label={`${n} star${n === 1 ? '' : 's'}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-accent)', display: 'inline-flex' }}
                          >
                            {n <= Number(reviewForm.rating) ? <FaStar size={22} /> : <FaRegStar size={22} style={{ opacity: 0.5 }} />}
                          </button>
                        ))}
                      </span>
                    </div>
                    <input
                      placeholder="Review title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      required
                      style={{ width: '100%', padding: 12, marginBottom: 10, border: '1px solid var(--color-separator)', fontFamily: 'var(--font-body)' }}
                    />
                    <textarea
                      placeholder="What did you like or dislike?"
                      value={reviewForm.body}
                      onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                      required
                      rows={4}
                      style={{ width: '100%', padding: 12, marginBottom: 12, border: '1px solid var(--color-separator)', fontFamily: 'var(--font-body)', resize: 'vertical' }}
                    />
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                  </form>
                )}
              </div>
            </div>
          );
        })()}
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
