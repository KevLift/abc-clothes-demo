import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: user ? user.email : '', phone: '',
    address: '', city: '', zip: '', country: 'Sri Lanka',
    cardNumber: '', expiry: '', cvv: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setOrderError("Please login to place an order.");
      return;
    }

    setIsSubmitting(true);
    setOrderError('');
    
    try {
      const orderData = {
        items: cartItems.map(item => {
          // Attempt to find the variant id
          const variant = item.variants?.find(v => v.size === item.size && v.color === item.color);
          return {
            productVariantId: variant ? variant.id : '00000000-0000-0000-0000-000000000000',
            quantity: item.quantity
          };
        }),
        shippingAddressLine1: formData.address,
        shippingAddressLine2: '',
        shippingCity: formData.city,
        shippingPostalCode: formData.zip,
        shippingCountry: formData.country
      };

      await orderService.placeOrder(orderData);
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Order failed", err);
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px', minHeight: '60vh' }}>
        <h1 style={{ color: 'var(--color-success)', marginBottom: '20px' }}>Order Placed Successfully!</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>Thank you for your purchase. Your order number is #{Math.floor(100000 + Math.random() * 900000)}.</p>
        <p style={{ color: 'var(--color-body-text)', marginBottom: '40px' }}>An email confirmation has been sent to {formData.email}.</p>
        <Link to="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px' }}>
        <h2>Your cart is empty.</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Go Shopping</Link>
      </div>
    );
  }

  const shippingCost = cartTotal > 10000 ? 0 : 500;
  const finalTotal = cartTotal + shippingCost;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>Checkout</h1>
      
      {!user && (
        <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: '20px', marginBottom: '30px', borderLeft: '4px solid var(--color-accent)' }}>
          Returning customer? <Link to="/account" style={{ color: 'var(--color-heading-text)', fontWeight: 'bold' }}>Click here to login</Link>
        </div>
      )}

      {orderError && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', marginBottom: '30px', borderRadius: '4px' }}>
          {orderError}
        </div>
      )}
      
      <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '40px' }}>
        {/* Form */}
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>Billing Details</h3>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required style={inputStyle} placeholder="Street address" />
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Postcode / ZIP *</label>
                <input type="text" name="zip" value={formData.zip} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>Payment Information</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Card Number * (Demo mode - any number works)</label>
              <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required maxLength="16" style={inputStyle} placeholder="XXXX XXXX XXXX XXXX" />
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Expiry (MM/YY) *</label>
                <input type="text" name="expiry" value={formData.expiry} onChange={handleChange} required maxLength="5" style={inputStyle} placeholder="MM/YY" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>CVV *</label>
                <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} required maxLength="3" style={inputStyle} placeholder="123" />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '15px', fontSize: '16px' }}
              disabled={isSubmitting || !user}
            >
              {isSubmitting ? 'Processing...' : `Place Order (${formatPrice(finalTotal)})`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '30px', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '15px' }}>Your Order</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '20px' }}>
              {cartItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--color-heading-text)' }}>
                    {item.name} <br/>
                    <small style={{ color: 'var(--color-body-text)' }}>{item.size}, {item.color} x {item.quantity}</small>
                  </span>
                  <span>{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--color-heading-text)' }}>{formatPrice(cartTotal)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '20px', fontSize: '14px' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--color-heading-text)' }}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--color-heading-text)' }}>
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  border: '1px solid var(--color-separator)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  backgroundColor: 'var(--color-primary-bg)'
};

export default CheckoutPage;
