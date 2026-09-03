import React, { useState } from 'react';
import { faqData } from '../data/faqData';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQPage = () => {
  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>Frequently Asked Questions</h1>
      
      {faqData.map((category, catIndex) => (
        <div key={catIndex} style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-separator)', paddingBottom: '10px' }}>
            {category.category}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {category.questions.map((faq, qIndex) => (
              <FAQItem key={qIndex} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div style={{ border: '1px solid var(--color-separator)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px',
          textAlign: 'left',
          fontSize: '16px',
          fontFamily: 'var(--font-heading)'
        }}
      >
        {question}
        {isOpen ? <FaChevronUp size={12} color="var(--color-section-heading)" /> : <FaChevronDown size={12} color="var(--color-section-heading)" />}
      </button>
      
      {isOpen && (
        <div style={{ padding: '0 20px 20px', color: 'var(--color-body-text)', lineHeight: 1.6 }}>
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQPage;
