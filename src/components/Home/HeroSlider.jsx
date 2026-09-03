import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { heroSlides } from '../../data/heroSlides';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const HeroSlider = () => {
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 9000, disableOnInteraction: false }}
        navigation={{
          nextEl: '.custom-nav-next',
          prevEl: '.custom-nav-prev',
        }}
        pagination={{ clickable: true }}
        loop={true}
        style={{ height: '100%', width: '100%' }}
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <picture>
                <source media="(max-width: 768px)" srcSet={slide.mobileImage || slide.image} />
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: -1
                  }}
                />
              </picture>
              
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                zIndex: 1,
                backgroundColor: 'rgba(0,0,0,0.15)'
              }}>
                <div className="hero-content-box animate-slide-up">
                  <h1>{slide.title}</h1>
                  <p>
                    {slide.subtitle}
                  </p>
                  <Link to={slide.ctaLink} className="btn btn-primary" style={{ fontSize: '14px', padding: '15px 30px' }}>
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows */}
        <div className="custom-nav-prev">
          <FiArrowLeft size={24} />
        </div>
        <div className="custom-nav-next">
          <FiArrowRight size={24} />
        </div>

      </Swiper>
    </div>
  );
};

export default HeroSlider;
