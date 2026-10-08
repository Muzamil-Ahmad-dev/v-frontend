import { api } from './client.js';

// Purchase Staff Operations

export const purchaseApi = {
  // ── Purchase Dashboard ──────────────────────────────────
  getPurchaseDashboard: () => api.get('/purchase/dashboard'),

  // ── Phones ──────────────────────────────────────────────
  getPurchasePhones: (params = {}) => api.get('/purchase/phones', { params }),
  getPurchasePhoneById: (id) => api.get(`/purchase/phones/${id}`),
  createPurchasePhone: (body) => api.post('/purchase/phones', body),
  updatePurchasePhone: (id, body) => api.patch(`/purchase/phones/${id}`, body),
  deletePurchasePhone: (id) => api.delete(`/purchase/phones/${id}`),

  // ── Accessories ─────────────────────────────────────────
  getPurchaseAccessories: (params = {}) => api.get('/purchase/accessories', { params }),
  getPurchaseAccessoryById: (id) => api.get(`/purchase/accessories/${id}`),
  createPurchaseAccessory: (body) => api.post('/purchase/accessories', body),
  updatePurchaseAccessory: (id, body) => api.patch(`/purchase/accessories/${id}`, body),
  deletePurchaseAccessory: (id) => api.delete(`/purchase/accessories/${id}`),

  // ── Stock/Inventory ────────────────────────────────────
  getPurchaseStock: (params = {}) => api.get('/purchase/stock', { params }),
  getPurchaseStockById: (id) => api.get(`/purchase/stock/${id}`),
  updatePurchaseStock: (id, body) => api.patch(`/purchase/stock/${id}`, body),

  // ── Bulk Purchase ───────────────────────────────────────
  getBulkPurchases: (params = {}) => api.get('/purchase/bulk', { params }),
  getBulkPurchaseById: (id) => api.get(`/purchase/bulk/${id}`),
  createBulkPurchase: (body) => api.post('/purchase/bulk', body),
  updateBulkPurchase: (id, body) => api.patch(`/purchase/bulk/${id}`, body),
};
