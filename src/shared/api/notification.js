import apiClient from './client';

// ============= NOTIFICATION API =============
export const notificationAPI = {
  // Get all notifications
  getAll: (params = {}) => 
    apiClient.get('/admin/notifications', { params }),

  // Get unread notifications
  getUnread: () => 
    apiClient.get('/admin/notifications/unread'),

  // Mark notification as read
  markAsRead: (id) => 
    apiClient.patch(`/admin/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => 
    apiClient.patch('/admin/notifications/mark-all-read'),

  // Delete notification
  delete: (id) => 
    apiClient.delete(`/admin/notifications/${id}`),

  // Delete all notifications
  deleteAll: () => 
    apiClient.delete('/admin/notifications/delete-all'),

  // Get notification count
  getCount: () => 
    apiClient.get('/admin/notifications/count'),

  // Create notification (admin only)
  create: (data) => 
    apiClient.post('/admin/notifications', data),

  // Get notification types
  getTypes: () => 
    apiClient.get('/admin/notifications/types'),

  // Get notification preferences
  getPreferences: () => 
    apiClient.get('/admin/notifications/preferences'),

  // Update notification preferences
  updatePreferences: (data) => 
    apiClient.patch('/admin/notifications/preferences', data),
};

// ============= REPAIR API =============
export const repairAPI = {
  // Get all repair jobs
  getAll: (params = {}) => 
    apiClient.get('/admin/repair', { params }),

  // Create repair job
  create: (data) => 
    apiClient.post('/admin/repair', data),

  // Get single repair job
  getById: (id) => 
    apiClient.get(`/admin/repair/${id}`),

  // Update repair job
  update: (id, data) => 
    apiClient.patch(`/admin/repair/${id}`, data),

  // Delete repair job
  delete: (id) => 
    apiClient.delete(`/admin/repair/${id}`),

  // Get repair by status
  getByStatus: (status, params = {}) => 
    apiClient.get(`/admin/repair/status/${status}`, { params }),

  // Update repair status
  updateStatus: (id, status) => 
    apiClient.patch(`/admin/repair/${id}/status`, { status }),

  // Assign repair to technician
  assign: (id, technicianId) => 
    apiClient.patch(`/admin/repair/${id}/assign`, { technicianId }),

  // Complete repair
  complete: (id, data = {}) => 
    apiClient.patch(`/admin/repair/${id}/complete`, data),

  // Get repair summary
  getSummary: () => 
    apiClient.get('/admin/repair/summary'),

  // Get pending repairs
  getPending: () => 
    apiClient.get('/admin/repair/pending'),

  // Get completed repairs
  getCompleted: () => 
    apiClient.get('/admin/repair/completed'),

  // Generate repair report
  generateReport: (params = {}) => 
    apiClient.get('/admin/repair/report', { params, responseType: 'blob' }),
};

// ============= SHOP OWNER API =============
export const shopOwnerAPI = {
  // Get all shop owners
  getAll: (params = {}) => 
    apiClient.get('/admin/shopOwners', { params }),

  // Create shop owner
  create: (data) => 
    apiClient.post('/admin/shopOwners', data),

  // Get single shop owner
  getById: (id) => 
    apiClient.get(`/admin/shopOwners/${id}`),

  // Update shop owner
  update: (id, data) => 
    apiClient.patch(`/admin/shopOwners/${id}`, data),

  // Delete shop owner
  delete: (id) => 
    apiClient.delete(`/admin/shopOwners/${id}`),

  // Get shop owner dashboard
  getDashboard: (id) => 
    apiClient.get(`/admin/shopOwners/${id}/dashboard`),

  // Get shop owner performance
  getPerformance: (id, params = {}) => 
    apiClient.get(`/admin/shopOwners/${id}/performance`, { params }),

  // Get shop owner sales
  getSales: (id, params = {}) => 
    apiClient.get(`/admin/shopOwners/${id}/sales`, { params }),

  // Get shop owner ledger
  getLedger: (id, params = {}) => 
    apiClient.get(`/admin/shopOwners/${id}/ledger`, { params }),

  // Activate shop owner
  activate: (id) => 
    apiClient.patch(`/admin/shopOwners/${id}/activate`),

  // Deactivate shop owner
  deactivate: (id) => 
    apiClient.patch(`/admin/shopOwners/${id}/deactivate`),
};

export default {
  notificationAPI,
  repairAPI,
  shopOwnerAPI,
};
