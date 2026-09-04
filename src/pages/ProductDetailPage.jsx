import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { inventoryService } from '../services/inventoryService';
import { normalizeProduct, findVariantId } from '../utils/productHelpers';
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
  const [stockMsg, setStockMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewError, setReviewError] = useState('');
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();

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

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    const checkStock = async () => {
      if (!product) return;
      const variantId = findVariantId(product.variants, selectedSize, selectedColor);
      if (!variantId) {
        setStockMsg('');
        return;
      }
      try {
        const avail = await inventoryService.getAvailability(variantId);
        const qty = avail?.availableQty ?? avail?.available ?? null;
        setStockMsg(qty != null ? (qty > 0 ? `${qty} in stock` : 'Out of stock') : '');
      } catch {
        setStockMsg('');
      }
    };
    checkStock();
  }, [product, selectedSize, selectedColor]);

  if (isLoading) return <div style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return null;

  const handleAddToCart = async () => {
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
      });
      if (variants?.length) {
        for (const v of variants) {
          const body = {
            name: v.name,
            sku: v.sku,
            price: v.price,
            ...(v.compareAtPrice != null ? { compareAtPrice: v.compareAtPrice } : {}),
            currency: v.currency || raw.currency || 'LKR',
            optionValues: typeof v.optionValues === 'string'
              ? v.optionValues
              : JSON.stringify(v.optionValues || {}),
            position: v.position ?? 0,
            active: v.active !== false,
          };
          if (v.id) await productService.updateVariant(product.id, v.id, body);
          else await productService.createVariant(product.id, body);
        }
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

  const displayPrice = product.compareAtPrice
    ? product.price
    : product.salePrice || product.price;
  const comparePrice = product.compareAtPrice || (product.salePrice ? product.price : null);

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <Breadcrumb />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '60px' }}>
        <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: '1 1 40%', minWidth: '300px', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '32px', margin: 0 }}>{product.name}</h1>
            {canAccessAdmin(user) && (
              <button
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
            {comparePrice ? (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '15px' }}>
                  {formatPrice(comparePrice)}
                </span>
                <span>{formatPrice(displayPrice)}</span>
              </>
            ) : (
              <span>{formatPrice(displayPrice)}</span>
            )}
          </div>

          <p style={{ color: 'var(--color-body-text)', marginBottom: '20px', fontSize: '15px' }}>
            {product.description}
          </p>
          {stockMsg && (
            <p style={{ fontSize: '13px', marginBottom: '20px', color: stockMsg.includes('Out') ? '#c62828' : '#2e7d32' }}>
              {stockMsg}
            </p>
          )}

          {(product.sizes || []).length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Size</h5>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      border: `1px solid ${selectedSize === size ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                      padding: '8px 20px',
                      backgroundColor: selectedSize === size ? 'var(--color-heading-text)' : 'transparent',
                      color: selectedSize === size ? 'white' : 'var(--color-body-text)',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(product.colors || []).length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Color</h5>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      border: `1px solid ${selectedColor === color ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                      padding: '8px 20px',
                      backgroundColor: selectedColor === color ? 'var(--color-heading-text)' : 'transparent',
                      color: selectedColor === color ? 'white' : 'var(--color-body-text)',
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-separator)' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '15px 20px' }}>-</button>
              <input type="number" value={quantity} readOnly style={{ width: '50px', textAlign: 'center', border: 'none' }} />
              <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '15px 20px' }}>+</button>
            </div>
            <button className="btn btn-primary" onClick={handleAddToCart} disabled={adding} style={{ flex: 1, padding: '15px 30px' }}>
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              style={{ fontSize: '28px', color: isInWishlist(product.id) ? 'var(--color-accent)' : 'var(--color-heading-text)' }}
            >
              {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-separator)', paddingTop: '20px', fontSize: '12px' }}>
            <div><strong>SKU:</strong> {product.sku || product.id}</div>
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
          {['description', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '15px 30px',
                textTransform: 'uppercase',
                borderBottom: activeTab === tab ? '2px solid var(--color-heading-text)' : '2px solid transparent',
              }}
            >
              {tab === 'reviews' ? `Reviews (${reviews.length})` : 'Description'}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div style={{ maxWidth: '800px', lineHeight: 1.8 }}>
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-body-text)' }}>No reviews yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--color-separator)', paddingBottom: '15px' }}>
                    <strong>{r.title || 'Review'}</strong>
                    <div style={{ fontSize: '13px', margin: '5px 0' }}>{'★'.repeat(r.rating || 0)}</div>
                    <p style={{ color: 'var(--color-body-text)' }}>{r.body}</p>
                  </div>
                ))}
              </div>
            )}

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
          <h3 style={{ marginBottom: '30px' }}>Related Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
