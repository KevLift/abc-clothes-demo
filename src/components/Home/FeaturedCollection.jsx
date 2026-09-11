import React from 'react';
import SqueezeCarousel from '../UI/CarouselSqueeze';

const mark = (text) => (
    <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: 'white' }}>{text}</span>
);

const slides = [
    {
        id: "womens-summer",
        title: "Women's Summer Collection",
        description: "Embrace the warmth with our lightweight, breathable fabrics and vibrant prints designed for the perfect summer getaway.",
        action: "Shop Women's",
        href: "/shop/women",
        overlay: mark("Summer '26"),
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&h=1000&fit=crop&fm=webp&q=90",
        imageAlt: "Woman in stylish summer dress",
    },
    {
        id: "mens-tailoring",
        title: "The Gold Label Tailoring",
        description: "Incorporating fine Italian craftsmanship with modern design. Discover suits that redefine elegance and confidence.",
        action: "Discover Gold Label",
        href: "/shop/men",
        overlay: mark("Gold Label"),
        image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1000&h=1000&fit=crop&fm=webp&q=90",
        imageAlt: "Man in an elegant brown tailored suit",
    },
    {
        id: "accessories",
        title: "Luxury Accessories",
        description: "Complete your look with our curated selection of premium leather goods, footwear, and timeless accessories.",
        action: "View Accessories",
        href: "/shop/accessories",
        overlay: mark("Accessories"),
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&h=1000&fit=crop&fm=webp&q=90",
        imageAlt: "Premium leather shoes and accessories",
    },
    {
        id: "evening-wear",
        title: "Evening Elegance",
        description: "Turn heads at any event with our exclusive evening wear collection. Sophistication in every thread.",
        action: "Shop Evening Wear",
        href: "/shop/evening",
        overlay: mark("Evening Wear"),
        image: "https://images.unsplash.com/photo-1722805740302-7bf173339b80?w=1000&h=1000&fit=crop&fm=webp&q=90",
        imageAlt: "Elegant evening dress",
    },
    {
        id: "casual-essentials",
        title: "Everyday Essentials",
        description: "Elevate your daily wardrobe with high-quality basics that offer unparalleled comfort without compromising on style.",
        action: "Shop Basics",
        href: "/shop/basics",
        overlay: mark("Essentials"),
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000&h=1000&fit=crop&fm=webp&q=90",
        imageAlt: "High quality casual clothing on a rack",
    }
];

const settings = {
    height: "clamp(280px, 70cqi, 400px)",
    gap: 16,
    slatGap: 8,
    slatWidth: 8,
    radius: 0,
    duration: 1000,
    hoverGrow: true,
    autoplay: false,
    interval: 6000,
    controls: true,
};

const FeaturedCollection = () => {
  return (
    <section style={{ padding: '80px 0', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h3>Featured Collections</h3>
      </div>
      <div style={{ padding: '0 20px', width: '100%' }}>
        <SqueezeCarousel 
          slides={slides} 
          label="Featured Collections" 
          {...settings} 
        />
      </div>
    </section>
  );
};

export default FeaturedCollection;
