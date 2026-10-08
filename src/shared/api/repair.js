import { api } from './client.js';

// Repair Operations (Branch Admin & Staff)

export const repairApi = {
  // ── Repair Jobs ─────────────────────────────────────────
  getRepairs: (params = {}) => api.get('/repair', { params }),
  getRepairById: (id) => api.get(`/repair/${id}`),
  createRepair: (body) => api.post('/repair', body),
  updateRepair: (id, body) => api.patch(`/repair/${id}`, body),
  deleteRepair: (id) => api.delete(`/repair/${id}`),

  // ── Repair Status Updates ───────────────────────────────
  updateRepairStatus: (id, status) => api.patch(`/repair/${id}/status`, { status }),

  // ── Repair Statistics ───────────────────────────────────
  getRepairStats: (params = {}) => api.get('/repair/stats', { params }),
};
