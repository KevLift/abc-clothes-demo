import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * Read-only star rating. `value` 0–5 (halves rounded to nearest 0.5).
 * Colour follows the site accent so it fits the theme.
 */
const StarRating = ({ value = 0, size = 14, gap = 2, color = 'var(--color-accent)', style }) => {
  const rounded = Math.round((Number(value) || 0) * 2) / 2;
  return (
    <span
      aria-label={`${rounded} out of 5`}
      style={{ display: 'inline-flex', alignItems: 'center', gap, color, lineHeight: 1, ...style }}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        if (rounded >= i) return <FaStar key={i} size={size} />;
        if (rounded >= i - 0.5) return <FaStarHalfAlt key={i} size={size} />;
        return <FaRegStar key={i} size={size} style={{ opacity: 0.5 }} />;
      })}
    </span>
  );
};

export default StarRating;
