import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Breadcrumb from '../components/UI/Breadcrumb';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === parseInt(id));

  useEffect(() => {
    if (!post) {
      navigate('/404');
    }
  }, [post, navigate]);

  if (!post) return null;

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px' }}>
      <Breadcrumb />
      <article style={{ marginTop: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-section-heading)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {post.date} &nbsp;/&nbsp; By {post.author}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading-alt)', fontSize: '32px', fontWeight: 400, letterSpacing: 'normal', textTransform: 'none', lineHeight: 1.3, marginBottom: '30px', color: 'var(--color-heading-text)' }}>
            {post.title}
          </h1>
        </div>
        
        <img 
          src={post.image} 
          alt={post.title} 
          style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', marginBottom: '40px' }} 
        />
        
        <div style={{ color: 'var(--color-body-text)', fontSize: '15px', lineHeight: 1.8 }}>
          {post.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} style={{ marginBottom: '20px' }}>{paragraph}</p>
          ))}
        </div>
      </article>
      
      <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid var(--color-separator)', paddingTop: '40px' }}>
        <Link to="/blog" style={{ 
          display: 'inline-block',
          borderBottom: '1px solid var(--color-heading-text)', 
          paddingBottom: '2px',
          fontFamily: 'var(--font-nav)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: '11px',
          color: 'var(--color-heading-text)',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Back to Journal
        </Link>
      </div>
    </div>
  );
};

export default BlogDetailPage;
