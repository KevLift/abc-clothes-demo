import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { getApiErrorMessage } from '../utils/errors';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product, product.sizes?.[0], product.colors?.[0], 1);
      await removeFromWishlist(product.id);
    } catch (err) {
      alert(`Could not move item to cart: ${getApiErrorMessage(err)}`);
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px', minHeight: '60vh' }}>
        <h2 style={{ marginBottom: '20px' }}>Your Wishlist is Empty</h2>
        <p style={{ marginBottom: '40px', color: 'var(--color-body-text)' }}>
          Keep track of your favorite items by adding them to your wishlist.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '15px 40px' }}>
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '70vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>My Wishlist</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
      }}>
        {wishlistItems.map((product) => (
          <div key={product.id} style={{ border: '1px solid var(--color-separator)', padding: '20px', position: 'relative' }}>
            <button
              onClick={() => removeFromWishlist(product.id)}
              style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--color-body-text)', zIndex: 10 }}
            >
              <FaTrash />
            </button>
            <Link to={`/product/${product.id}`}>
              <img
                src={product.images?.[0] || product.image || 'https://via.placeholder.com/280x300'}
                alt={product.name}
                style={{ width: '100%', height: '300px', objectFit: 'cover', marginBottom: '15px' }}
              />
              <h3 style={{ fontSize: '14px', marginBottom: '5px' }}>{product.name}</h3>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', marginBottom: '15px' }}>
                {formatPrice(product.salePrice || product.price, product.currency)}
              </div>
            </Link>
            <button
              className="btn btn-outline"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              onClick={() => handleMoveToCart(product)}
            >
              <FaShoppingCart /> Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
