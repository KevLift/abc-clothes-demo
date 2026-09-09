import api, { unwrap, unwrapPage } from './api';

export const inventoryService = {
  getAvailability: async (variantId) => {
    const response = await api.get(`/inventory/availability/${variantId}`);
    return unwrap(response.data) || response.data;
  },

  getBulkAvailability: async (variantIds) => {
    const response = await api.post('/inventory/availability/bulk', { variantIds });
    const data = unwrap(response.data) || response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  getSnapshot: async (variantId) => {
    const response = await api.get(`/inventory/admin/snapshot/${variantId}`);
    return unwrap(response.data) || response.data;
  },

  adjustStock: async (data) => {
    const response = await api.post('/inventory/admin/adjust', data);
    return unwrap(response.data) || response.data;
  },

  getLowStock: async (params = {}) => {
    const response = await api.get('/inventory/admin/low-stock', { params });
    return unwrapPage(response.data);
  },

  /** Every variant with its current stock, optionally filtered by product name/SKU. */
  getAllInventory: async (params = {}) => {
    const response = await api.get('/inventory/admin/all', { params });
    return unwrapPage(response.data);
  },

  // ── Checkout stock reservations (customer flow) ──────────────────────────
  /** Hold stock for a checkout attempt. referenceId = cartId or orderId. */
  reserve: async ({ variantId, referenceId, quantity, ttlMinutes }) => {
    const response = await api.post('/inventory/reservations/reserve', {
      variantId,
      referenceId,
      quantity,
      ...(ttlMinutes ? { ttlMinutes } : {}),
    });
    return unwrap(response.data) || response.data;
  },

  /** Return a held reservation to available stock (checkout abandoned / failed). */
  release: async ({ variantId, referenceId }) => {
    await api.post('/inventory/reservations/release', { variantId, referenceId });
  },

  /** Permanently deduct a reservation after successful payment. */
  confirm: async ({ variantId, referenceId }) => {
    await api.post('/inventory/reservations/confirm', { variantId, referenceId });
  },

  /** Set absolute available qty via replenish / write-down delta. */
  setAvailableQty: async (variantId, targetQty, reason = 'Admin set stock level') => {
    let current = 0;
    try {
      const snap = await inventoryService.getSnapshot(variantId);
      current = Number(snap?.availableQty ?? snap?.available ?? 0);
    } catch {
      current = 0;
    }
    const target = Math.max(0, Number(targetQty) || 0);
    const diff = target - current;
    if (diff === 0) return { availableQty: current };
    await inventoryService.adjustStock({
      variantId,
      adjustmentType: diff > 0 ? 'REPLENISH' : 'WRITE_DOWN',
      quantity: Math.abs(diff),
      reason,
    });
    return { availableQty: target };
  },
};
