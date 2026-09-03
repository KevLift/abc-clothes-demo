import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { FaTrash } from 'react-icons/fa';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px', minHeight: '60vh' }}>
        <h2 style={{ marginBottom: '20px' }}>Your shopping bag is empty</h2>
        <p style={{ marginBottom: '40px', color: 'var(--color-body-text)' }}>
          Looks like you haven't added anything to your cart yet.
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
        {/* Cart Items */}
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                <th style={{ padding: '15px 0', textAlign: 'left', fontWeight: 'normal', color: 'var(--color-section-heading)', fontSize: '12px', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '15px 0', textAlign: 'center', fontWeight: 'normal', color: 'var(--color-section-heading)', fontSize: '12px', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '15px 0', textAlign: 'center', fontWeight: 'normal', color: 'var(--color-section-heading)', fontSize: '12px', textTransform: 'uppercase' }}>Quantity</th>
                <th style={{ padding: '15px 0', textAlign: 'right', fontWeight: 'normal', color: 'var(--color-section-heading)', fontSize: '12px', textTransform: 'uppercase' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={`${item.id}-${item.size}-${item.color}-${index}`} style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <td style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        style={{ color: 'var(--color-body-text)' }}
                      >
                        <FaTrash />
                      </button>
                      <Link to={`/product/${item.id}`}>
                        <img src={item.images[0]} alt={item.name} style={{ width: '80px', height: '100px', objectFit: 'cover' }} />
                      </Link>
                      <div>
                        <Link to={`/product/${item.id}`} style={{ color: 'var(--color-heading-text)', fontWeight: 'bold' }}>{item.name}</Link>
                        <div style={{ fontSize: '12px', marginTop: '5px', color: 'var(--color-body-text)' }}>
                          Size: {item.size} <br />
                          Color: {item.color}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 0', textAlign: 'center' }}>
                    {formatPrice(item.salePrice || item.price)}
                  </td>
                  <td style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', border: '1px solid var(--color-separator)' }}>
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} style={{ padding: '5px 10px' }}>-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        readOnly 
                        style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none' }} 
                      />
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)} style={{ padding: '5px 10px' }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 0', textAlign: 'right', color: 'var(--color-heading-text)' }}>
                    {formatPrice((item.salePrice || item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <Link to="/shop" className="btn btn-outline" style={{ padding: '10px 20px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Cart Totals */}
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '30px', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '15px' }}>Cart Totals</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(cartTotal)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '20px' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--color-heading-text)' }}>
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '15px', fontSize: '14px' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
