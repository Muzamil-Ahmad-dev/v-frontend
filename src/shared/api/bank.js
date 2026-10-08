import apiClient from './client';

// ============= BANK API =============
export const bankAPI = {
  // Get all bank accounts
  getAll: (params = {}) => 
    apiClient.get('/banks', { params }),

  // Create bank account
  create: (data) => 
    apiClient.post('/banks', data),

  // Get single bank account
  getById: (id) => 
    apiClient.get(`/banks/${id}`),

  // Update bank account
  update: (id, data) => 
    apiClient.patch(`/banks/${id}`, data),

  // Delete bank account
  delete: (id) => 
    apiClient.delete(`/banks/${id}`),

  // Get bank transactions
  getTransactions: (bankId, params = {}) => 
    apiClient.get(`/banks/${bankId}/transactions`, { params }),

  // Add bank transaction
  addTransaction: (bankId, data) => 
    apiClient.post(`/banks/${bankId}/transactions`, data),

  // Get bank balance
  getBalance: (bankId) => 
    apiClient.get(`/banks/${bankId}/balance`),

  // Reconcile bank account
  reconcile: (bankId, data) => 
    apiClient.post(`/banks/${bankId}/reconcile`, data),

  // Get bank statements
  getStatements: (bankId, params = {}) => 
    apiClient.get(`/banks/${bankId}/statements`, { params }),

  // Export bank transactions
  export: (bankId, format = 'csv') => 
    apiClient.get(`/banks/${bankId}/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// ============= POCKET CASH API =============
export const pocketCashAPI = {
  // Get all pocket cash records
  getAll: (params = {}) => 
    apiClient.get('/pocketCash', { params }),

  // Create pocket cash record
  create: (data) => 
    apiClient.post('/pocketCash', data),

  // Get single pocket cash record
  getById: (id) => 
    apiClient.get(`/pocketCash/${id}`),

  // Update pocket cash record
  update: (id, data) => 
    apiClient.patch(`/pocketCash/${id}`, data),

  // Delete pocket cash record
  delete: (id) => 
    apiClient.delete(`/pocketCash/${id}`),

  // Get pocket cash balance
  getBalance: () => 
    apiClient.get('/pocketCash/balance'),

  // Get pocket cash transactions
  getTransactions: (params = {}) => 
    apiClient.get('/pocketCash/transactions', { params }),

  // Add pocket cash transaction
  addTransaction: (data) => 
    apiClient.post('/pocketCash/transactions', data),

  // Reconcile pocket cash
  reconcile: (data) => 
    apiClient.post('/pocketCash/reconcile', data),

  // Export pocket cash records
  export: (format = 'csv') => 
    apiClient.get(`/pocketCash/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

export default {
  bankAPI,
  pocketCashAPI,
};
