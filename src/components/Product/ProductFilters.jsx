import React from 'react';

const ProductFilters = ({ filters, setFilters, maxPrice }) => {
  
  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category: prev.category === category ? '' : category }));
  };

  const handleSizeChange = (size) => {
    setFilters(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleColorChange = (color) => {
    setFilters(prev => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors };
    });
  };

  const categories = ['Men', 'Women', 'Kids', 'Accessories'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'Free Size', '48', '50', '52'];
  const colors = ['Black', 'Navy', 'White', 'Ivory', 'Beige', 'Red', 'Blue'];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>Categories</h4>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map(cat => (
            <li key={cat}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={filters.category === cat}
                  onChange={() => handleCategoryChange(cat)}
                />
                <span style={{ color: filters.category === cat ? 'var(--color-heading-text)' : 'var(--color-body-text)' }}>{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>Price Range</h4>
        <input 
          type="range" 
          min="0" 
          max={maxPrice} 
          value={filters.priceRange} 
          onChange={(e) => setFilters(prev => ({ ...prev, priceRange: Number(e.target.value) }))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px' }}>
          <span>Rs. 0</span>
          <span>Rs. {filters.priceRange.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>Size</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              style={{
                padding: '5px 10px',
                border: `1px solid ${filters.sizes.includes(size) ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                backgroundColor: filters.sizes.includes(size) ? 'var(--color-heading-text)' : 'transparent',
                color: filters.sizes.includes(size) ? 'white' : 'var(--color-body-text)',
                fontSize: '12px'
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '15px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>Color</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{
                padding: '5px 10px',
                border: `1px solid ${filters.colors.includes(color) ? 'var(--color-heading-text)' : 'var(--color-separator)'}`,
                backgroundColor: filters.colors.includes(color) ? 'var(--color-heading-text)' : 'transparent',
                color: filters.colors.includes(color) ? 'white' : 'var(--color-body-text)',
                fontSize: '12px'
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
