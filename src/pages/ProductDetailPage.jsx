import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products as fallbackProducts } from '../data/products';
import { productService } from '../services/productService';
import Breadcrumb from '../components/UI/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaEdit } from 'react-icons/fa';
import ProductFormModal from '../components/Admin/ProductFormModal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProductById(id);
        const p = {
          ...data,
          price: data.basePrice,
          images: data.images ? data.images.map(img => img.url) : [],
          sizes: data.variants ? [...new Set(data.variants.map(v => v.size))] : [],
          colors: data.variants ? [...new Set(data.variants.map(v => v.color))] : []
        };
        setProduct(p);
      } catch (err) {
        console.error("Failed to fetch product", err);
        const fb = fallbackProducts.find(p => p.id === parseInt(id));
        if (fb) {
          setProduct(fb);
        } else {
          navigate('/404');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) return <div style={{ paddingTop: '120px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleEditSave = async (data) => {
    try {
      await productService.updateProduct(product.id, data);
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update product", err);
      alert("Failed to update product. Please try again.");
    }
  };

  const relatedProducts = fallbackProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <Breadcrumb />
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '60px' }}>
        <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
        </div>
        
        <div style={{ flex: '1 1 40%', minWidth: '300px', padding: '20px 0', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '32px', margin: 0 }}>{product.name}</h1>
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                style={{ 
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
          </div>
          
          <div style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
            {product.salePrice ? (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-separator)', marginRight: '15px' }}>{formatPrice(product.price)}</span>
                <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(product.salePrice)}</span>
              </>
            ) : (
              <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(product.price)}</span>
            )}
          </div>
          
          <p style={{ color: 'var(--color-body-text)', marginBottom: '30px', fontSize: '15px' }}>{product.description}</p>
          
          <div style={{ marginBottom: '25px' }}>
            <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Size</h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    border: `1px solid ${selectedSize === size ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                    padding: '8px 20px',
                    backgroundColor: selectedSize === size ? 'var(--color-heading-text)' : 'transparent',
                    color: selectedSize === size ? 'white' : 'var(--color-body-text)'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h5 style={{ fontSize: '12px', marginBottom: '10px' }}>Color</h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {product.colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    border: `1px solid ${selectedColor === color ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                    padding: '8px 20px',
                    backgroundColor: selectedColor === color ? 'var(--color-heading-text)' : 'transparent',
                    color: selectedColor === color ? 'white' : 'var(--color-body-text)'
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-separator)', flex: '0 0 auto' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '15px 20px' }}>-</button>
              <input 
                type="number" 
                value={quantity} 
                readOnly 
                style={{ width: '50px', textAlign: 'center', border: 'none', outline: 'none' }} 
              />
              <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '15px 20px' }}>+</button>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '15px 30px' }}
            >
              Add to Cart
            </button>
            
            <button 
              onClick={() => toggleWishlist(product)}
              style={{ fontSize: '28px', color: isInWishlist(product.id) ? 'var(--color-accent)' : 'var(--color-heading-text)' }}
            >
              {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          
          <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-separator)', paddingTop: '20px', fontSize: '12px', color: 'var(--color-body-text)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div><strong>SKU:</strong> ABC-{product.id}</div>
            <div><strong>Category:</strong> <Link to={`/shop?category=${product.category}`} style={{ color: 'var(--color-heading-text)' }}>{product.category}</Link></div>
            <div><strong>Tags:</strong> {product.subCategory}, Luxury</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '60px' }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--color-separator)', 
          marginBottom: '30px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <button 
            onClick={() => setActiveTab('description')}
            style={{ 
              padding: '15px 30px', 
              fontSize: '14px', 
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              borderBottom: activeTab === 'description' ? '2px solid var(--color-heading-text)' : '2px solid transparent',
              color: activeTab === 'description' ? 'var(--color-heading-text)' : 'var(--color-section-heading)'
            }}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('additional')}
            style={{ 
              padding: '15px 30px', 
              fontSize: '14px', 
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              borderBottom: activeTab === 'additional' ? '2px solid var(--color-heading-text)' : '2px solid transparent',
              color: activeTab === 'additional' ? 'var(--color-heading-text)' : 'var(--color-section-heading)'
            }}
          >
            Additional Information
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{ 
              padding: '15px 30px', 
              fontSize: '14px', 
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              borderBottom: activeTab === 'reviews' ? '2px solid var(--color-heading-text)' : '2px solid transparent',
              color: activeTab === 'reviews' ? 'var(--color-heading-text)' : 'var(--color-section-heading)'
            }}
          >
            Reviews ({product.reviewsCount})
          </button>
        </div>
        
        <div>
          {activeTab === 'description' && (
            <div style={{ maxWidth: '800px', lineHeight: 1.8 }}>
              <p>{product.description}</p>
              <p style={{ marginTop: '20px' }}>Our materials are carefully sourced from Italy and crafted with precision to ensure the perfect fit. Dry clean only to maintain the quality and longevity of the garment.</p>
            </div>
          )}
          {activeTab === 'additional' && (
            <table style={{ width: '100%', maxWidth: '600px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <th style={{ padding: '15px 0', textAlign: 'left', width: '30%', color: 'var(--color-heading-text)' }}>Weight</th>
                  <td style={{ padding: '15px 0' }}>1.5 kg</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <th style={{ padding: '15px 0', textAlign: 'left', color: 'var(--color-heading-text)' }}>Dimensions</th>
                  <td style={{ padding: '15px 0' }}>40 x 30 x 10 cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <th style={{ padding: '15px 0', textAlign: 'left', color: 'var(--color-heading-text)' }}>Sizes</th>
                  <td style={{ padding: '15px 0' }}>{product.sizes.join(', ')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <th style={{ padding: '15px 0', textAlign: 'left', color: 'var(--color-heading-text)' }}>Colors</th>
                  <td style={{ padding: '15px 0' }}>{product.colors.join(', ')}</td>
                </tr>
              </tbody>
            </table>
          )}
          {activeTab === 'reviews' && (
            <div>
              <p>Reviews for this product are currently overwhelmingly positive, averaging {product.rating} out of 5 stars from {product.reviewsCount} customers.</p>
            </div>
          )}
        </div>
      </div>
      
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
