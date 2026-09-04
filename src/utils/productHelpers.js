/** Parse variant optionValues JSON or name like "Large / Blue" into size/color. */
export const parseOptionValuesRaw = (raw) => {
  if (raw == null) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return null;

  let text = raw.trim();
  // Backend used to leak JsonByteArrayInput{{...}} via toString()
  const wrapper = text.match(/^JsonByteArrayInput\{([\s\S]*)\}$/);
  if (wrapper) text = wrapper[1].trim();

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const parseVariantOptions = (variant) => {
  if (!variant) return { size: null, color: null };
  let size = variant.size || null;
  let color = variant.color || null;

  const opts = parseOptionValuesRaw(variant.optionValues);
  if (opts) {
    size = size || opts.size || opts.Size || opts.SIZE || null;
    color = color || opts.color || opts.Color || opts.COLOR || null;
  }

  if ((!size || !color) && variant.name) {
    const parts = variant.name.split(/[\/|,]/).map((p) => p.trim()).filter(Boolean);
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
    if (v && v.active === false) return;
    const { size, color } = parseVariantOptions(v);
    if (size && !sizes.includes(size)) sizes.push(size);
    if (color && !colors.includes(color)) colors.push(color);
  });
  return { sizes, colors };
};

export const findVariantId = (variants = [], size, color) => {
  const active = (variants || []).filter((v) => v && v.active !== false);
  if (!active.length) return null;
  const match = active.find((v) => {
    const opts = parseVariantOptions(v);
    const sizeOk = !size || opts.size === size || v.name?.includes(size);
    const colorOk = !color || opts.color === color || v.name?.includes(color);
    return sizeOk && colorOk;
  });
  return match?.id || active[0]?.id || null;
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
    const nameParts = (item.variantName || '').split(/[\/|,]/).map((p) => p.trim());
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
