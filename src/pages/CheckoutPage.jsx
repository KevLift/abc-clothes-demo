import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';
import { inventoryService } from '../services/inventoryService';
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

/**
 * Best-effort stock reservation around the order. Every call is idempotent
 * server-side and must never block checkout — failures are logged only.
 */
const reservableItems = (items) =>
  (items || []).filter((i) => i.variantId && i.quantity > 0);

const reserveForOrder = async (items, referenceId) => {
  await Promise.allSettled(
    reservableItems(items).map((i) =>
      inventoryService.reserve({
        variantId: i.variantId,
        referenceId,
        quantity: i.quantity,
      }),
    ),
  );
};

const settleReservations = async (items, referenceId, action) => {
  await Promise.allSettled(
    reservableItems(items).map((i) =>
      inventoryService[action]({ variantId: i.variantId, referenceId }),
    ),
  );
};

const CheckoutForm = ({ formData, setFormData, shippingCost, finalTotal, cartTotal, cartId, cartItems, onSuccess, onFailure, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(stripeKey ? 'CARD' : 'COD');

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
        paymentMethod,
      });

      // Hold stock against this order while payment is attempted.
      await reserveForOrder(cartItems, order.id);

      if (paymentMethod === 'COD') {
        // No online charge to run — stock stays reserved until the order is
        // fulfilled/confirmed, payment is collected on delivery.
        onSuccess(order, false);
        return;
      }

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
          await settleReservations(cartItems, order.id, 'release');
          onFailure(order, pmError.message || 'Your card details could not be processed.');
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
              await settleReservations(cartItems, order.id, 'release');
              onFailure(order, confirmError.message || 'Payment was declined.');
              return;
            }
          }
          // Payment went through — turn the hold into a permanent deduction.
          await settleReservations(cartItems, order.id, 'confirm');
          onSuccess(order, true);
        } catch (payErr) {
          console.warn('Payment failed', payErr);
          await settleReservations(cartItems, order.id, 'release');
          onFailure(order, payErr.response?.data?.message || payErr.message || 'Payment could not be completed.');
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

      <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
        Payment
      </h3>

      {stripeKey && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="radio" name="paymentMethod" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
            Card
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="radio" name="paymentMethod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
            Cash on Delivery
          </label>
        </div>
      )}

      {paymentMethod === 'CARD' && stripeKey ? (
        <div style={{ padding: '15px', border: '1px solid var(--color-separator)', marginBottom: '30px' }}>
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>
      ) : (
        <p style={{ marginBottom: '30px', fontSize: '13px', color: 'var(--color-body-text)' }}>
          {stripeKey
            ? 'Pay with cash when your order is delivered.'
            : 'Online card payment is not configured. Your order will be placed and can be paid on fulfillment.'}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '15px' }}>
        {isSubmitting ? 'Placing Order...' : `Place Order — ${finalTotal}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const { cart, cartItems, cartTotal, clearCart, cartId, refreshCart, loading: cartLoading } = useCart();
  const cartCurrency = cart?.currency || 'LKR';
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
  const [failure, setFailure] = useState(null); // { order, reason }

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
    setFailure(null);
    setPlacedOrder(order);
    setPaid(wasPaid);
    setIsSuccess(true);
    await clearCart();
    await refreshCart();
  };

  // A payment attempt failed. The order was created then cancelled server-side;
  // the cart is kept intact so the shopper can fix the card and retry.
  const onFailure = (order, reason) => {
    setFailure({ order, reason: reason || 'Payment could not be completed.' });
  };

  if (cartLoading) {
    return <div className="container text-center" style={{ padding: '150px 20px' }}>Loading...</div>;
  }

  if (failure) {
    return (
      <div className="container text-center" style={{ padding: '150px 20px', minHeight: '60vh' }}>
        <h1 style={{ color: '#c62828', marginBottom: '20px' }}>Payment Failed</h1>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>{failure.reason}</p>
        <p style={{ color: 'var(--color-body-text)', marginBottom: '30px' }}>
          You have not been charged and your order was not placed. Your cart is still saved.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => setFailure(null)}>Try Again</button>
          <Link to="/cart" className="btn btn-outline">Back to Cart</Link>
        </div>
      </div>
    );
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
    finalTotal: formatPrice(finalTotal, cartCurrency),
    cartTotal,
    cartId,
    cartItems,
    onSuccess,
    onFailure,
    currency: cartCurrency,
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>Checkout</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '40px' }}>
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          {/* Always mount <Elements>, even with stripe={null}: CheckoutForm calls
              useStripe()/useElements() unconditionally, and those hooks throw if
              there is no <Elements> ancestor. A null stripe prop is supported and
              simply makes the hooks return null (COD-only checkout still works). */}
          <Elements stripe={stripePromise}>
            <CheckoutForm {...formProps} />
          </Elements>
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: 'var(--color-light-bg)', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span>{item.quantity}× {item.name}</span>
                <span>{formatPrice(item.lineTotal || item.price * item.quantity, cartCurrency)}</span>
              </div>
            ))}
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--color-separator)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal, cartCurrency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost, cartCurrency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '15px' }}>
              <span>Total</span>
              <span>{formatPrice(finalTotal, cartCurrency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
