import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';

/** Shared clothing-category helpers — no hardcoded defaults. */
export const useStoreCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    productService.getCategories()
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const roots = categories.filter((c) => !c.parentId);
  const childrenOf = (parentId) => categories.filter((c) => c.parentId === parentId);

  const labelFor = (c) => {
    if (!c?.parentId) return c?.name || '';
    const parent = categories.find((p) => p.id === c.parentId);
    return parent ? `${parent.name} › ${c.name}` : c.name;
  };

  /** Options for product forms: prefer leaf categories, fall back to all. */
  const productOptions = (() => {
    const withChildren = new Set(categories.filter((c) => c.parentId).map((c) => c.parentId));
    const leaves = categories.filter((c) => !withChildren.has(c.id));
    const list = leaves.length ? leaves : categories;
    return list.map((c) => ({
      id: c.id,
      name: labelFor(c),
      slug: c.slug,
      raw: c,
    }));
  })();

  const navItems = roots.map((c) => ({
    label: c.name,
    to: `/shop?category=${encodeURIComponent(c.slug || c.name)}`,
    slug: c.slug,
    id: c.id,
  }));

  return { categories, roots, childrenOf, productOptions, navItems, labelFor, loading };
};

export default useStoreCategories;
