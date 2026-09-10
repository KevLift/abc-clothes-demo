import { useEffect, useMemo, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { extractSizesAndColors, parseVariantOptions } from '../utils/productHelpers';
import {
  colorsForSize,
  findExactVariant,
  isInStock,
  readAvailableQty,
  sizesForColor,
  variantComparePrice,
  variantDisplayPrice,
} from '../utils/variantSelection';

/**
 * Shared size/color selection with live variant price + stock.
 */
export const useProductVariantState = (product) => {
  const variants = product?.variants || [];
  const { sizes: allSizes, colors: allColors } = useMemo(
    () => extractSizesAndColors(variants),
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [stockByVariant, setStockByVariant] = useState({});
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    const nextSize = allSizes[0] || '';
    const colors = colorsForSize(variants, nextSize);
    setSelectedSize(nextSize);
    setSelectedColor(colors[0] || allColors[0] || '');
    setQuantity(1);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    const ids = variants.map((v) => v.id).filter(Boolean);
    if (!ids.length) {
      setStockByVariant({});
      return undefined;
    }
    setStockLoading(true);
    inventoryService.getBulkAvailability(ids)
      .then((data) => {
        if (cancelled) return;
        const map = {};
        const list = Array.isArray(data) ? data : (data?.items || data?.results || []);
        if (Array.isArray(list) && list.length) {
          list.forEach((item) => {
            const id = item.variantId || item.id;
            if (id) map[id] = item;
          });
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          Object.assign(map, data);
        }
        setStockByVariant(map);
      })
      .catch(async () => {
        // Fallback: fetch one-by-one
        const map = {};
        await Promise.all(ids.map(async (id) => {
          try {
            map[id] = await inventoryService.getAvailability(id);
          } catch {
            map[id] = { availableQty: 0, inStock: false };
          }
        }));
        if (!cancelled) setStockByVariant(map);
      })
      .finally(() => {
        if (!cancelled) setStockLoading(false);
      });
    return () => { cancelled = true; };
  }, [product?.id, variants]);

  // Show every size and colour the product offers — not just the ones that pair
  // with the current selection. Sparse matrices (e.g. M/Black + L/Blue) would
  // otherwise collapse to a single reachable cell. Combinations that don't exist
  // are struck through in the UI; choosing one axis auto-corrects the other via
  // selectSize / selectColor.
  const availableColors = allColors;
  const availableSizes = allSizes;

  // Keep color valid when size changes
  useEffect(() => {
    if (!availableColors.length) {
      if (selectedColor) setSelectedColor('');
      return;
    }
    if (!availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0]);
    }
  }, [selectedSize, availableColors]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedVariant = useMemo(
    () => findExactVariant(variants, selectedSize, selectedColor),
    [variants, selectedSize, selectedColor]
  );

  const availability = selectedVariant?.id ? stockByVariant[selectedVariant.id] : null;
  const availableQty = readAvailableQty(availability);
  const inStock = selectedVariant ? isInStock(availability) : false;
  const stockMessage = !selectedVariant
    ? (allSizes.length || allColors.length ? 'Select an available combination' : '')
    : stockLoading
      ? 'Checking stock...'
      : availableQty == null
        ? (inStock ? 'In stock' : 'Out of stock')
        : availableQty > 0
          ? `${availableQty} in stock`
          : 'Out of stock';

  const price = variantDisplayPrice(selectedVariant, product);
  const compareAtPrice = variantComparePrice(selectedVariant, product);

  const selectSize = (size) => {
    setSelectedSize(size);
    const colors = colorsForSize(variants, size);
    if (colors.length && !colors.includes(selectedColor)) {
      setSelectedColor(colors[0]);
    }
    setQuantity(1);
  };

  const selectColor = (color) => {
    setSelectedColor(color);
    const sizes = sizesForColor(variants, color);
    if (sizes.length && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
    setQuantity(1);
  };

  const maxQty = availableQty != null && availableQty > 0 ? availableQty : 1;
  const canAddToCart = !!selectedVariant && inStock && quantity > 0 && quantity <= maxQty;

  const isCombinationInStock = (size, color) => {
    const v = findExactVariant(variants, size || selectedSize, color || selectedColor);
    if (!v?.id) return false;
    return isInStock(stockByVariant[v.id]);
  };

  // "Does this option lead to at least one still-purchasable variant?" — used to
  // mark options rather than the exact size+colour pair, so a sparse matrix
  // (M only in Black, L only in Blue) shows every option as selectable. Unknown
  // stock (not loaded / lookup failed) counts as available so nothing is struck
  // through prematurely.
  const optionHasStock = (predicate) => variants.some((v) => {
    if (v.active === false || !predicate(parseVariantOptions(v))) return false;
    const av = stockByVariant[v.id];
    return av == null ? true : isInStock(av);
  });
  const isSizeAvailable = (size) => optionHasStock(({ size: vs }) => vs === size);
  const isColorAvailable = (color) => optionHasStock(({ color: vc }) => vc === color);

  return {
    allSizes,
    allColors,
    availableSizes,
    availableColors,
    selectedSize,
    selectedColor,
    selectSize,
    selectColor,
    quantity,
    setQuantity,
    selectedVariant,
    price,
    compareAtPrice,
    availableQty,
    inStock,
    stockMessage,
    stockLoading,
    canAddToCart,
    maxQty,
    isCombinationInStock,
    isSizeAvailable,
    isColorAvailable,
    stockByVariant,
  };
};

export default useProductVariantState;
