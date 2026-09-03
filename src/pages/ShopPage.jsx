import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/productService';
import { products as fallbackProducts } from '../data/products';
import ProductGrid from '../components/Product/ProductGrid';
import ProductFilters from '../components/Product/ProductFilters';
import Breadcrumb from '../components/UI/Breadcrumb';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ShopPage = () => {
  const query = useQuery();
  const initialCategory = query.get('category') || '';
  const searchQuery = query.get('search') || '';

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts();
        // Backend DTO uses images array of objects {url}, map it to simple strings to match frontend
        const mappedData = data.map(p => ({
          ...p,
          price: p.basePrice,
          images: p.images ? p.images.map(img => img.url) : [],
          sizes: p.variants ? [...new Set(p.variants.map(v => v.size))] : [],
          colors: p.variants ? [...new Set(p.variants.map(v => v.color))] : []
        }));
        setProducts(mappedData.length > 0 ? mappedData : fallbackProducts);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const maxProductPrice = Math.max(...fallbackProducts.map(p => p.salePrice || p.price), 200000);

  const [filters, setFilters] = useState({
    category: initialCategory,
    sizes: [],
    colors: [],
    priceRange: maxProductPrice,
  });

  const [sort, setSort] = useState('newest');

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: initialCategory }));
  }, [initialCategory]);

  const maxPrice = maxProductPrice;

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.sizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => filters.sizes.includes(s)));
    }

    if (filters.colors.length > 0) {
      result = result.filter(p => p.colors.some(c => filters.colors.includes(c)));
    }

    result = result.filter(p => (p.salePrice || p.price) <= filters.priceRange);

    // Sorting
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name-a':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
        break;
    }

    return result;
  }, [filters, sort, searchQuery]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Sort by Latest' },
    { value: 'price-low', label: 'Sort by Price: Low to High' },
    { value: 'price-high', label: 'Sort by Price: High to Low' },
    { value: 'name-a', label: 'Sort by Name: A-Z' }
  ];
  
  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      <Breadcrumb />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h2>{searchQuery ? `Search Results for "${searchQuery}"` : (filters.category || 'All Products')}</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-body-text)' }}>
            Showing {filteredProducts.length} results
          </span>
          
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                padding: '10px 18px', 
                border: '1px solid var(--color-separator)',
                backgroundColor: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-heading-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '220px',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '0'
              }}
            >
              {currentSortLabel}
              <span style={{ fontSize: '10px', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▼</span>
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid var(--color-separator)',
                borderTop: 'none',
                zIndex: 100,
                boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setSort(option.value); setIsDropdownOpen(false); }}
                    style={{
                      padding: '12px 18px',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      backgroundColor: sort === option.value ? 'var(--color-light-bg)' : 'white',
                      color: sort === option.value ? 'var(--color-accent)' : 'var(--color-heading-text)',
                      border: 'none',
                      borderBottom: '1px solid #f9f9f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease, color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (sort !== option.value) {
                        e.target.style.backgroundColor = '#f9f9f9';
                        e.target.style.color = 'var(--color-accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (sort !== option.value) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = 'var(--color-heading-text)';
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <aside style={{ width: '250px', flexShrink: 0 }} className="desktop-filters">
          <ProductFilters filters={filters} setFilters={setFilters} maxPrice={maxPrice} />
        </aside>
        
        <div style={{ flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
