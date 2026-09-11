import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ConditionGrid.css';

const projects = [
  {
    id: "01",
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&h=800&fit=crop&fm=webp&q=90",
    title: "Men",
    link: "/shop?category=men",
  },
  {
    id: "02",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=800&fit=crop&fm=webp&q=90",
    title: "Women",
    link: "/shop?category=women",
  },
  {
    id: "03",
    img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&h=800&fit=crop&fm=webp&q=90",
    title: "Kids",
    link: "/shop?category=kids",
  },
  {
    id: "04",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop&fm=webp&q=90",
    title: "Wedding",
    link: "/shop?category=wedding",
  },
];

export default function ConditionGrid() {
  return (
    <div className="condition-grid" style={{ fontFamily: 'var(--font-body)' }}>
      {projects.map((project) => {
        return (
          <motion.article
            key={project.id}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
            viewport={{ once: true }}
            className="cg-article"
          >
            <Link to={project.link} style={{ display: 'block', height: '100%' }}>
              <div className="cg-img-wrapper">
                <img
                  src={project.img}
                  alt={project.title}
                  className="cg-img"
                  style={{ height: '400px' }}
                />
              </div>
              <div className="cg-overlay">
                <h3 className="cg-title" style={{ fontFamily: 'var(--font-heading)' }}>
                  {project.title}
                </h3>
                <div className="cg-icon-wrapper">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>
              </div>
            </Link>
          </motion.article>
        );
      })}
    </div>
  );
}
