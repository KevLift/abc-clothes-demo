import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { parseVariantOptions } from './productHelpers';

const norm = (s) => (s || '').toString().trim().toLowerCase();

/** size/color signature — used to recognise a variant that has no local id yet. */
const optionKey = (v) => {
  const { size, color } = parseVariantOptions({
    optionValues: v.optionValues,
    name: v.name,
    size: v.size,
    color: v.color,
  });
  return `${norm(size)}|${norm(color)}`;
};

/**
 * Create/update variants and sync absolute stock quantities.
 *
 * A row is an UPDATE when it carries an id, or when its size+color already
 * matches a variant on the product (lets a re-save after a partial failure
 * reconcile instead of re-inserting). We deliberately do NOT match by SKU:
 * SKUs are globally unique and belong to exactly one variant, so a SKU that
 * points at a *different* size/color is a user mistake, not something to
 * silently overwrite.
 */
export const saveVariantsWithStock = async (productId, variants = [], currency = 'LKR') => {
  const errors = [];

  let existing = [];
  try {
    existing = await productService.getVariants(productId);
  } catch {
    existing = [];
  }
  const byOption = new Map();
  const bySku = new Map();
  for (const ev of existing) {
    byOption.set(optionKey(ev), ev);
    if (ev.sku) bySku.set(norm(ev.sku), ev);
  }

  const seenOption = new Set();

  for (const v of variants) {
    const optKey = optionKey(v);
    const skuKey = norm(v.sku);

    // Collapse duplicate rows (same size+color) within one submit.
    if (optKey !== '|' && seenOption.has(optKey)) continue;
    if (optKey !== '|') seenOption.add(optKey);

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

    // Only reconcile by real id or by exact size+color — never by SKU alone.
    const match = (v.id && existing.find((e) => e.id === v.id))
      || (optKey !== '|' ? byOption.get(optKey) : null);
    const targetId = v.id || match?.id || null;

    // Pre-flight: a new/other-option row asking for a SKU that already belongs to
    // a different variant will be rejected by the DB — say so clearly up front.
    const skuOwner = bySku.get(skuKey);
    if (skuKey && skuOwner && skuOwner.id !== targetId) {
      errors.push(
        `${v.name || v.sku}: SKU "${v.sku}" already belongs to "${skuOwner.name || 'another variant'}". Give this variant its own SKU.`
      );
      continue;
    }

    try {
      let saved = null;
      if (targetId) {
        saved = await productService.updateVariant(productId, targetId, variantBody);
      } else {
        saved = await productService.createVariant(productId, variantBody);
      }

      const variantId = saved?.id || targetId;
      if (variantId) {
        const reg = { ...(saved || {}), id: variantId, sku: v.sku, name: v.name };
        if (optKey !== '|') byOption.set(optKey, reg);
        if (skuKey) bySku.set(skuKey, reg);
        if (!existing.some((e) => e.id === variantId)) existing.push(reg);
      }

      if (variantId && v.stockQty !== undefined && v.stockQty !== '' && v.stockQty != null) {
        await inventoryService.setAvailableQty(
          variantId,
          v.stockQty,
          `Stock set for ${v.name || v.sku}`
        );
      }
    } catch (err) {
      console.error('Variant/stock save failed', err);
      const serverMsg = err.response?.data?.message || '';
      const label = v.name || v.sku || 'variant';
      errors.push(
        /already exists/i.test(serverMsg)
          ? `${label}: SKU "${v.sku}" is already in use — give this variant a unique SKU`
          : (serverMsg || `${label}: failed`)
      );
    }
  }
  return errors;
};
