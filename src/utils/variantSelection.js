import { parseVariantOptions } from './productHelpers';

/** Exact variant for a size/color pair — no fallback to unrelated variants. */
export const findExactVariant = (variants = [], size, color) => {
  const active = (variants || []).filter((v) => v && v.active !== false);
  if (!active.length) return null;

  const hasSizes = active.some((v) => !!parseVariantOptions(v).size);
  const hasColors = active.some((v) => !!parseVariantOptions(v).color);

  return active.find((v) => {
    const { size: vs, color: vc } = parseVariantOptions(v);
    if (hasSizes && size && vs !== size) return false;
    if (hasColors && color && vc !== color) return false;
    if (hasSizes && !size) return false;
    if (hasColors && !color) return false;
    if (!hasSizes && !hasColors) return true;
    return true;
  }) || null;
};

export const colorsForSize = (variants = [], size) => {
  const colors = [];
  (variants || []).forEach((v) => {
    if (v?.active === false) return;
    const { size: vs, color: vc } = parseVariantOptions(v);
    if (size && vs !== size) return;
    if (vc && !colors.includes(vc)) colors.push(vc);
  });
  return colors;
};

export const sizesForColor = (variants = [], color) => {
  const sizes = [];
  (variants || []).forEach((v) => {
    if (v?.active === false) return;
    const { size: vs, color: vc } = parseVariantOptions(v);
    if (color && vc !== color) return;
    if (vs && !sizes.includes(vs)) sizes.push(vs);
  });
  return sizes;
};

export const variantDisplayPrice = (variant, product) => {
  if (variant?.price != null && variant.price !== '') return Number(variant.price);
  return Number(product?.price ?? product?.basePrice ?? 0);
};

export const variantComparePrice = (variant, product) => {
  if (variant?.compareAtPrice != null && variant.compareAtPrice !== '') {
    return Number(variant.compareAtPrice);
  }
  if (product?.compareAtPrice != null) return Number(product.compareAtPrice);
  return null;
};

export const readAvailableQty = (availability) => {
  if (availability == null) return null;
  if (typeof availability === 'number') return availability;
  return availability.availableQty ?? availability.available ?? null;
};

export const isInStock = (availability) => {
  if (availability == null) return false;
  if (typeof availability.inStock === 'boolean') return availability.inStock;
  const qty = readAvailableQty(availability);
  return qty != null ? qty > 0 : false;
};
