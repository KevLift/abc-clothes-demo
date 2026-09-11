import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin, canShop } from '../../utils/roles';
import { useStoreCategories } from '../../hooks/useStoreCategories';
import { FaSearch, FaShoppingBag, FaBars, FaHeart, FaUser } from 'react-icons/fa';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';
import Select from '../UI/Select';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { openSearch } = useSearch();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { user } = useAuth();
  const location = useLocation();
  const { navItems } = useStoreCategories();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTransparentPage = location.pathname === '/' || location.pathname === '/about';

  useEffect(() => {
    if (isAdminRoute) return undefined;
    let scrollTimeout;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 80);

      if (currentScrollY > 80) {
        setIsScrolling(true);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      } else {
        setIsScrolling(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return null;
  }

  const isHeaderSolid = !isTransparentPage || isScrolled;
  const textColor = isHeaderSolid ? 'var(--color-heading-text)' : 'white';
  const showShopping = canShop(user);

  const navLinks = [
    { label: 'Home', to: '/' },
    { 
      label: 'Shop All', 
      to: '/shop',
      dropdown: [
        { label: 'Men', to: '/shop?category=men' },
        { label: 'Women', to: '/shop?category=women' },
        { label: 'Kids', to: '/shop?category=kids' },
        { label: 'Wedding', to: '/shop?category=wedding' },
      ]
    },
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ];

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
          boxShadow: 'none',
          transition: 'all 0.3s ease, transform 0.3s ease',
          transform: isScrolling ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <div
          className="main-nav-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isScrolled ? '14px 40px' : '18px 40px',
          }}
        >
          {/* Left side: Mobile menu and Nav */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
              style={{ color: textColor, padding: 0, marginRight: '20px' }}
            >
              <FaBars size={22} />
            </button>
            <nav
              className="desktop-nav"
              style={{
                gap: '28px',
                fontFamily: 'var(--font-nav)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1.7px',
                display: 'flex',
              }}
            >
              {navLinks.map((item) => (
                <div key={item.to + item.label} className={`nav-item-container ${item.dropdown ? 'has-dropdown' : ''}`}>
                  <Link
                    to={item.to}
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </Link>
                  {item.dropdown && (
                    <div className="nav-dropdown-menu">
                      {item.dropdown.map(subItem => (
                        <Link key={subItem.to} to={subItem.to} className="nav-dropdown-link">{subItem.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/"
              className="header-logo"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: textColor,
              }}
            >
              ABC CLOTHES
            </Link>
          </div>

          {/* Right side: Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, justifyContent: 'flex-end' }}>
            <Select
              variant={isHeaderSolid ? 'default' : 'ghost'}
              value={currency}
              onChange={setCurrency}
              aria-label="Currency"
              options={availableCurrencies.map((c) => ({ value: c, label: c }))}
            />
            <button onClick={openSearch} aria-label="Search" style={{ color: textColor, padding: 0 }}>
              <FaSearch size={16} />
            </button>
            {canAccessAdmin(user) && (
              <Link to="/admin" style={{ color: 'var(--color-accent)', fontWeight: 'bold' }} className="desktop-nav">
                Dashboard
              </Link>
            )}
            <Link to="/account" style={{ color: textColor }} className="desktop-nav">
              <FaUser size={16} />
            </Link>
            {showShopping && (
              <>
                <Link to="/wishlist" style={{ color: textColor }} className="desktop-nav">
                  <FaHeart size={16} />
                </Link>
                <Link to="/cart" style={{ color: textColor, position: 'relative' }}>
                  <FaShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--color-accent)',
                        color: 'white',
                        borderRadius: 0,
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
              </>
            )}
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categoryLinks={[
          { label: 'Men', to: '/shop?category=men' },
          { label: 'Women', to: '/shop?category=women' },
          { label: 'Kids', to: '/shop?category=kids' },
          { label: 'Wedding', to: '/shop?category=wedding' },
        ]}
        showShoppingLinks={showShopping}
      />
      <SearchOverlay />
    </>
  );
};

export default Header;
