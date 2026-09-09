import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
  const { cart, cartItems, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
  const cartCurrency = cart?.currency || 'LKR';
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px' }}>
        Loading cart...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px', minHeight: '60vh' }}>
        <h2 style={{ marginBottom: '20px' }}>Your shopping bag is empty</h2>
        <p style={{ marginBottom: '40px', color: 'var(--color-body-text)' }}>
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '15px 40px' }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '70vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>Shopping Bag</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                <th style={{ padding: '15px 0', textAlign: 'left', fontWeight: 'normal', fontSize: '12px', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '15px 0', textAlign: 'center', fontWeight: 'normal', fontSize: '12px', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '15px 0', textAlign: 'center', fontWeight: 'normal', fontSize: '12px', textTransform: 'uppercase' }}>Quantity</th>
                <th style={{ padding: '15px 0', textAlign: 'right', fontWeight: 'normal', fontSize: '12px', textTransform: 'uppercase' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.cartItemId || `${item.id}-${item.size}-${item.color}`} style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <td style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color, item.cartItemId)}
                        style={{ color: 'var(--color-body-text)' }}
                      >
                        <FaTrash />
                      </button>
                      <Link to={`/product/${item.id}`}>
                        <img
                          src={item.images?.[0] || item.image || 'https://via.placeholder.com/80x100'}
                          alt={item.name}
                          style={{ width: '80px', height: '100px', objectFit: 'cover' }}
                        />
                      </Link>
                      <div>
                        <Link to={`/product/${item.id}`} style={{ color: 'var(--color-heading-text)', fontWeight: 'bold' }}>
                          {item.name}
                        </Link>
                        <div style={{ fontSize: '12px', marginTop: '5px', color: 'var(--color-body-text)' }}>
                          {item.size && <>Size: {item.size}<br /></>}
                          {item.color && <>Color: {item.color}</>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 0', textAlign: 'center' }}>
                    {formatPrice(item.price, cartCurrency)}
                  </td>
                  <td style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', border: '1px solid var(--color-separator)' }}>
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1, item.cartItemId)} style={{ padding: '5px 10px' }}>-</button>
                      <input type="number" value={item.quantity} readOnly style={{ width: '40px', textAlign: 'center', border: 'none' }} />
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1, item.cartItemId)} style={{ padding: '5px 10px' }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 0', textAlign: 'right' }}>
                    {formatPrice(item.lineTotal || item.price * item.quantity, cartCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Cart Totals</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal, cartCurrency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>{formatPrice(cartTotal, cartCurrency)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
