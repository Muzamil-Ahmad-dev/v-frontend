import { api } from './client.js';

// Sale Staff Operations

export const saleApi = {
  // ── Sale Invoices ───────────────────────────────────────
  getSaleInvoices: (params = {}) => api.get('/sale/invoice', { params }),
  getSaleInvoiceById: (id) => api.get(`/sale/invoice/${id}`),
  createSaleInvoice: (body) => api.post('/sale/invoice', body),
  updateSaleInvoice: (id, body) => api.patch(`/sale/invoice/${id}`, body),
  deleteSaleInvoice: (id) => api.delete(`/sale/invoice/${id}`),

  // ── Sale Dashboard Stats ────────────────────────────────
  getSaleDashboard: () => api.get('/sale/dashboard'),
};
