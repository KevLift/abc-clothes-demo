import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { findVariantId, mapCartToUiItems } from '../utils/productHelpers';
import { findExactVariant } from '../utils/variantSelection';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState(null);

  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isCustomer
        ? await cartService.getMyCart()
        : await cartService.getGuestCart();
      setCart(data);
      return data;
    } catch (err) {
      console.error('Failed to load cart', err);
      setError(err);
      setCart(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (product, size, color, quantity = 1) => {
    const variants = product.variants || [];
    const exact = findExactVariant(variants, size, color);
    const variantId = exact?.id || findVariantId(variants, size, color);
    if (variants.length && !variantId) {
      throw new Error('Please select an available size and color.');
    }
    try {
      if (isCustomer) {
        let current = cart;
        if (!current?.id) {
          current = await cartService.getMyCart();
        }
        await cartService.addItem(current.id, {
          productId: product.id,
          variantId,
          quantity,
        });
      } else {
        await cartService.addGuestItem({
          productId: product.id,
          variantId,
          quantity,
        });
      }
      await refreshCart();
      setIsCartOpen(true);
      setTimeout(() => setIsCartOpen(false), 3000);
    } catch (err) {
      console.error('Add to cart failed', err);
      throw err;
    }
  };

  const removeFromCart = async (productId, size, color, cartItemId) => {
    const itemId = cartItemId
      || cart?.items?.find((i) => i.productId === productId)?.id;
    if (!itemId) return;
    try {
      if (isCustomer && cart?.id) {
        await cartService.removeItem(cart.id, itemId);
      } else {
        await cartService.removeGuestItem(itemId);
      }
      await refreshCart();
    } catch (err) {
      console.error('Remove from cart failed', err);
    }
  };

  const updateQuantity = async (productId, size, color, newQuantity, cartItemId) => {
    if (newQuantity < 1) return;
    const itemId = cartItemId
      || cart?.items?.find((i) => i.productId === productId)?.id;
    if (!itemId) return;
    try {
      if (isCustomer && cart?.id) {
        await cartService.updateItem(cart.id, itemId, newQuantity);
      } else {
        await cartService.updateGuestItem(itemId, newQuantity);
      }
      await refreshCart();
    } catch (err) {
      console.error('Update quantity failed', err);
    }
  };

  const clearCart = async () => {
    try {
      if (isCustomer && cart?.id) {
        await cartService.clearCart(cart.id);
      } else {
        await cartService.clearGuestCart();
      }
      await refreshCart();
    } catch (err) {
      console.error('Clear cart failed', err);
    }
  };

  const cartItems = mapCartToUiItems(cart);
  const cartTotal = cart?.subtotal != null
    ? Number(cart.subtotal)
    : cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const cartCount = cart?.itemCount ?? cartItems.reduce((c, i) => c + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId: cart?.id || null,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        cartTotal,
        cartCount,
        loading,
        error,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
