import React from 'react';
import ConditionGrid from '../UI/ConditionGrid';

const CategoryGrid = () => {
  return (
    <section style={{ padding: '0 0 60px' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <h3 style={{ margin: 0 }}>Categories</h3>
      </div>
      <div className="container" style={{ padding: '0 20px', maxWidth: '1240px' }}>
        <ConditionGrid />
      </div>
    </section>
  );
};

export default CategoryGrid;
