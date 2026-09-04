/** Parse variant optionValues JSON or name like "Large / Blue" into size/color. */
export const parseVariantOptions = (variant) => {
  if (!variant) return { size: null, color: null };
  let size = variant.size || null;
  let color = variant.color || null;

  if (variant.optionValues) {
    try {
      const opts = typeof variant.optionValues === 'string'
        ? JSON.parse(variant.optionValues)
        : variant.optionValues;
      if (opts && typeof opts === 'object') {
        size = size || opts.size || opts.Size || opts.SIZE || null;
        color = color || opts.color || opts.Color || opts.COLOR || null;
      }
    } catch {
      // ignore
    }
  }

  if ((!size || !color) && variant.name) {
    const parts = variant.name.split(/[\/|,|-]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      size = size || parts[0];
      color = color || parts[1];
    } else if (parts.length === 1) {
      size = size || parts[0];
    }
  }

  return { size, color };
};

export const extractSizesAndColors = (variants = []) => {
  const sizes = [];
  const colors = [];
  variants.forEach((v) => {
    const { size, color } = parseVariantOptions(v);
    if (size && !sizes.includes(size)) sizes.push(size);
    if (color && !colors.includes(color)) colors.push(color);
  });
  return { sizes, colors };
};

export const findVariantId = (variants = [], size, color) => {
  if (!variants.length) return null;
  const match = variants.find((v) => {
    const opts = parseVariantOptions(v);
    const sizeOk = !size || opts.size === size || v.name?.includes(size);
    const colorOk = !color || opts.color === color || v.name?.includes(color);
    return sizeOk && colorOk;
  });
  return match?.id || variants[0]?.id || null;
};

export const normalizeProduct = (p) => {
  if (!p) return null;
  const variants = p.variants || [];
  const { sizes, colors } = extractSizesAndColors(variants);
  const fromImages = Array.isArray(p.images)
    ? p.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : [];
  const primary = p.primaryImageUrl || p.imageUrl || fromImages[0] || p.image || '';
  const images = fromImages.length ? fromImages : (primary ? [primary] : []);
  return {
    ...p,
    price: Number(p.price ?? p.basePrice ?? 0),
    salePrice: p.compareAtPrice ? Number(p.price ?? p.basePrice ?? 0) : (p.salePrice ? Number(p.salePrice) : null),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    images,
    image: primary,
    primaryImageUrl: primary,
    sizes: sizes.length ? sizes : p.sizes || [],
    colors: colors.length ? colors : p.colors || [],
    variants,
    category: p.categoryName || p.category || '',
    categoryName: p.categoryName || p.category || '',
    categorySlug: p.categorySlug || '',
  };
};

export const mapCartToUiItems = (cart) => {
  if (!cart?.items) return [];
  return cart.items.map((item) => {
    const nameParts = (item.variantName || '').split(/[\/|,|-]/).map((p) => p.trim());
    return {
      id: item.productId,
      productId: item.productId,
      cartItemId: item.id,
      variantId: item.variantId,
      name: item.productName,
      images: item.imageUrl ? [item.imageUrl] : [],
      image: item.imageUrl || '',
      price: Number(item.unitPrice),
      salePrice: null,
      size: nameParts[0] || item.variantName || '',
      color: nameParts[1] || '',
      quantity: item.quantity,
      sku: item.sku,
      lineTotal: Number(item.lineTotal),
    };
  });
};
