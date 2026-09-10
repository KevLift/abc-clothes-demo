import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { socialService } from '../../services/socialService';
import Select from '../UI/Select';
import { parseVariantOptions } from '../../utils/productHelpers';

const modalStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const modalContentStyle = {
  backgroundColor: 'white', padding: '30px', borderRadius: '8px',
  width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
};
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };

const emptyVariant = () => ({
  name: '', sku: '', price: '', compareAtPrice: '', size: '', color: '',
  position: 0, active: true, stockQty: '', skuTouched: false,
});

const slugPart = (value) => String(value || '')
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 20);

/** Variant SKU built from the product SKU + every option value (size, color). */
const autoVariantSku = (productSku, size, color) =>
  [slugPart(productSku) || 'SKU', slugPart(size), slugPart(color)].filter(Boolean).join('-');

const ATTRIBUTE_VALUE_FIELD = {
  TEXT: 'valueText',
  MULTI_SELECT: 'valueText',
  NUMBER: 'valueNumber',
  BOOLEAN: 'valueBoolean',
  SELECT: 'optionId',
};

const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({}); // attributeId -> raw value
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  // Images picked before the product exists yet — uploaded right after creation succeeds.
  const [pendingImages, setPendingImages] = useState([]); // [{ file, previewUrl }]
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', categoryId: '', sku: '',
    price: '', compareAtPrice: '', featured: false, currency: 'LKR',
    variants: [emptyVariant()], images: [],
    socialEnabled: false, socialDescription: '', socialPlatforms: [],
  });

  useEffect(() => {
    if (!isOpen) return;
    productService.getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
    socialService.listAccounts()
      .then((accounts) => setConnectedPlatforms([...new Set((accounts || [])
        .filter((a) => a.status === 'CONNECTED')
        .map((a) => a.platform))]))
      .catch(() => setConnectedPlatforms([]));
  }, [isOpen]);

  const togglePlatform = (platform) => {
    setFormData((prev) => {
      const has = prev.socialPlatforms.includes(platform);
      return {
        ...prev,
        socialPlatforms: has
          ? prev.socialPlatforms.filter((p) => p !== platform)
          : [...prev.socialPlatforms, platform],
      };
    });
  };

  // Mirrors the backend's fallback caption (ProductSocialPublishingService.buildMessage)
  // so the preview matches what will actually be posted when no custom caption is given.
  const buildSocialPreviewMessage = () => {
    const custom = (formData.socialDescription || '').trim();
    const productUrl = `${window.location.origin}/product/${formData.slug || ''}`;
    const base = custom
      ? custom
      : `New arrival: ${formData.name || 'Untitled product'}${formData.description ? `\n\n${formData.description}` : ''}`;
    // Mirrors ProductSocialPublishingService.resolvePriceLabel: lowest active variant
    // price ("From …" when they differ), else the base price.
    const currency = formData.currency || 'LKR';
    const variantPrices = (formData.variants || [])
      .filter((v) => v.active !== false && v.price !== '' && v.price != null)
      .map((v) => parseFloat(v.price))
      .filter((n) => !Number.isNaN(n));
    let priceLine = '';
    if (variantPrices.length) {
      const lowest = Math.min(...variantPrices);
      const mixed = variantPrices.some((p) => p !== lowest);
      priceLine = `\n\nPrice: ${mixed ? 'From ' : ''}${currency} ${lowest.toFixed(2)}`;
    } else if (formData.price !== '' && formData.price != null && !Number.isNaN(parseFloat(formData.price))) {
      priceLine = `\n\nPrice: ${currency} ${parseFloat(formData.price).toFixed(2)}`;
    }
    return `${base}${priceLine}\n\nShop now: ${productUrl}`;
  };

  const socialPreviewImage = formData.images?.find((img) => img.primary)?.url
    || formData.images?.[0]?.url
    || '/images/product-placeholder.svg';

  // Load the attribute schema for whichever category is selected, so the form can
  // render the right fields (e.g. Brand/RAM for Electronics vs. Size/Color for Clothing).
  useEffect(() => {
    if (!isOpen || !formData.categoryId) {
      setCategoryAttributes([]);
      return;
    }
    let cancelled = false;
    productService.getCategoryAttributes(formData.categoryId)
      .then((attrs) => { if (!cancelled) setCategoryAttributes(Array.isArray(attrs) ? attrs : []); })
      .catch(() => { if (!cancelled) setCategoryAttributes([]); });
    return () => { cancelled = true; };
  }, [isOpen, formData.categoryId]);

  // Seed attribute values from the product being edited once its schema is known.
  useEffect(() => {
    if (!isOpen || !categoryAttributes.length) return;
    const existing = productToEdit?.attributes || [];
    if (!existing.length) return;
    setAttributeValues((prev) => {
      const next = { ...prev };
      existing.forEach((value) => {
        const field = ATTRIBUTE_VALUE_FIELD[value.type];
        if (field && next[value.attributeId] === undefined) {
          next[value.attributeId] = value[field];
        }
      });
      return next;
    });
  }, [isOpen, categoryAttributes, productToEdit]);

  const updateAttributeValue = (attributeId, value) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const buildAttributePayload = () => categoryAttributes
    .filter((attr) => {
      const value = attributeValues[attr.id];
      return value !== undefined && value !== null && value !== '';
    })
    .map((attr) => {
      const entry = { attributeId: attr.id };
      const field = ATTRIBUTE_VALUE_FIELD[attr.type] || 'valueText';
      const raw = attributeValues[attr.id];
      if (field === 'valueNumber') entry.valueNumber = Number(raw);
      else if (field === 'valueBoolean') entry.valueBoolean = !!raw;
      else if (field === 'optionId') entry.optionId = raw;
      else entry.valueText = raw;
      return entry;
    });

  useEffect(() => {
    if (!isOpen) return;
    if (productToEdit) {
      const load = async () => {
        const mappedVariants = await Promise.all((productToEdit.variants || []).map(async (v) => {
          const opts = parseVariantOptions(v);
          let stockQty = '';
          if (v.id) {
            try {
              const snap = await inventoryService.getSnapshot(v.id);
              stockQty = String(snap?.availableQty ?? snap?.available ?? 0);
            } catch {
              stockQty = '0';
            }
          }
          return {
            id: v.id,
            name: v.name || '',
            sku: v.sku || '',
            // Existing variants keep their stored SKU; only regenerate if it's blank.
            skuTouched: !!(v.sku || '').trim(),
            price: v.price || '',
            compareAtPrice: v.compareAtPrice || '',
            size: opts.size || '',
            color: opts.color || '',
            position: v.position || 0,
            active: v.active !== false,
            stockQty,
          };
        }));
        // productToEdit.images (from the product-detail response) has already been
        // flattened to bare URL strings for storefront consumption — reload the raw
        // image list (with id/primary/position) here so cover/reorder controls work.
        const rawImages = productToEdit.id
          ? await productService.getImages(productToEdit.id).catch(() => [])
          : [];
        setFormData({
          name: productToEdit.name || '',
          slug: productToEdit.slug || '',
          description: productToEdit.description || '',
          categoryId: productToEdit.categoryId || '',
          sku: productToEdit.sku || '',
          price: productToEdit.price || productToEdit.basePrice || '',
          compareAtPrice: productToEdit.compareAtPrice || '',
          featured: productToEdit.featured || false,
          currency: productToEdit.currency || 'LKR',
          variants: mappedVariants.length ? mappedVariants : [emptyVariant()],
          images: rawImages.length ? rawImages : (productToEdit.images || []).map((url) => ({ url })),
          socialEnabled: false,
          socialDescription: '',
          socialPlatforms: [],
        });
      };
      load();
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        sku: '',
        price: '',
        compareAtPrice: '',
        featured: false,
        currency: 'LKR',
        variants: [emptyVariant()],
        images: [],
        socialEnabled: false,
        socialDescription: '',
        socialPlatforms: [],
      });
      setAttributeValues({});
      setPendingImages((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        return [];
      });
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Keep auto-generated variant SKUs in sync with the product SKU.
      if (name === 'sku') {
        next.variants = (prev.variants || []).map((v) =>
          v.skuTouched ? v : { ...v, sku: autoVariantSku(value, v.size, v.color) },
        );
      }
      return next;
    });
  };

  const updateVariant = (index, field, value) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      const row = { ...variants[index], [field]: value };

      // Typing in the SKU field means the seller owns it now — stop auto-filling.
      // Clearing it hands control back so it regenerates from size/color again.
      if (field === 'sku') {
        row.skuTouched = value.trim() !== '';
      }

      if (field === 'size' || field === 'color') {
        const size = field === 'size' ? value : row.size;
        const color = field === 'color' ? value : row.color;
        row.name = [size, color].filter(Boolean).join(' / ') || row.name;
        if (!row.skuTouched) {
          row.sku = autoVariantSku(prev.sku, size, color);
        }
      }

      variants[index] = row;
      return { ...prev, variants };
    });
  };

  const setCoverImage = async (imageId) => {
    if (!productToEdit?.id || !imageId) return;
    try {
      await productService.setPrimaryImage(productToEdit.id, imageId);
      setFormData((prev) => ({
        ...prev,
        images: (prev.images || []).map((img) => ({ ...img, primary: img.id === imageId })),
      }));
    } catch (err) {
      console.error(err);
      alert('Could not set cover image');
    }
  };

  const moveImage = async (index, direction) => {
    const targetIndex = index + direction;
    const images = formData.images || [];
    if (targetIndex < 0 || targetIndex >= images.length || !productToEdit?.id) return;
    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setFormData((prev) => ({ ...prev, images: reordered }));
    setReordering(true);
    try {
      await productService.reorderImages(productToEdit.id, reordered.map((img) => img.id).filter(Boolean));
    } catch (err) {
      console.error(err);
      alert('Could not save the new image order');
    } finally {
      setReordering(false);
    }
  };

  const removeImage = async (image) => {
    if (!productToEdit?.id || !image.id) return;
    if (!window.confirm('Delete this image?')) return;
    try {
      await productService.deleteImage(productToEdit.id, image.id);
      setFormData((prev) => ({ ...prev, images: (prev.images || []).filter((img) => img.id !== image.id) }));
    } catch (err) {
      console.error(err);
      alert('Could not delete image');
    }
  };

  // Before the product exists (create flow), just hold the picked files locally with a
  // preview — they're uploaded to the real product once handleSubmit creates it.
  const handlePendingImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };

  const movePendingImage = (index, direction) => {
    setPendingImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removePendingImage = (index) => {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !productToEdit?.id) {
      alert('Save the product first, then upload images while editing.');
      return;
    }
    setUploading(true);
    try {
      const img = await productService.uploadImage(productToEdit.id, file);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), typeof img === 'string' ? { url: img } : img],
      }));
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = formData.slug
      || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const variants = (formData.variants || [])
      .map((v, i) => {
        const size = (v.size || '').trim();
        const color = (v.color || '').trim();
        const name = (v.name || [size, color].filter(Boolean).join(' / ')).trim();
        const sku = (v.sku || autoVariantSku(formData.sku, size, color)).trim();
        if (!size && !color && !name) return null;
        if (!sku) return null;
        return {
          id: v.id,
          name: name || sku,
          sku,
          price: parseFloat(v.price || formData.price) || 0,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
          currency: formData.currency || 'LKR',
          optionValues: JSON.stringify({
            ...(size ? { size } : {}),
            ...(color ? { color } : {}),
          }),
          position: i,
          active: v.active !== false,
          size,
          color,
          stockQty: v.stockQty === '' || v.stockQty == null ? undefined : Number(v.stockQty),
        };
      })
      .filter(Boolean);

    const payload = {
      name: formData.name,
      slug,
      description: formData.description,
      categoryId: formData.categoryId,
      price: parseFloat(formData.price) || 0,
      featured: !!formData.featured,
      currency: formData.currency || 'LKR',
      variants,
      attributes: buildAttributePayload(),
    };

    if (formData.sku && formData.sku.trim()) {
      payload.sku = formData.sku.trim();
    }

    if (formData.compareAtPrice) {
      payload.compareAtPrice = parseFloat(formData.compareAtPrice);
    }

    // Social publishing is only honoured on create (the backend ignores it on update).
    if (!productToEdit && formData.socialEnabled && formData.socialPlatforms.length) {
      payload.socialPublishing = {
        enabled: true,
        description: (formData.socialDescription || '').trim(),
        platforms: formData.socialPlatforms,
      };
    }

    // Not sent to the API directly — the parent whitelists JSON fields before posting.
    // It uploads these to the new product right after creation.
    if (!productToEdit && pendingImages.length) {
      payload.pendingImageFiles = pendingImages.map((p) => p.file);
    }

    onSave(payload);
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>Name *</label>
            <input required style={inputStyle} name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div style={formGroupStyle}>
            <label>Slug</label>
            <input style={inputStyle} name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated if empty" />
          </div>
          <div style={formGroupStyle}>
            <label>SKU</label>
            <input
              style={inputStyle}
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder={productToEdit ? '' : 'Leave blank to auto-generate from category'}
              disabled={!!productToEdit}
            />
            {!productToEdit && (
              <p style={{ fontSize: 12, color: '#666', margin: '6px 0 0' }}>
                Optional — the server generates a unique SKU from the category if you leave this blank.
              </p>
            )}
          </div>
          <div style={formGroupStyle}>
            <label>Category *</label>
            {categories.length === 0 ? (
              <p style={{ color: '#c62828', fontSize: 13, margin: '8px 0' }}>
                No categories yet. Create clothing categories under Admin → Categories first.
              </p>
            ) : (
              <Select
                required
                fullWidth
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                placeholder="Select category"
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map((cat) => {
                    const parent = categories.find((p) => p.id === cat.parentId);
                    const label = parent ? `${parent.name} › ${cat.name}` : cat.name;
                    return { value: cat.id, label };
                  }),
                ]}
              />
            )}
          </div>

          {categoryAttributes.length > 0 && (
            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, marginBottom: 15 }}>
              <h4 style={{ marginBottom: 8, fontSize: 14 }}>Category Details</h4>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                These fields come from the selected category and show up as the spec sheet on the product page.
              </p>
              {categoryAttributes
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((attr) => (
                  <div key={attr.id} style={formGroupStyle}>
                    <label>{attr.label}{attr.required ? ' *' : ''}</label>
                    {attr.type === 'BOOLEAN' ? (
                      <input
                        type="checkbox"
                        checked={!!attributeValues[attr.id]}
                        onChange={(e) => updateAttributeValue(attr.id, e.target.checked)}
                        style={{ marginLeft: 8 }}
                      />
                    ) : attr.type === 'NUMBER' ? (
                      <input
                        type="number"
                        style={inputStyle}
                        value={attributeValues[attr.id] ?? ''}
                        required={attr.required}
                        onChange={(e) => updateAttributeValue(attr.id, e.target.value)}
                      />
                    ) : attr.type === 'SELECT' ? (
                      <Select
                        fullWidth
                        value={attributeValues[attr.id] || ''}
                        onChange={(v) => updateAttributeValue(attr.id, v)}
                        placeholder={`Select ${attr.label}`}
                        options={[
                          { value: '', label: `Select ${attr.label}` },
                          ...(attr.options || []).map((opt) => ({ value: opt.id, label: opt.label })),
                        ]}
                      />
                    ) : (
                      <input
                        style={inputStyle}
                        value={attributeValues[attr.id] ?? ''}
                        required={attr.required}
                        placeholder={attr.type === 'MULTI_SELECT' ? 'Comma-separated values' : ''}
                        onChange={(e) => updateAttributeValue(attr.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
          <div style={formGroupStyle}>
            <label>Description</label>
            <textarea style={inputStyle} name="description" value={formData.description || ''} onChange={handleChange} rows="3" />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label>Price *</label>
              <input required style={inputStyle} type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Compare at Price</label>
              <input style={inputStyle} type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice || ''} onChange={handleChange} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Featured
          </label>

          {!productToEdit && (
            <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '12px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="socialEnabled"
                  checked={formData.socialEnabled}
                  onChange={handleChange}
                />
                Publish to social media when this product goes live
              </label>
              {formData.socialEnabled && (
                <>
                  {connectedPlatforms.length === 0 ? (
                    <p style={{ fontSize: 12, color: '#c62828', margin: '8px 0' }}>
                      No social accounts connected yet. Connect Facebook (Instagram connects
                      automatically if the Page has one linked) under Admin &rarr; Social.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', gap: 15, margin: '8px 0' }}>
                      {['FACEBOOK', 'INSTAGRAM'].filter((p) => connectedPlatforms.includes(p)).map((platform) => (
                        <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                          <input
                            type="checkbox"
                            checked={formData.socialPlatforms.includes(platform)}
                            onChange={() => togglePlatform(platform)}
                          />
                          {platform === 'FACEBOOK' ? 'Facebook' : 'Instagram'}
                        </label>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: '#666', margin: '8px 0' }}>
                    Posts to every connected account for the platforms you select, the moment
                    you click &ldquo;Publish&rdquo; on this product.
                  </p>
                  <textarea
                    style={inputStyle}
                    name="socialDescription"
                    value={formData.socialDescription}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Optional caption (leave blank to auto-generate from the product)"
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ marginTop: 8 }}
                    onClick={() => setShowSocialPreview((v) => !v)}
                  >
                    {showSocialPreview ? 'Hide Preview' : 'Preview Post'}
                  </button>

                  {showSocialPreview && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                      {(formData.socialPlatforms.length ? formData.socialPlatforms : ['FACEBOOK']).map((platform) => (
                        <div key={platform} style={{ width: 260, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
                          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #eee' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: platform === 'FACEBOOK' ? '#1877f2' : '#e1306c' }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 'bold' }}>Your Store</div>
                              <div style={{ fontSize: 10, color: '#999' }}>{platform === 'FACEBOOK' ? 'Facebook Page' : 'Instagram'} · Just now</div>
                            </div>
                          </div>
                          <img
                            src={socialPreviewImage}
                            alt=""
                            style={{ width: '100%', height: 180, objectFit: 'cover', background: '#f2f2f2' }}
                            onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                          />
                          <div style={{ padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', color: '#333' }}>
                            {buildSocialPreviewMessage()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <h4 style={{ marginBottom: '6px' }}>Variants (Size / Color / Stock)</h4>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
            Each size/color combination becomes a selectable option on the product page.
            Set stock quantity per variant — orders reduce stock automatically.
          </p>
          {formData.variants.map((v, index) => (
            <div key={index} style={{ border: '1px solid #eee', padding: '12px', marginBottom: '10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={inputStyle} placeholder="Size (e.g. M, L, XL)" value={v.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} />
                <input style={inputStyle} placeholder="Color (e.g. Navy, Black)" value={v.color} onChange={(e) => updateVariant(index, 'color', e.target.value)} />
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  placeholder="Stock qty"
                  value={v.stockQty}
                  onChange={(e) => updateVariant(index, 'stockQty', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input style={inputStyle} placeholder="Variant name" value={v.name} onChange={(e) => updateVariant(index, 'name', e.target.value)} />
                <input style={inputStyle} placeholder="Variant SKU" value={v.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)} />
                <input style={inputStyle} type="number" step="0.01" placeholder="Price" value={v.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} />
              </div>
              <button type="button" onClick={() => setFormData((prev) => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index),
              }))}>Remove</button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginBottom: '20px' }}
            onClick={() => setFormData((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))}
          >
            Add Variant
          </button>

          {!productToEdit?.id && (
            <div style={formGroupStyle}>
              <label>Images</label>
              <p style={{ fontSize: 12, color: '#666', margin: '4px 0 8px' }}>
                Picked images upload right after the product is saved. The first one becomes
                the cover image shown on product cards.
              </p>
              <input type="file" accept="image/*" multiple onChange={handlePendingImageSelect} />
              {pendingImages.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {pendingImages.map((img, i) => (
                    <div key={img.previewUrl} style={{ textAlign: 'center', width: 80 }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={img.previewUrl}
                          alt=""
                          style={{
                            width: 80, height: 80, objectFit: 'cover', borderRadius: 4,
                            border: i === 0 ? '3px solid #27ae60' : '1px solid #ddd',
                          }}
                        />
                        {i === 0 && (
                          <span style={{
                            position: 'absolute', top: 2, left: 2, background: '#27ae60', color: 'white',
                            fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          }}>
                            COVER
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                        <button type="button" title="Move left" disabled={i === 0} onClick={() => movePendingImage(i, -1)} style={{ padding: '2px 6px' }}>←</button>
                        <button type="button" title="Move right" disabled={i === pendingImages.length - 1} onClick={() => movePendingImage(i, 1)} style={{ padding: '2px 6px' }}>→</button>
                      </div>
                      <button type="button" onClick={() => removePendingImage(i)} style={{ fontSize: 11, marginTop: 2, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', display: 'block', width: '100%' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {productToEdit?.id && (
            <div style={formGroupStyle}>
              <label>Images</label>
              <p style={{ fontSize: 12, color: '#666', margin: '4px 0 8px' }}>
                The cover image is what shows on product cards and opens by default on the product page.
                Use the arrows to reorder the rest.
              </p>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p>Uploading...</p>}
              {reordering && <p>Saving order...</p>}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {(formData.images || []).map((img, i) => (
                  <div key={img.id || i} style={{ textAlign: 'center', width: 80 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={img.url}
                        alt=""
                        style={{
                          width: 80, height: 80, objectFit: 'cover', borderRadius: 4,
                          border: img.primary ? '3px solid #27ae60' : '1px solid #ddd',
                        }}
                      />
                      {img.primary && (
                        <span style={{
                          position: 'absolute', top: 2, left: 2, background: '#27ae60', color: 'white',
                          fontSize: 9, padding: '1px 5px', borderRadius: 3,
                        }}>
                          COVER
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                      <button type="button" title="Move left" disabled={i === 0} onClick={() => moveImage(i, -1)} style={{ padding: '2px 6px' }}>←</button>
                      <button type="button" title="Move right" disabled={i === (formData.images.length - 1)} onClick={() => moveImage(i, 1)} style={{ padding: '2px 6px' }}>→</button>
                    </div>
                    {!img.primary && (
                      <button type="button" onClick={() => setCoverImage(img.id)} style={{ fontSize: 11, marginTop: 2, color: '#3498db', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Set as cover
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(img)} style={{ fontSize: 11, marginTop: 2, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', display: 'block', width: '100%' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
