import apiClient from './client';

// ============= BRANCH API =============
export const branchAPI = {
  // Get all branches
  getAll: (params = {}) => 
    apiClient.get('/admin/branches', { params }),

  // Create branch
  create: (data) => 
    apiClient.post('/admin/branches', data),

  // Get single branch
  getById: (id) => 
    apiClient.get(`/admin/branches/${id}`),

  // Update branch
  update: (id, data) => 
    apiClient.patch(`/admin/branches/${id}`, data),

  // Delete branch
  delete: (id) => 
    apiClient.delete(`/admin/branches/${id}`),

  // Get branch staff
  getStaff: (branchId, params = {}) => 
    apiClient.get(`/admin/branches/${branchId}/staff`, { params }),

  // Add staff to branch
  addStaff: (branchId, data) => 
    apiClient.post(`/admin/branches/${branchId}/staff`, data),

  // Get branch inventory
  getInventory: (branchId, params = {}) => 
    apiClient.get(`/admin/branches/${branchId}/inventory`, { params }),

  // Get branch sales
  getSales: (branchId, params = {}) => 
    apiClient.get(`/admin/branches/${branchId}/sales`, { params }),

  // Get branch performance
  getPerformance: (branchId, params = {}) => 
    apiClient.get(`/admin/branches/${branchId}/performance`, { params }),

  // Get branch ledger
  getLedger: (branchId, params = {}) => 
    apiClient.get(`/admin/branches/${branchId}/ledger`, { params }),
};

// ============= COMPANY API =============
export const companyAPI = {
  // Get all companies
  getAll: (params = {}) => 
    apiClient.get('/admin/companies', { params }),

  // Create company
  create: (data) => 
    apiClient.post('/admin/companies', data),

  // Get single company
  getById: (id) => 
    apiClient.get(`/admin/companies/${id}`),

  // Update company
  update: (id, data) => 
    apiClient.patch(`/admin/companies/${id}`, data),

  // Delete company
  delete: (id) => 
    apiClient.delete(`/admin/companies/${id}`),

  // Get company branches
  getBranches: (companyId, params = {}) => 
    apiClient.get(`/admin/companies/${companyId}/branches`, { params }),

  // Get company settings
  getSettings: (companyId) => 
    apiClient.get(`/admin/companies/${companyId}/settings`),

  // Update company settings
  updateSettings: (companyId, data) => 
    apiClient.patch(`/admin/companies/${companyId}/settings`, data),

  // Get company dashboard
  getDashboard: (companyId) => 
    apiClient.get(`/admin/companies/${companyId}/dashboard`),

  // Get company analytics
  getAnalytics: (companyId, params = {}) => 
    apiClient.get(`/admin/companies/${companyId}/analytics`, { params }),
};

// ============= PHONE MODEL API =============
export const phoneModelAPI = {
  // Get all phone models
  getAll: (params = {}) => 
    apiClient.get('/admin/catalog/models', { params }),

  // Create phone model
  create: (data) => 
    apiClient.post('/admin/catalog/models', data),

  // Get single phone model
  getById: (id) => 
    apiClient.get(`/admin/catalog/models/${id}`),

  // Update phone model
  update: (id, data) => 
    apiClient.patch(`/admin/catalog/models/${id}`, data),

  // Delete phone model
  delete: (id) => 
    apiClient.delete(`/admin/catalog/models/${id}`),

  // Get model by brand
  getByBrand: (brand, params = {}) => 
    apiClient.get(`/admin/catalog/models/brand/${brand}`, { params }),

  // Get all brands
  getBrands: () => 
    apiClient.get('/admin/catalog/brands'),
};

export default {
  branchAPI,
  companyAPI,
  phoneModelAPI,
};
