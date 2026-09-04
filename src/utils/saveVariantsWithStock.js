import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';

/** Create/update variants and sync absolute stock quantities. */
export const saveVariantsWithStock = async (productId, variants = [], currency = 'LKR') => {
  const errors = [];
  for (const v of variants) {
    const variantBody = {
      name: v.name,
      sku: v.sku,
      price: v.price,
      ...(v.compareAtPrice != null ? { compareAtPrice: v.compareAtPrice } : {}),
      currency: v.currency || currency,
      optionValues: typeof v.optionValues === 'string'
        ? v.optionValues
        : JSON.stringify(v.optionValues || {}),
      position: v.position ?? 0,
      active: v.active !== false,
    };
    try {
      let saved = null;
      if (v.id) {
        saved = await productService.updateVariant(productId, v.id, variantBody);
      } else {
        saved = await productService.createVariant(productId, variantBody);
      }
      const variantId = saved?.id || v.id;
      if (variantId && v.stockQty !== undefined && v.stockQty !== '' && v.stockQty != null) {
        await inventoryService.setAvailableQty(
          variantId,
          v.stockQty,
          `Stock set for ${v.name || v.sku}`
        );
      }
    } catch (err) {
      console.error('Variant/stock save failed', err);
      errors.push(err.response?.data?.message || `${v.name || v.sku}: failed`);
    }
  }
  return errors;
};
