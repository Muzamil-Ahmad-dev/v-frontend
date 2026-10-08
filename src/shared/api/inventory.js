import apiClient from './client';

// ============= PHONES API =============
export const phonesAPI = {
  // Get all phones
  getAll: (params = {}) => 
    apiClient.get('/admin/inventory/phones', { params }),

  // Create phone
  create: (data) => 
    apiClient.post('/admin/inventory/phones', data),

  // Get single phone
  getById: (id) => 
    apiClient.get(`/admin/inventory/phones/${id}`),

  // Update phone
  update: (id, data) => 
    apiClient.patch(`/admin/inventory/phones/${id}`, data),

  // Delete phone
  delete: (id) => 
    apiClient.delete(`/admin/inventory/phones/${id}`),

  // Get phones by stock
  getByStock: (minStock) => 
    apiClient.get('/admin/inventory/phones/stock', { 
      params: { minStock } 
    }),

  // Get low stock phones
  getLowStock: () => 
    apiClient.get('/admin/inventory/phones/low-stock'),

  // Get phone models
  getModels: (params = {}) => 
    apiClient.get('/admin/inventory/phones/models', { params }),
};

// ============= ACCESSORIES API =============
export const accessoriesAPI = {
  // Get all accessories
  getAll: (params = {}) => 
    apiClient.get('/admin/inventory/accessories', { params }),

  // Create accessory
  create: (data) => 
    apiClient.post('/admin/inventory/accessories', data),

  // Get single accessory
  getById: (id) => 
    apiClient.get(`/admin/inventory/accessories/${id}`),

  // Update accessory
  update: (id, data) => 
    apiClient.patch(`/admin/inventory/accessories/${id}`, data),

  // Delete accessory
  delete: (id) => 
    apiClient.delete(`/admin/inventory/accessories/${id}`),

  // Get accessories by stock
  getByStock: (minStock) => 
    apiClient.get('/admin/inventory/accessories/stock', { 
      params: { minStock } 
    }),

  // Get low stock accessories
  getLowStock: () => 
    apiClient.get('/admin/inventory/accessories/low-stock'),
};

// ============= STOCK API =============
export const stockAPI = {
  // Get all stock
  getAll: (params = {}) => 
    apiClient.get('/admin/inventory/stock', { params }),

  // Create stock entry
  create: (data) => 
    apiClient.post('/admin/inventory/stock', data),

  // Get single stock entry
  getById: (id) => 
    apiClient.get(`/admin/inventory/stock/${id}`),

  // Update stock
  update: (id, data) => 
    apiClient.patch(`/admin/inventory/stock/${id}`, data),

  // Delete stock entry
  delete: (id) => 
    apiClient.delete(`/admin/inventory/stock/${id}`),

  // Adjust stock
  adjust: (id, data) => 
    apiClient.post(`/admin/inventory/stock/${id}/adjust`, data),

  // Get stock movement
  getMovement: (params = {}) => 
    apiClient.get('/admin/inventory/stock/movement', { params }),

  // Get stock summary
  getSummary: () => 
    apiClient.get('/admin/inventory/stock/summary'),

  // Get stock valuation
  getValuation: () => 
    apiClient.get('/admin/inventory/stock/valuation'),
};

// ============= DISPATCH API =============
export const dispatchAPI = {
  // Get all dispatches
  getAll: (params = {}) => 
    apiClient.get('/admin/inventory/dispatch', { params }),

  // Create dispatch
  create: (data) => 
    apiClient.post('/admin/inventory/dispatch', data),

  // Get single dispatch
  getById: (id) => 
    apiClient.get(`/admin/inventory/dispatch/${id}`),

  // Update dispatch
  update: (id, data) => 
    apiClient.patch(`/admin/inventory/dispatch/${id}`, data),

  // Delete dispatch
  delete: (id) => 
    apiClient.delete(`/admin/inventory/dispatch/${id}`),

  // Get dispatch status
  getStatus: (id) => 
    apiClient.get(`/admin/inventory/dispatch/${id}/status`),

  // Update dispatch status
  updateStatus: (id, status) => 
    apiClient.patch(`/admin/inventory/dispatch/${id}/status`, { status }),

  // Get pending dispatches
  getPending: () => 
    apiClient.get('/admin/inventory/dispatch/pending'),

  // Get completed dispatches
  getCompleted: () => 
    apiClient.get('/admin/inventory/dispatch/completed'),
};

export default {
  phonesAPI,
  accessoriesAPI,
  stockAPI,
  dispatchAPI,
};
