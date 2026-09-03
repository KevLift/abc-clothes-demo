import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { useCurrency } from '../../context/CurrencyContext';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Products Management</h1>
        <button className="btn btn-primary" style={{ padding: '10px 20px' }}>Add Product</button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Image</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Price</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '15px' }}>
                  <img src={product.images?.[0]?.url || ''} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td style={{ padding: '15px' }}>{product.name}</td>
                <td style={{ padding: '15px' }}>{product.categoryName || product.category}</td>
                <td style={{ padding: '15px' }}>{formatPrice(product.salePrice || product.basePrice || product.price)}</td>
                <td style={{ padding: '15px' }}>
                  <button style={{ marginRight: '10px', color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
