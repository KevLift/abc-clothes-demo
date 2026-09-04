import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid var(--color-separator)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
};

const CheckoutForm = ({ formData, setFormData, shippingCost, finalTotal, cartTotal, cartId, onSuccess, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartId) {
      setOrderError('Cart is not ready. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    try {
      const order = await orderService.placeOrder({
        cartId,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          line1: formData.address,
          line2: formData.address2 || '',
          city: formData.city,
          state: formData.state || '',
          postalCode: formData.zip,
          country: formData.country,
        },
        taxAmount: 0,
        shippingAmount: shippingCost,
        notes: formData.notes || null,
      });

      if (stripe && elements && stripeKey) {
        const card = elements.getElement(CardElement);
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
          },
        });

        if (pmError) {
          setOrderError(pmError.message || 'Card error');
          onSuccess(order, false);
          return;
        }

        try {
          const payment = await paymentService.createPayment({
            orderId: order.id,
            stripePaymentMethodId: paymentMethod.id,
            amount: order.totalAmount ?? finalTotal,
            currency: (order.currency || currency || 'USD').toString().slice(0, 3).toUpperCase(),
            idempotencyKey: crypto.randomUUID(),
            saveCard: false,
          });

          if (payment.clientSecret) {
            const { error: confirmError } = await stripe.confirmCardPayment(payment.clientSecret);
            if (confirmError) {
              setOrderError(confirmError.message || 'Payment confirmation failed');
              onSuccess(order, false);
              return;
            }
          }
          onSuccess(order, true);
        } catch (payErr) {
          console.warn('Payment initiation failed, order created unpaid', payErr);
          onSuccess(order, false);
        }
      } else {
        onSuccess(order, false);
      }
    } catch (err) {
      console.error('Order failed', err);
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {orderError && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', marginBottom: '20px' }}>
          {orderError}
        </div>
      )}

      <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
        Shipping Details
      </h3>

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
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Phone *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Address *</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} required style={inputStyle} />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>City *</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} required style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Postal Code *</label>
          <input type="text" name="zip" value={formData.zip} onChange={handleChange} required style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Country *</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange} required style={inputStyle} />
      </div>

      {stripeKey ? (
        <>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
            Payment
          </h3>
          <div style={{ padding: '15px', border: '1px solid var(--color-separator)', marginBottom: '30px' }}>
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
        </>
      ) : (
        <p style={{ marginBottom: '30px', fontSize: '13px', color: 'var(--color-body-text)' }}>
          Online card payment is not configured. Your order will be placed and can be paid on fulfillment.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '15px' }}>
        {isSubmitting ? 'Placing Order...' : `Place Order — ${finalTotal}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart, cartId, refreshCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'Sri Lanka',
    notes: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || (user.name || '').split(' ')[0] || '',
        lastName: prev.lastName || user.lastName || (user.name || '').split(' ').slice(1).join(' ') || '',
        email: prev.email || user.email || '',
      }));
      authService.getAddresses().then((addresses) => {
        const list = Array.isArray(addresses) ? addresses : [];
        const primary = list.find((a) => a.isDefault) || list[0];
        if (primary) {
          setFormData((prev) => ({
            ...prev,
            address: primary.addressLine1 || primary.line1 || prev.address,
            address2: primary.addressLine2 || primary.line2 || '',
            city: primary.city || prev.city,
            state: primary.state || '',
            zip: primary.postalCode || prev.zip,
            country: primary.countryCode || primary.country || prev.country,
            phone: primary.phone || prev.phone,
          }));
        }
      }).catch(() => {});
    }
  }, [user]);

  const shippingCost = cartTotal > 10000 ? 0 : 500;
  const finalTotal = cartTotal + shippingCost;

  const onSuccess = async (order, wasPaid) => {
    setPlacedOrder(order);
    setPaid(wasPaid);
    setIsSuccess(true);
    await clearCart();
    await refreshCart();
  };

  if (cartLoading) {
    return <div className="container text-center" style={{ padding: '150px 20px' }}>Loading...</div>;
  }

  if (isSuccess && placedOrder) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px', minHeight: '60vh' }}>
        <h1 style={{ color: 'var(--color-success)', marginBottom: '20px' }}>Order Placed Successfully!</h1>
        <p style={{ fontSize: '18px', marginBottom: '15px' }}>
          Order number: <strong>{placedOrder.orderNumber || placedOrder.id}</strong>
        </p>
        <p style={{ color: 'var(--color-body-text)', marginBottom: '20px' }}>
          {paid
            ? 'Payment confirmed. A confirmation will be sent to your email.'
            : 'Order created. Payment can be completed later or on fulfillment.'}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/account" className="btn btn-primary">View Account</Link>
          <Link to="/" className="btn btn-outline">Return Home</Link>
        </div>
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

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return (
      <div className="container text-center" style={{ padding: '150px 20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Login required</h2>
        <p style={{ marginBottom: '30px' }}>
          Please sign in with a customer account to checkout.
          {user && user.role !== 'CUSTOMER' && ' Store admin accounts cannot place customer orders.'}
        </p>
        <Link to="/account" className="btn btn-primary">Go to Account</Link>
      </div>
    );
  }

  const formProps = {
    formData,
    setFormData,
    shippingCost,
    finalTotal: formatPrice(finalTotal),
    cartTotal,
    cartId,
    onSuccess,
    currency: 'LKR',
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>Checkout</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '40px' }}>
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm {...formProps} />
            </Elements>
          ) : (
            <CheckoutForm {...formProps} />
          )}
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span>{item.quantity}× {item.name}</span>
                <span>{formatPrice(item.lineTotal || item.price * item.quantity)}</span>
              </div>
            ))}
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--color-separator)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '15px' }}>
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
