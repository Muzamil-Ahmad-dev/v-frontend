 import { api } from './client.js';

// ── Branch Admin Dashboard ────────────────────────────────────────────────────
export const branchAdminApi = {
  getDashboard:   () => api.get('/branch-admin/dashboard'),
  listShopOwners: (params = {}) => api.get('/branch-admin/shop-owners', { params }),
};

// ── Branch Admin — Branches ───────────────────────────────────────────────────
// POST   /api/branch-admin/branches
// GET    /api/branch-admin/branches
// GET    /api/branch-admin/branches/:id
// PUT    /api/branch-admin/branches/:id
// DELETE /api/branch-admin/branches/:id
export const branchAdminBranchApi = {
  list:   ()        => api.get('/branch-admin/branches'),
  get:    (id)      => api.get(`/branch-admin/branches/${id}`),
  create: (body)    => api.post('/branch-admin/branches', body),
  update: (id, body) => api.put(`/branch-admin/branches/${id}`, body),
  remove: (id)      => api.delete(`/branch-admin/branches/${id}`),
};

// ── Branch Admin — Staff ──────────────────────────────────────────────────────
// POST   /api/branch-admin/staff              body: { role: 'BILLING'|'SALE'|'PURCHASE', branchId, name, email, phone, password }
// GET    /api/branch-admin/staff              ?branchId=&role=&page=&limit=
// GET    /api/branch-admin/staff/:id
// PUT    /api/branch-admin/staff/:id
// PATCH  /api/branch-admin/staff/:id/status   body: { action: 'activate'|'deactivate' }
// DELETE /api/branch-admin/staff/:id
export const branchAdminStaffApi = {
  list:         (params = {}) => api.get('/branch-admin/staff', { params }),
  get:          (id)          => api.get(`/branch-admin/staff/${id}`),
  create:       (body)        => api.post('/branch-admin/staff', body),
  update:       (id, body)    => api.put(`/branch-admin/staff/${id}`, body),
  toggleStatus: (id, action)  => api.patch(`/branch-admin/staff/${id}/status`, { action }),
  remove:       (id)          => api.delete(`/branch-admin/staff/${id}`),
};

// ── Branch Admin — Repair Jobs (NEW — real business logic on the backend
// now: deducts accessory stock for parts used, posts credit-job balances to
// Party Ledger, plus a status workflow) ─────────────────────────────────────
// GET    /api/branch-admin/repairs[?status=]
// GET    /api/branch-admin/repairs/:id
// POST   /api/branch-admin/repairs
// PUT    /api/branch-admin/repairs/:id
// DELETE /api/branch-admin/repairs/:id
// PATCH  /api/branch-admin/repairs/:id/advance   — todo -> in-progress -> complete -> handover
// PATCH  /api/branch-admin/repairs/:id/revert    — reverse of the above
// PATCH  /api/branch-admin/repairs/:id/return    body: { note } — handover -> complete
export const branchAdminRepairApi = {
  list:    (params = {}) => api.get('/branch-admin/repairs', { params }),
  get:     (id)          => api.get(`/branch-admin/repairs/${id}`),
  create:  (body)        => api.post('/branch-admin/repairs', body),
  update:  (id, body)    => api.put(`/branch-admin/repairs/${id}`, body),
  remove:  (id)          => api.delete(`/branch-admin/repairs/${id}`),
  advance: (id)          => api.patch(`/branch-admin/repairs/${id}/advance`),
  revert:  (id)          => api.patch(`/branch-admin/repairs/${id}/revert`),
  return:  (id, note)    => api.patch(`/branch-admin/repairs/${id}/return`, { note }),
};

// Alias — RepairsPage.jsx imports the plural name.
export const branchAdminRepairsApi = branchAdminRepairApi;

// ── Branch Admin — Catalog (Companies + Phone Models, tenant-wide reference
// data shared with the parent Admin's own /admin/catalog/*) ──────────────────
// POST/GET/PUT/DELETE /api/branch-admin/catalog/companies[/:id]
// POST/GET/PUT/DELETE /api/branch-admin/catalog/models[/:id]  (?companyId=)
export const branchAdminCatalogApi = {
  companies: {
    list:   ()        => api.get('/branch-admin/catalog/companies'),
    create: (body)     => api.post('/branch-admin/catalog/companies', body),
    update: (id, body) => api.put(`/branch-admin/catalog/companies/${id}`, body),
    remove: (id)       => api.delete(`/branch-admin/catalog/companies/${id}`),
  },
  models: {
    list:   (params = {}) => api.get('/branch-admin/catalog/models', { params }),
    create: (body)         => api.post('/branch-admin/catalog/models', body),
    update: (id, body)     => api.put(`/branch-admin/catalog/models/${id}`, body),
    remove: (id)           => api.delete(`/branch-admin/catalog/models/${id}`),
  },
};

