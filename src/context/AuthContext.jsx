import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { getStoredUser, setStoredUser } from '../services/api';
import { canAccessAdmin } from '../utils/roles';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStoredUser(user);
  }, [user]);

  const applyAuthUser = useCallback((data) => {
    setUser(data);
    setStoredUser(data);
  }, []);

  const mergeCartAfterLogin = useCallback(async (role) => {
    if (role !== 'CUSTOMER') return;
    try {
      await cartService.mergeGuestCart();
    } catch (err) {
      console.warn('Cart merge skipped', err);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      applyAuthUser(data);
      await mergeCartAfterLogin(data.role);
      return { success: true, user: data };
    } catch (error) {
      console.error('Login failed', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      applyAuthUser(data);
      await mergeCartAfterLogin(data.role);
      return { success: true, user: data };
    } catch (error) {
      console.error('Registration failed', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = user?.refreshToken;
    setUser(null);
    setStoredUser(null);
    await authService.logout(refreshToken);
  };

  const updateUserLocal = (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      setStoredUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: canAccessAdmin(user),
        login,
        register,
        logout,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
