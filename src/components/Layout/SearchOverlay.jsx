import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { useSearch } from '../../context/SearchContext';

const SearchOverlay = () => {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      closeSearch();
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeSearch}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 9998,
              cursor: 'pointer'
            }}
          />

          {/* Top Sliding Panel */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              zIndex: 9999,
              padding: '35px 20px',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '700px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FaSearch style={{ color: 'var(--color-body-text)', fontSize: '20px' }} />
              
              <input 
                type="text"
                placeholder="Search for products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  border: 'none',
                  borderBottom: '2px solid var(--color-separator)',
                  background: 'transparent',
                  fontSize: '18px',
                  padding: '10px 5px',
                  outline: 'none',
                  color: 'var(--color-heading-text)'
                }}
              />
              
              <button 
                type="button" 
                onClick={closeSearch}
                style={{ fontSize: '24px', color: 'var(--color-heading-text)', marginLeft: '10px' }}
              >
                <FaTimes />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
