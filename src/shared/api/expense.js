import apiClient from './client';

// ============= EXPENSE API =============
export const expenseAPI = {
  // Get all expenses
  getAll: (params = {}) => 
    apiClient.get('/expense', { params }),

  // Create expense
  create: (data) => 
    apiClient.post('/expense', data),

  // Get single expense
  getById: (id) => 
    apiClient.get(`/expense/${id}`),

  // Update expense
  update: (id, data) => 
    apiClient.patch(`/expense/${id}`, data),

  // Delete expense
  delete: (id) => 
    apiClient.delete(`/expense/${id}`),

  // Get expenses by category
  getByCategory: (category, params = {}) => 
    apiClient.get(`/expense/category/${category}`, { params }),

  // Get expense categories
  getCategories: () => 
    apiClient.get('/expense/categories'),

  // Get expenses by date range
  getByDateRange: (startDate, endDate) => 
    apiClient.get('/expense/date-range', { 
      params: { startDate, endDate } 
    }),

  // Get expense summary
  getSummary: (params = {}) => 
    apiClient.get('/expense/summary', { params }),

  // Approve expense
  approve: (id, data = {}) => 
    apiClient.patch(`/expense/${id}/approve`, data),

  // Reject expense
  reject: (id, data = {}) => 
    apiClient.patch(`/expense/${id}/reject`, data),

  // Export expenses
  export: (format = 'csv') => 
    apiClient.get(`/expense/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// ============= COMMITTEE LEDGER API =============
export const committeeLedgerAPI = {
  // Get all committee records
  getAll: (params = {}) => 
    apiClient.get('/committee', { params }),

  // Create committee record
  create: (data) => 
    apiClient.post('/committee', data),

  // Get single committee record
  getById: (id) => 
    apiClient.get(`/committee/${id}`),

  // Update committee record
  update: (id, data) => 
    apiClient.patch(`/committee/${id}`, data),

  // Delete committee record
  delete: (id) => 
    apiClient.delete(`/committee/${id}`),

  // Get committee balance
  getBalance: () => 
    apiClient.get('/committee/balance'),

  // Get committee transactions
  getTransactions: (params = {}) => 
    apiClient.get('/committee/transactions', { params }),

  // Add committee transaction
  addTransaction: (data) => 
    apiClient.post('/committee/transactions', data),

  // Get committee members
  getMembers: (params = {}) => 
    apiClient.get('/committee/members', { params }),

  // Add committee member
  addMember: (data) => 
    apiClient.post('/committee/members', data),

  // Remove committee member
  removeMember: (memberId) => 
    apiClient.delete(`/committee/members/${memberId}`),

  // Get committee summary
  getSummary: (params = {}) => 
    apiClient.get('/committee/summary', { params }),

  // Export committee records
  export: (format = 'csv') => 
    apiClient.get(`/committee/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

export default {
  expenseAPI,
  committeeLedgerAPI,
};