// ── Branch Admin — Notifications ──────────────────────────────────────────────
// POST/GET/PUT/DELETE /api/branch-admin/notifications[/:id]
// PUT is also how a notification gets marked read: PUT { isRead: true }.
export const branchAdminNotificationsApi = {
  list:     (params = {}) => api.get('/branch-admin/notifications', { params }),
  create:   (body)        => api.post('/branch-admin/notifications', body),
  markRead: (id)           => api.put(`/branch-admin/notifications/${id}`, { isRead: true }),
  remove:   (id)           => api.delete(`/branch-admin/notifications/${id}`),
};

// ── Branch Admin — Shops (tenant-wide, shared with the parent Admin's own
// shops) ───────────────────────────────────────────────────────────────────────
// POST/GET/PUT/DELETE /api/branch-admin/shop[/:id]
// POST/DELETE         /api/branch-admin/shop/:id/logo
export const branchAdminShopApi = {
  list:      (params = {}) => api.get('/branch-admin/shop', { params }),
  get:       (id)          => api.get(`/branch-admin/shop/${id}`),
  create:    (body)        => api.post('/branch-admin/shop', body),
  update:    (id, body)    => api.put(`/branch-admin/shop/${id}`, body),
  remove:    (id)          => api.delete(`/branch-admin/shop/${id}`),
  uploadLogo: (id, file)   => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.upload(`/branch-admin/shop/${id}/logo`, formData, 'POST');
  },
  deleteLogo: (id)         => api.delete(`/branch-admin/shop/${id}/logo`),
};

// ── Branch Admin — Inventory: Phones ──────────────────────────────────────────
// POST   /api/branch-admin/inventory/phones
// GET    /api/branch-admin/inventory/phones
// GET    /api/branch-admin/inventory/phones/:id
// PUT    /api/branch-admin/inventory/phones/:id
// DELETE /api/branch-admin/inventory/phones/:id
export const branchAdminPhonesApi = {
  list:   (params = {}) => api.get('/branch-admin/inventory/phones', { params }),
  get:    (id)          => api.get(`/branch-admin/inventory/phones/${id}`),
  create: (body)        => api.post('/branch-admin/inventory/phones', body),
  update: (id, body)    => api.put(`/branch-admin/inventory/phones/${id}`, body),
  remove: (id)          => api.delete(`/branch-admin/inventory/phones/${id}`),
};

// ── Branch Admin — Inventory: Accessories (purchase/stock/ledger-linked,
// same module PURCHASE staff use) ─────────────────────────────────────────────
// GET    /api/branch-admin/inventory/accessories
// GET    /api/branch-admin/inventory/accessories/:id
// POST   /api/branch-admin/inventory/accessories            — purchase (stock in)
// PATCH  /api/branch-admin/inventory/accessories/:id/restock
// PUT    /api/branch-admin/inventory/accessories/:id        — rename/re-picture only
// DELETE /api/branch-admin/inventory/accessories/:id
export const branchAdminAccessoriesApi = {
  list:    (params = {}) => api.get('/branch-admin/inventory/accessories', { params }),
  get:     (id)          => api.get(`/branch-admin/inventory/accessories/${id}`),
  purchase: (body)       => api.post('/branch-admin/inventory/accessories', body),
  restock: (id, body)    => api.patch(`/branch-admin/inventory/accessories/${id}/restock`, body),
  update:  (id, body)    => api.put(`/branch-admin/inventory/accessories/${id}`, body),
  remove:  (id)          => api.delete(`/branch-admin/inventory/accessories/${id}`),
};

// ── Branch Admin — Inventory: Dispatch ────────────────────────────────────────
// POST   /api/branch-admin/inventory/dispatch
// GET    /api/branch-admin/inventory/dispatch
// GET    /api/branch-admin/inventory/dispatch/:id
// PUT    /api/branch-admin/inventory/dispatch/:id
// DELETE /api/branch-admin/inventory/dispatch/:id
export const branchAdminDispatchApi = {
  list:   (params = {}) => api.get('/branch-admin/inventory/dispatch', { params }),
  get:    (id)          => api.get(`/branch-admin/inventory/dispatch/${id}`),
  create: (body)        => api.post('/branch-admin/inventory/dispatch', body),
  update: (id, body)    => api.put(`/branch-admin/inventory/dispatch/${id}`, body),
  remove: (id)          => api.delete(`/branch-admin/inventory/dispatch/${id}`),
};