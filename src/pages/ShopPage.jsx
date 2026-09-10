import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/productService';
import { normalizeProduct } from '../utils/productHelpers';
import ProductGrid from '../components/Product/ProductGrid';
import ProductFilters from '../components/Product/ProductFilters';
import Breadcrumb from '../components/UI/Breadcrumb';

const useQuery = () => new URLSearchParams(useLocation().search);

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FREE SIZE'];

const ShopPage = () => {
  const query = useQuery();
  const initialCategory = query.get('category') || '';
  const searchQuery = query.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [resolvedCategory, setResolvedCategory] = useState(null);
  // True when the API already narrowed results to the chosen category (incl. its
  // subcategories). In that case we must NOT re-filter on the client, since a
  // product in "Men > T-Shirts" has categoryName "T-Shirts", not "Men".
  const [serverCategoryFiltered, setServerCategoryFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: initialCategory,
    sizes: [],
    colors: [],
    priceRange: 500000,
    // false until the shopper drags the price slider; while false the range
    // auto-tracks the current result set's max price.
    priceTouched: false,
  });
  const [sort, setSort] = useState('newest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: initialCategory, priceTouched: false }));
  }, [initialCategory]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const categorySlug = filters.category
          ? filters.category.toLowerCase().replace(/\s+/g, '-')
          : '';

        // Resolve the slug to a real category so we can filter by id and
        // show its canonical name in the heading / breadcrumb.
        const categoryPromise = categorySlug
          ? productService.getCategoryBySlug(categorySlug).catch(() => null)
          : Promise.resolve(null);

        const [cats, category] = await Promise.all([
          productService.getCategories().catch(() => []),
          categoryPromise,
        ]);
        setResolvedCategory(category);

        let categoryHandledByServer = false;
        const productResult = await (
          searchQuery
            ? productService.searchProducts(searchQuery).then((list) => ({ content: list }))
            : filters.category
              ? productService.getProducts({
                  page: 0,
                  size: 100,
                  categorySlug,
                  ...(category?.id ? { categoryId: category.id } : {}),
                })
                  .then((res) => { categoryHandledByServer = true; return res; })
                  .catch(async () => {
                    // fallback: fetch all and filter client-side by name
                    return productService.getProducts({ page: 0, size: 100 });
                  })
              : productService.getProducts({ page: 0, size: 100 })
        );
        setServerCategoryFiltered(categoryHandledByServer);
        setCategories(Array.isArray(cats) ? cats : []);
        const mapped = (productResult.content || []).map(normalizeProduct);
        setProducts(mapped);
        if (mapped.length) {
          const max = Math.max(...mapped.map((p) => p.salePrice || p.price), 1000);
          setFilters((prev) => ({
            ...prev,
            // If the shopper hasn't touched the slider, keep it pinned to the
            // new result set's max so switching to a pricier category doesn't
            // leave everything filtered out.
            priceRange: prev.priceTouched ? Math.min(prev.priceRange, max) : max,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Unable to load products. Please try again.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchQuery, filters.category]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const maxPrice = useMemo(() => {
    if (!products.length) return 500000;
    return Math.max(...products.map((p) => p.salePrice || p.price), 1000);
  }, [products]);

  // Filter options come from the catalogue actually loaded, so a "Colour" chip
  // always matches a real variant value (e.g. "Light Blue", not a fixed "Blue").
  const facetSizes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => (p.sizes || []).forEach((s) => s && set.add(s)));
    return [...set].sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(String(a).toUpperCase());
      const ib = SIZE_ORDER.indexOf(String(b).toUpperCase());
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return String(a).localeCompare(String(b));
    });
  }, [products]);
  const facetColors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => (p.colors || []).forEach((c) => c && set.add(c)));
    return [...set].sort((a, b) => String(a).localeCompare(String(b)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.category && !serverCategoryFiltered) {
      const cat = filters.category.toLowerCase();
      result = result.filter((p) =>
        [
          p.category,
          p.categoryName,
          p.categorySlug,
          p.parentCategoryName,
          resolvedCategory?.name,
          resolvedCategory?.slug,
        ].some((v) => (v || '').toString().toLowerCase() === cat)
      );
    }

    if (filters.sizes.length > 0) {
      const wanted = new Set(filters.sizes.map((s) => s.toLowerCase()));
      result = result.filter((p) => (p.sizes || []).some((s) => wanted.has(String(s).toLowerCase())));
    }

    if (filters.colors.length > 0) {
      const wanted = new Set(filters.colors.map((c) => c.toLowerCase()));
      result = result.filter((p) => (p.colors || []).some((c) => wanted.has(String(c).toLowerCase())));
    }

    result = result.filter((p) => (p.salePrice || p.price) <= filters.priceRange);

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
      default:
        result.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
    }

    return result;
  }, [products, filters, sort, serverCategoryFiltered, resolvedCategory]);

  const sortOptions = [
    { value: 'newest', label: 'Sort by Latest' },
    { value: 'price-low', label: 'Sort by Price: Low to High' },
    { value: 'price-high', label: 'Sort by Price: High to Low' },
    { value: 'name-a', label: 'Sort by Name: A-Z' },
  ];
  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      <Breadcrumb />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h2>{searchQuery ? `Search Results for "${searchQuery}"` : (resolvedCategory?.name || filters.category || 'All Products')}</h2>

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
              }}
            >
              {currentSortLabel}
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
            {isDropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, width: '100%',
                backgroundColor: 'white', border: '1px solid var(--color-separator)',
                zIndex: 100, boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
              }}>
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSort(option.value); setIsDropdownOpen(false); }}
                    style={{
                      padding: '12px 18px', textAlign: 'left', width: '100%',
                      fontSize: '13px', border: 'none', cursor: 'pointer',
                      backgroundColor: sort === option.value ? 'var(--color-light-bg)' : 'white',
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
        <aside className="shop-filters-sidebar desktop-filters">
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
            maxPrice={maxPrice}
            categories={categories}
            sizeOptions={facetSizes}
            colorOptions={facetColors}
          />
        </aside>

        <div style={{ flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#c62828' }}>{error}</div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
