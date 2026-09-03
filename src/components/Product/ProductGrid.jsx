import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <h3>No products found matching your criteria.</h3>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '30px'
      }}>
        {currentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', gap: '10px' }}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid var(--color-separator)',
                backgroundColor: currentPage === index + 1 ? 'var(--color-heading-text)' : 'transparent',
                color: currentPage === index + 1 ? 'white' : 'var(--color-body-text)',
                fontFamily: 'var(--font-nav)'
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
