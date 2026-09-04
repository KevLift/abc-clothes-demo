import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaShoppingBag, FaBars, FaHeart, FaUser } from 'react-icons/fa';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { openSearch } = useSearch();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isTransparentPage = location.pathname === '/' || location.pathname === '/about';

  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 80);
      
      if (currentScrollY > 80) {
        setIsScrolling(true);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 150); // Show header 150ms after scrolling stops
      } else {
        setIsScrolling(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const isHeaderSolid = !isTransparentPage || isScrolled;
  const textColor = isHeaderSolid ? 'var(--color-heading-text)' : 'white';

  return (
    <>
      <header
        id="main-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          backgroundColor: isHeaderSolid ? 'rgba(255,255,255,0.97)' : 'transparent',
          boxShadow: isHeaderSolid ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.3s ease, transform 0.3s ease',
          transform: isScrolling ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        {/* Top utility bar — hidden on mobile, hidden when scrolled or solid */}
        {!isHeaderSolid && (
          <div
            className="top-bar-row"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '10px 40px',
              fontFamily: 'var(--font-nav)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              gap: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'var(--font-nav)',
                fontSize: '10px',
                textTransform: 'uppercase',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {availableCurrencies.map(c => (
                <option key={c} value={c} style={{ color: 'black' }}>{c}</option>
              ))}
            </select>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" style={{ color: 'var(--color-accent)', fontWeight: 'bold', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#e0a800'}
                onMouseLeave={e => e.target.style.color = 'var(--color-accent)'}
              >Admin Dashboard</Link>
            )}
            <Link to="/account" style={{ color: 'rgba(255,255,255,0.85)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
            >Account</Link>
            <Link to="/wishlist" style={{ color: 'rgba(255,255,255,0.85)' }}>Wishlist</Link>
            <Link to="/cart" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Shopping Bag ({cartCount})
            </Link>
            <button onClick={openSearch} style={{ color: 'rgba(255,255,255,0.85)', padding: 0 }}>
              <FaSearch size={12} />
            </button>
          </div>
        )}

        {/* Main Nav Row */}
        <div
          className="main-nav-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isScrolled ? '14px 40px' : '18px 40px',
          }}
        >
          {/* Hamburger (mobile only) */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
            style={{ color: textColor, padding: 0 }}
          >
            <FaBars size={22} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: textColor,
              transition: 'color 0.3s',
            }}
          >
            ABC CLOTHES
          </Link>

          {/* Desktop Nav Links */}
          <nav
            className="desktop-nav"
            style={{
              gap: '32px',
              fontFamily: 'var(--font-nav)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.7px',
            }}
          >
            {[
              { label: 'Home', to: '/' },
              { label: "Men's", to: '/shop?category=Men' },
              { label: "Women's", to: '/shop?category=Women' },
              { label: 'New Arrivals', to: '/shop' },
              { label: 'About', to: '/about' },
              { label: 'Blog', to: '/blog' },
              { label: 'Contact', to: '/contact' },
            ].map(item => (
              <Link
                key={item.to + item.label}
                to={item.to}
                style={{ color: textColor, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.target.style.opacity = '0.6'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right icons (search, wishlist, account, cart) — visible when scrolled/solid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {isHeaderSolid && (
              <button onClick={openSearch} style={{ color: textColor, padding: 0 }}>
                <FaSearch size={16} />
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" style={{ color: 'var(--color-accent)', fontWeight: 'bold' }} className="desktop-nav">
                Dashboard
              </Link>
            )}
            <Link to="/account" style={{ color: textColor }} className="desktop-nav">
              <FaUser size={16} />
            </Link>
            <Link to="/wishlist" style={{ color: textColor }} className="desktop-nav">
              <FaHeart size={16} />
            </Link>
            <Link
              to="/cart"
              style={{ color: textColor, position: 'relative' }}
            >
              <FaShoppingBag size={18} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--color-accent)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '17px',
                    height: '17px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <SearchOverlay />
    </>
  );
};

export default Header;
