  import { api } from './client.js';

export const salesAgentApi = {
  // ── Referrals ─────────────────────────────────────────────────────────
  getReferrals:     () => api.get('/sales-agent/referrals'),
  getReferralStats: () => api.get('/sales-agent/referrals/stats'),
  getCommissions:   () => api.get('/sales-agent/commissions'),

  // ── Negotiation workflow ──────────────────────────────────────────────
  // Step 1: Set / update the negotiated price
  // body: { negotiatedPrice: Number, note?: String }
  updateNegotiatedPrice: (id, body) =>
    api.patch(`/sales-agent/referrals/${id}/negotiate`, body),

  // Step 2: Submit the (already negotiated) referral to Super Admin
  submitToSuperAdmin: (id) =>
    api.post(`/sales-agent/referrals/${id}/submit`),
};

// ── Admin status-message (called by admin user after login) ─────────────
// GET /api/admin/status-message  — returns banner info for the logged-in admin
export const adminApi = {
  getStatusMessage: () => api.get('/admin/status-message'),
};
