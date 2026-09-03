import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const BlogPage = () => {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '60px' }}>Journal</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '50px'
      }}>
        {blogPosts.map(post => (
          <article key={post.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to={`/blog/${post.id}`} style={{ display: 'block', overflow: 'hidden', marginBottom: '20px' }}>
              <img
                src={post.image}
                alt={post.title}
                style={{
                  width: '100%',
                  height: '260px',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            </Link>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-section-heading)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {post.date} &nbsp;/&nbsp; By {post.author}
              </div>
              <h3 style={{
                fontSize: '18px',
                marginBottom: '15px',
                textTransform: 'none',
                letterSpacing: 'normal',
                fontFamily: 'var(--font-heading-alt)',
                fontWeight: 400,
                lineHeight: 1.4,
                flex: 1
              }}>
                <Link to={`/blog/${post.id}`} style={{ color: 'var(--color-heading-text)' }}>{post.title}</Link>
              </h3>
              <p style={{ color: 'var(--color-body-text)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.7 }}>
                {post.excerpt}
              </p>
              <Link
                to={`/blog/${post.id}`}
                style={{
                  alignSelf: 'flex-start',
                  borderBottom: '1px solid var(--color-heading-text)',
                  paddingBottom: '2px',
                  fontFamily: 'var(--font-nav)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '11px',
                  color: 'var(--color-heading-text)'
                }}
              >
                Read More
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
