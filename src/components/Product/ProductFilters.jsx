import React from 'react';

const ProductFilters = ({ filters, setFilters, maxPrice, categories = [] }) => {
  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? '' : category,
    }));
  };

  const handleSizeChange = (size) => {
    setFilters((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleColorChange = (color) => {
    setFilters((prev) => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors };
    });
  };

  // Only admin-created categories — no hardcoded Men/Women/electronics fallbacks
  const categoryOptions = (categories || [])
    .filter((c) => !c.parentId)
    .map((c) => ({
      label: c.name,
      value: c.slug || c.name,
    }));

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const colors = ['Black', 'Navy', 'White', 'Ivory', 'Beige', 'Red', 'Blue', 'Green'];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
          Categories
        </h4>
        {categoryOptions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-body-text)' }}>
            No categories yet. Browse all products, or ask the store to add clothing categories.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoryOptions.map((cat) => (
              <li key={cat.value}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.category === cat.value || filters.category === cat.label}
                    onChange={() => handleCategoryChange(cat.value)}
                  />
                  <span>{cat.label}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
          Price Range
        </h4>
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={Math.min(filters.priceRange, maxPrice)}
          onChange={(e) => setFilters((prev) => ({ ...prev, priceRange: Number(e.target.value) }))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px' }}>
          <span>0</span>
          <span>{Number(filters.priceRange).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
          Size
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              style={{
                padding: '5px 10px',
                border: `1px solid ${filters.sizes.includes(size) ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                backgroundColor: filters.sizes.includes(size) ? 'var(--color-heading-text)' : 'transparent',
                color: filters.sizes.includes(size) ? 'white' : 'var(--color-body-text)',
                fontSize: '12px',
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
          Color
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{
                padding: '5px 10px',
                border: `1px solid ${filters.colors.includes(color) ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                backgroundColor: filters.colors.includes(color) ? 'var(--color-heading-text)' : 'transparent',
                color: filters.colors.includes(color) ? 'white' : 'var(--color-body-text)',
                fontSize: '12px',
              }}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
