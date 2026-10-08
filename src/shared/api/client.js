 // API client with automatic token handling
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ACTIVE_BRANCH_KEY = 'activeBranchId';

// NEW: which branch the current request should be scoped to.
// Only meaningful for BRANCH_ADMIN (who can own multiple branches) —
// BILLING/SALE/PURCHASE staff always have a single fixed branch on the
// backend and ignore this value, so it's always safe to send.
export const branchContext = {
  get: () => localStorage.getItem(ACTIVE_BRANCH_KEY) || null,
  set: (branchId) => {
    if (branchId) localStorage.setItem(ACTIVE_BRANCH_KEY, branchId);
    else localStorage.removeItem(ACTIVE_BRANCH_KEY);
  },
  clear: () => localStorage.removeItem(ACTIVE_BRANCH_KEY),
};

const withBranch = (obj = {}) => {
  const branchId = branchContext.get();
  return branchId ? { ...obj, branchId } : obj;
};

export const api = {
  getToken: () => localStorage.getItem('token'),

  getHeaders: (isJson = true) => {
    const headers = isJson ? { 'Content-Type': 'application/json' } : {};
    const token = api.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },

  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      headers: api.getHeaders(true),
      ...options,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return await response.json();
  },

  get: (endpoint, opts = {}) => {
    let url = endpoint;
    const params = withBranch(opts.params);
    const q = new URLSearchParams(params).toString();
    if (q) url += (url.includes('?') ? '&' : '?') + q;
    return api.request(url, { method: 'GET' });
  },

  post: (endpoint, body) =>
    api.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(withBranch(body)),
    }),

  put: (endpoint, body) =>
    api.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(withBranch(body)),
    }),

  patch: (endpoint, body) =>
    api.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(withBranch(body || {})),
    }),

  delete: (endpoint) => {
    const params = withBranch();
    const q = new URLSearchParams(params).toString();
    const url = q ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${q}` : endpoint;
    return api.request(url, { method: 'DELETE' });
  },

  // NEW: multipart/form-data upload (image/logo uploads). Do NOT set
  // Content-Type manually — the browser sets it (with the correct boundary)
  // when the body is a FormData instance.
  upload: async (endpoint, formData, method = 'POST') => {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: api.getHeaders(false),
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return await response.json();
  },
};

export default api;