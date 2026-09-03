import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { productService } from '../../services/productService';
import { products as fallbackProducts } from '../../data/products';
import ProductCard from '../Product/ProductCard';

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await productService.getNewArrivals();
        const mappedData = data.map(p => ({
          ...p,
          price: p.basePrice,
          images: p.images ? p.images.map(img => img.url) : [],
          sizes: p.variants ? [...new Set(p.variants.map(v => v.size))] : [],
          colors: p.variants ? [...new Set(p.variants.map(v => v.color))] : []
        }));
        setNewProducts(mappedData.length > 0 ? mappedData : fallbackProducts.filter(p => p.isNew));
      } catch (err) {
        setNewProducts(fallbackProducts.filter(p => p.isNew));
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
              {newProducts.map(product => (
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
