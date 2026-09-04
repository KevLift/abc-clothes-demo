import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { productService } from '../../services/productService';
import { normalizeProduct } from '../../utils/productHelpers';
import ProductCard from '../Product/ProductCard';

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await productService.getNewArrivals(8);
        setNewProducts((data || []).map(normalizeProduct));
      } catch (err) {
        console.error(err);
        setNewProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <section className="section" style={{ padding: '60px 0' }}>
      <div className="container">
        <h3 className="text-center" style={{ marginBottom: '40px' }}>New Arrivals</h3>
        <div style={{ position: 'relative' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : newProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-body-text)' }}>
              No products available yet.
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              style={{ padding: '10px' }}
            >
              {newProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
