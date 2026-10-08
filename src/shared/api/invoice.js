import apiClient from './client';

// ============= INVOICE API =============
export const invoiceAPI = {
  // Get all invoices
  getAll: (params = {}) => 
    apiClient.get('/admin/sales/invoice', { params }),

  // Create invoice
  create: (data) => 
    apiClient.post('/admin/sales/invoice', data),

  // Get single invoice
  getById: (id) => 
    apiClient.get(`/admin/sales/invoice/${id}`),

  // Update invoice
  update: (id, data) => 
    apiClient.patch(`/admin/sales/invoice/${id}`, data),

  // Delete invoice
  delete: (id) => 
    apiClient.delete(`/admin/sales/invoice/${id}`),

  // Get invoices by status
  getByStatus: (status, params = {}) => 
    apiClient.get(`/admin/sales/invoice/status/${status}`, { params }),

  // Get invoices by date range
  getByDateRange: (startDate, endDate) => 
    apiClient.get('/admin/sales/invoice/date-range', { 
      params: { startDate, endDate } 
    }),

  // Download invoice PDF
  downloadPdf: (id) => 
    apiClient.get(`/admin/sales/invoice/${id}/pdf`, {
      responseType: 'blob'
    }),

  // Send invoice to customer
  send: (id, email) => 
    apiClient.post(`/admin/sales/invoice/${id}/send`, { email }),

  // Mark invoice as paid
  markAsPaid: (id, data = {}) => 
    apiClient.patch(`/admin/sales/invoice/${id}/mark-paid`, data),

  // Mark invoice as cancelled
  markAsCancelled: (id, data = {}) => 
    apiClient.patch(`/admin/sales/invoice/${id}/cancel`, data),

  // Get invoice items
  getItems: (id) => 
    apiClient.get(`/admin/sales/invoice/${id}/items`),

  // Get invoice summary
  getSummary: () => 
    apiClient.get('/admin/sales/invoice/summary'),

  // Export invoices
  export: (format = 'csv') => 
    apiClient.get(`/admin/sales/invoice/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// ============= SALE INVOICE API =============
export const saleInvoiceAPI = {
  // Get all sale invoices
  getAll: (params = {}) => 
    apiClient.get('/admin/sales/saleInvoice', { params }),

  // Create sale invoice
  create: (data) => 
    apiClient.post('/admin/sales/saleInvoice', data),

  // Get single sale invoice
  getById: (id) => 
    apiClient.get(`/admin/sales/saleInvoice/${id}`),

  // Update sale invoice
  update: (id, data) => 
    apiClient.patch(`/admin/sales/saleInvoice/${id}`, data),

  // Delete sale invoice
  delete: (id) => 
    apiClient.delete(`/admin/sales/saleInvoice/${id}`),

  // Get sale invoices by customer
  getByCustomer: (customerId, params = {}) => 
    apiClient.get(`/admin/sales/saleInvoice/customer/${customerId}`, { params }),

  // Download sale invoice PDF
  downloadPdf: (id) => 
    apiClient.get(`/admin/sales/saleInvoice/${id}/pdf`, {
      responseType: 'blob'
    }),

  // Add sale items
  addItems: (id, items) => 
    apiClient.post(`/admin/sales/saleInvoice/${id}/items`, { items }),

  // Remove sale item
  removeItem: (invoiceId, itemId) => 
    apiClient.delete(`/admin/sales/saleInvoice/${invoiceId}/items/${itemId}`),

  // Get sale summary
  getSummary: () => 
    apiClient.get('/admin/sales/saleInvoice/summary'),

  // Mark as complete
  markComplete: (id) => 
    apiClient.patch(`/admin/sales/saleInvoice/${id}/complete`),

  // Get payment details
  getPayment: (id) => 
    apiClient.get(`/admin/sales/saleInvoice/${id}/payment`),

  // Add payment
  addPayment: (id, data) => 
    apiClient.post(`/admin/sales/saleInvoice/${id}/payment`, data),
};

// ============= PARTY LEDGER API =============
export const partyLedgerAPI = {
  // Get all party ledger records
  getAll: (params = {}) => 
    apiClient.get('/partyLedger', { params }),

  // Create party ledger record
  create: (data) => 
    apiClient.post('/partyLedger', data),

  // Get single party ledger
  getById: (id) => 
    apiClient.get(`/partyLedger/${id}`),

  // Update party ledger
  update: (id, data) => 
    apiClient.patch(`/partyLedger/${id}`, data),

  // Delete party ledger
  delete: (id) => 
    apiClient.delete(`/partyLedger/${id}`),

  // Get party balance
  getBalance: (partyId) => 
    apiClient.get(`/partyLedger/party/${partyId}/balance`),

  // Get party transactions
  getTransactions: (partyId, params = {}) => 
    apiClient.get(`/partyLedger/party/${partyId}/transactions`, { params }),

  // Get party summary
  getSummary: () => 
    apiClient.get('/partyLedger/summary'),

  // Get payables and receivables
  getPayablesReceivables: (params = {}) => 
    apiClient.get('/partyLedger/payables-receivables', { params }),

  // Export party ledger
  export: (format = 'csv') => 
    apiClient.get(`/partyLedger/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

export default {
  invoiceAPI,
  saleInvoiceAPI,
  partyLedgerAPI,
};
