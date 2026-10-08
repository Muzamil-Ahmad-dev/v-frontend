import apiClient from './client';

// ============= LEDGER API =============
export const ledgerAPI = {
  // Get all ledger records
  getAll: (params = {}) => 
    apiClient.get('/ledger', { params }),

  // Create ledger record
  create: (data) => 
    apiClient.post('/ledger', data),

  // Get single ledger record
  getById: (id) => 
    apiClient.get(`/ledger/${id}`),

  // Update ledger record
  update: (id, data) => 
    apiClient.patch(`/ledger/${id}`, data),

  // Delete ledger record
  delete: (id) => 
    apiClient.delete(`/ledger/${id}`),

  // Get ledger summary/stats
  getSummary: (params = {}) => 
    apiClient.get('/ledger/summary', { params }),

  // Get ledger by date range
  getByDateRange: (startDate, endDate) => 
    apiClient.get('/ledger/date-range', { 
      params: { startDate, endDate } 
    }),

  // Get ledger by party
  getByParty: (partyId) => 
    apiClient.get(`/ledger/party/${partyId}`),

  // Get ledger by shop
  getByShop: (shopId) => 
    apiClient.get(`/ledger/shop/${shopId}`),

  // Export ledger to CSV
  export: (format = 'csv') => 
    apiClient.get(`/ledger/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// ============= BALANCE SHEET API =============
export const balanceSheetAPI = {
  // Get balance sheet
  get: (params = {}) => 
    apiClient.get('/billing/finance/balance-sheet', { params }),

  // Get detailed balance sheet
  getDetailed: (params = {}) => 
    apiClient.get('/billing/finance/balance-sheet/detailed', { params }),

  // Generate balance sheet report
  generate: (data) => 
    apiClient.post('/billing/finance/balance-sheet/generate', data),

  // Export balance sheet
  export: (format = 'pdf') => 
    apiClient.get(`/billing/finance/balance-sheet/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// ============= DAY BOOK API =============
export const dayBookAPI = {
  // Get all day book entries
  getAll: (params = {}) => 
    apiClient.get('/billing/finance/day-book', { params }),

  // Create day book entry
  create: (data) => 
    apiClient.post('/billing/finance/day-book', data),

  // Get single day book entry
  getById: (id) => 
    apiClient.get(`/billing/finance/day-book/${id}`),

  // Update day book entry
  update: (id, data) => 
    apiClient.patch(`/billing/finance/day-book/${id}`, data),

  // Delete day book entry
  delete: (id) => 
    apiClient.delete(`/billing/finance/day-book/${id}`),

  // Get day book by date
  getByDate: (date) => 
    apiClient.get(`/billing/finance/day-book/date/${date}`),

  // Get day book summary
  getSummary: (params = {}) => 
    apiClient.get('/billing/finance/day-book/summary', { params }),
};

export default {
  ledgerAPI,
  balanceSheetAPI,
  dayBookAPI,
};
