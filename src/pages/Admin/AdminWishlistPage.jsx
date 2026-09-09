import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../../services/wishlistService';
import { useCurrency } from '../../context/CurrencyContext';

const AdminWishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { formatPrice } = useCurrency();

  const load = async () => {
    setLoading(true);
    try {
      const result = await wishlistService.getMostWishlisted({ page, size: 20 });
      setItems(result.content || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1>Wishlisted Products</h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Products customers have added to their wishlist, ranked by demand — a signal for restocking or promotions.
        </p>
      </div>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: '#888' }}>No products have been wishlisted yet.</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left' }}></th>
                <th style={{ padding: 12, textAlign: 'left' }}>Product</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Price</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Times Wishlisted</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>
                    <img
                      src={item.imageUrl || '/images/product-placeholder.svg'}
                      alt=""
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                    />
                  </td>
                  <td style={{ padding: 12 }}>
                    <Link to={`/product/${item.productId}`} style={{ color: '#2c3e50' }}>{item.productName}</Link>
                  </td>
                  <td style={{ padding: 12 }}>{formatPrice(item.productPrice)}</td>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>{item.wishlistCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
        <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page + 1} / {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default AdminWishlistPage;
