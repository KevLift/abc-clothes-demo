import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ScrollToTop from './components/UI/ScrollToTop';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';

import ProtectedRoute from './components/Admin/ProtectedRoute';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminCustomersPage from './pages/Admin/AdminCustomersPage';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import AdminInventoryPage from './pages/Admin/AdminInventoryPage';
import AdminPaymentsPage from './pages/Admin/AdminPaymentsPage';
import AdminReviewsPage from './pages/Admin/AdminReviewsPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';
import AdminTeamPage from './pages/Admin/AdminTeamPage';
import AdminNotificationsPage from './pages/Admin/AdminNotificationsPage';
import AdminInquiriesPage from './pages/Admin/AdminInquiriesPage';
import AdminSocialPage from './pages/Admin/AdminSocialPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import './index.css';
import './App.css';

function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <ScrollToTop />
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Header />
                  <main style={{ flex: 1 }}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:id" element={<BlogDetailPage />} />
                      <Route path="/faq" element={<FAQPage />} />

                      <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
                        <Route element={<AdminLayout />}>
                          <Route index element={<AdminDashboardPage />} />
                          <Route path="products" element={<AdminProductsPage />} />
                          <Route path="categories" element={<AdminCategoriesPage />} />
                          <Route path="inventory" element={<AdminInventoryPage />} />
                          <Route path="orders" element={<AdminOrdersPage />} />
                          <Route path="payments" element={<AdminPaymentsPage />} />
                          <Route path="customers" element={<AdminCustomersPage />} />
                          <Route path="team" element={<AdminTeamPage />} />
                          <Route path="reviews" element={<AdminReviewsPage />} />
                          <Route path="notifications" element={<AdminNotificationsPage />} />
                          <Route path="settings" element={<AdminSettingsPage />} />
                          <Route path="analytics" element={<AdminAnalyticsPage />} />
                          <Route path="inquiries" element={<AdminInquiriesPage />} />
                          <Route path="social" element={<AdminSocialPage />} />
                          <Route path="users" element={<AdminCustomersPage />} />
                        </Route>
                      </Route>

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </Router>
  );
}

export default App;
