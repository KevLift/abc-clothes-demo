import React from 'react';
import { blogPosts } from '../data/blogPosts';

const UNSPLASH = 'https://images.unsplash.com';

const updatedBlogPosts = [
  {
    ...blogPosts[0],
    image: `${UNSPLASH}/photo-1519741497674-611481863552?w=800&q=80`
  },
  {
    ...blogPosts[1],
    image: `${UNSPLASH}/photo-1490114538077-0a7f8cb49891?w=800&q=80`
  },
  {
    ...blogPosts[2],
    image: `${UNSPLASH}/photo-1522774538910-df2ee2aa9e72?w=800&q=80`
  }
];
export { updatedBlogPosts as blogPosts };
