import React from 'react';
import HeroSlider from '../components/Home/HeroSlider';
import IntroSection from '../components/Home/IntroSection';
import CategoryGrid from '../components/Home/CategoryGrid';
import FeaturedCollection from '../components/Home/FeaturedCollection';
import NewArrivals from '../components/Home/NewArrivals';
import NewsSection from '../components/Home/NewsSection';
import BrandBanner from '../components/Home/BrandBanner';
import Newsletter from '../components/Home/Newsletter';

const HomePage = () => {
  return (
    <div>
      <HeroSlider />
      <IntroSection />
      <CategoryGrid />
      <FeaturedCollection />
      <NewArrivals />
      <NewsSection />
      <BrandBanner />
      <Newsletter />
    </div>
  );
};

export default HomePage;
