import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { useCurrency } from '../../context/CurrencyContext';
import ProductFormModal from '../../components/Admin/ProductFormModal';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { formatPrice } = useCurrency();

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData) => {
    try {
      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, productData);
      } else {
        await productService.createProduct(productData);
      }
      setIsModalOpen(false);
      setProductToEdit(null);
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete product", err);
        alert("Failed to delete product.");
      }
    }
  };

  const openAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Products Management</h1>
        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px' }}>Add Product</button>
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
                  <button onClick={() => openEditModal(product)} style={{ marginRight: '10px', color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default AdminProductsPage;
