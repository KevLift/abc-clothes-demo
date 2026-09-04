import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
const LOCAL_KEY = 'abc_wishlist';

export const useWishlist = () => useContext(WishlistContext);

const toUiItem = (item) => ({
  id: item.productId || item.id,
  productId: item.productId || item.id,
  name: item.productName || item.name,
  price: Number(item.productPrice ?? item.price ?? 0),
  images: item.imageUrl ? [item.imageUrl] : (item.images || []),
  image: item.imageUrl || item.image || (item.images?.[0] || ''),
  slug: item.productSlug || item.slug,
});

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const syncFromApi = useCallback(async () => {
    if (!isCustomer) return;
    try {
      const items = await wishlistService.getMine();
      const mapped = (items || []).map(toUiItem);
      setWishlistItems(mapped);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(mapped));
    } catch (err) {
      console.warn('Wishlist sync failed', err);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isCustomer) {
      syncFromApi();
    }
  }, [isCustomer, syncFromApi]);

  useEffect(() => {
    if (!isCustomer) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isCustomer]);

  const toggleWishlist = async (product) => {
    const productId = product.id || product.productId;
    const exists = wishlistItems.some((item) => item.id === productId || item.productId === productId);

    if (isCustomer) {
      try {
        if (exists) {
          await wishlistService.remove(productId);
        } else {
          await wishlistService.add(productId);
        }
        await syncFromApi();
      } catch (err) {
        console.error('Wishlist toggle failed', err);
      }
      return;
    }

    setWishlistItems((prev) => {
      if (exists) return prev.filter((item) => item.id !== productId && item.productId !== productId);
      return [...prev, toUiItem(product)];
    });
  };

  const removeFromWishlist = async (id) => {
    if (isCustomer) {
      try {
        await wishlistService.remove(id);
        await syncFromApi();
      } catch (err) {
        console.error('Wishlist remove failed', err);
      }
      return;
    }
    setWishlistItems((prev) => prev.filter((item) => item.id !== id && item.productId !== id));
  };

  const isInWishlist = (id) =>
    wishlistItems.some((item) => item.id === id || item.productId === id);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length,
        refreshWishlist: syncFromApi,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
