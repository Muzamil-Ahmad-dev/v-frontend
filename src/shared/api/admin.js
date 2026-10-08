 import apiClient from './client.js';

// ============= ADMIN PROFILE API =============
export const adminApi = {
  getProfile: () => apiClient.get('/admin/profile'),
  updateProfile: (data) => apiClient.patch('/admin/profile', data),
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getStats: () => apiClient.get('/admin/stats'),
};

// ============= BRANCHES API =============
export const branchApi = {
  list: (params = {}) => apiClient.get('/admin/branches', { params }),
  get: (id) => apiClient.get(`/admin/branches/${id}`),
  create: (body) => apiClient.post('/admin/branches', body),
  update: (id, body) => apiClient.patch(`/admin/branches/${id}`, body),
  delete: (id) => apiClient.delete(`/admin/branches/${id}`),
  getStaff: (branchId) => apiClient.get(`/admin/branches/${branchId}/staff`),
  addStaff: (branchId, data) => apiClient.post(`/admin/branches/${branchId}/staff`, data),
  getPerformance: (branchId, params = {}) => apiClient.get(`/admin/branches/${branchId}/performance`, { params }),
};

// ============= BRANCH ADMINS API =============
export const branchAdminApi = {
  list: (params = {}) => apiClient.get('/admin/branch-admins', { params }),
  get: (id) => apiClient.get(`/admin/branch-admins/${id}`),
  create: (body) => apiClient.post('/admin/branch-admins', body),
  update: (id, body) => apiClient.patch(`/admin/branch-admins/${id}`, body),
  delete: (id) => apiClient.delete(`/admin/branch-admins/${id}`),
  toggleStatus: (id, action) => apiClient.patch(`/admin/branch-admins/${id}/status`, { action }),
};

// ============= COMPANY API =============
export const companyApi = {
  list: (params = {}) => apiClient.get('/admin/companies', { params }),
  get: (id) => apiClient.get(`/admin/companies/${id}`),
  create: (body) => apiClient.post('/admin/companies', body),
  update: (id, body) => apiClient.patch(`/admin/companies/${id}`, body),
  delete: (id) => apiClient.delete(`/admin/companies/${id}`),
  getSettings: (id) => apiClient.get(`/admin/companies/${id}/settings`),
  updateSettings: (id, data) => apiClient.patch(`/admin/companies/${id}/settings`, data),
};

// ============= SHOP OWNERS API =============
export const shopOwnerApi = {
  getDashboard: () => apiClient.get('/admin/shop-owners/dashboard'),
  list: (params = {}) => apiClient.get('/admin/shop-owners', { params }),
  get: (id) => apiClient.get(`/admin/shop-owners/${id}`),
  create: (body) => apiClient.post('/admin/shop-owners', body),
  update: (id, body) => apiClient.patch(`/admin/shop-owners/${id}`, body),
  delete: (id) => apiClient.delete(`/admin/shop-owners/${id}`),
  toggleStatus: (id, action) => apiClient.patch(`/admin/shop-owners/${id}/status`, { action }),
  getDashboard: (id) => apiClient.get(`/admin/shop-owners/${id}/dashboard`),
  getPerformance: (id, params = {}) => apiClient.get(`/admin/shop-owners/${id}/performance`, { params }),
};

// ============= REPAIR JOBS API =============
export const repairApi = {
  list: (params = {}) => apiClient.get('/admin/repair', { params }),
  get: (id) => apiClient.get(`/admin/repair/${id}`),
  create: (body) => apiClient.post('/admin/repair', body),
  update: (id, body) => apiClient.patch(`/admin/repair/${id}`, body),
  delete: (id) => apiClient.delete(`/admin/repair/${id}`),
  advance: (id) => apiClient.patch(`/admin/repair/${id}/advance`),
  revert: (id) => apiClient.patch(`/admin/repair/${id}/revert`),
  return: (id, note) => apiClient.patch(`/admin/repair/${id}/return`, { note }),
  getByStatus: (status) => apiClient.get(`/admin/repair/status/${status}`),
  getSummary: () => apiClient.get('/admin/repair/summary'),
};