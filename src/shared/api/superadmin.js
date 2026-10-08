   import { api } from './client.js';

export const superadminApi = {
  // Analytics / Dashboard
  getAnalytics: () => api.get('/superadmin/analytics'),

  // Registration approval workflow
  listRegistrations: (status) => {
    const params = status ? { status } : {};
    return api.get('/superadmin/registrations', { params });
  },
  getRegistration: (id) => api.get(`/superadmin/registrations/${id}`),
  approveRegistration: (id, finalPrice) =>
    api.patch(`/superadmin/registrations/${id}/approve`, { finalPrice }),
  rejectRegistration: (id, rejectionReason) =>
    api.patch(`/superadmin/registrations/${id}/reject`, { rejectionReason }),
  // NEW: reject price (soft rejection — sends back to sales agent for re-negotiation)
  rejectPrice: (id, { priceRejectionReason, superadminDesiredPrice }) =>
    api.patch(`/superadmin/registrations/${id}/reject-price`, {
      priceRejectionReason,
      superadminDesiredPrice,
    }),
  // NEW: counter-offer — send a final approved price directly to the admin
  sendCounterOffer: (id, { counterOfferPrice, counterOfferMessage }) =>
    api.patch(`/superadmin/registrations/${id}/counter-offer`, {
      counterOfferPrice,
      counterOfferMessage,
    }),

  // NEW: Negotiation activity / history dashboard
  getNegotiationActivity: (params = {}) =>
    api.get('/superadmin/negotiation-activity', { params }),

  // NEW: Preview the status banner an admin sees on login
  getAdminStatusMessage: (adminId) =>
    api.get(`/superadmin/admin-status-message/${adminId}`),

  // User management
  listUsers: (params = {}) => api.get('/superadmin/users', { params }),
  // Activate / Deactivate an ADMIN (company) account: action = 'activate' | 'deactivate'
  toggleAdminStatus: (id, action) => api.patch(`/superadmin/users/${id}/status`, { action }),

  // Sales agent management
  createSalesAgent: (body) => api.post('/superadmin/sales-agents', body),
  listSalesAgents: () => api.get('/superadmin/sales-agents'),

  // Commission management
  listCommissions: (params = {}) => api.get('/superadmin/commissions', { params }),
  getCommissionByAdmin: (adminId) => api.get(`/superadmin/commissions/by-admin/${adminId}`),
  setCommission: (id, body) => api.patch(`/superadmin/commissions/${id}`, body),
};
