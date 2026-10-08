import { api } from './client.js';

// Billing Staff & Branch Admin Finance Operations

export const billingApi = {
  // ── Invoices ────────────────────────────────────────────
  getInvoices: (params = {}) => api.get('/invoice', { params }),
  getInvoice: (id) => api.get(`/invoice/${id}`),
  createInvoice: (body) => api.post('/invoice', body),
  updateInvoice: (id, body) => api.patch(`/invoice/${id}`, body),
  deleteInvoice: (id) => api.delete(`/invoice/${id}`),

  // ── Banks ───────────────────────────────────────────────
  getBanks: (params = {}) => api.get('/banks', { params }),
  getBankById: (id) => api.get(`/banks/${id}`),
  createBank: (body) => api.post('/banks', body),
  updateBank: (id, body) => api.patch(`/banks/${id}`, body),
  deleteBank: (id) => api.delete(`/banks/${id}`),

  // ── Ledger ──────────────────────────────────────────────
  getLedger: (params = {}) => api.get('/ledger', { params }),
  getLedgerById: (id) => api.get(`/ledger/${id}`),
  createLedger: (body) => api.post('/ledger', body),
  updateLedger: (id, body) => api.patch(`/ledger/${id}`, body),

  // ── Party Ledger ────────────────────────────────────────
  getPartyLedger: (params = {}) => api.get('/partyLedger', { params }),
  getPartyLedgerById: (id) => api.get(`/partyLedger/${id}`),
  createPartyLedger: (body) => api.post('/partyLedger', body),
  updatePartyLedger: (id, body) => api.patch(`/partyLedger/${id}`, body),

  // ── Shop Ledger ─────────────────────────────────────────
  getShopLedger: (params = {}) => api.get('/shop/ledger', { params }),
  getShopLedgerById: (id) => api.get(`/shop/ledger/${id}`),
  createShopLedger: (body) => api.post('/shop/ledger', body),

  // ── Pocket Cash ─────────────────────────────────────────
  getPocketCash: (params = {}) => api.get('/pocketCash', { params }),
  getPocketCashById: (id) => api.get(`/pocketCash/${id}`),
  createPocketCash: (body) => api.post('/pocketCash', body),
  updatePocketCash: (id, body) => api.patch(`/pocketCash/${id}`, body),

  // ── Expenses ────────────────────────────────────────────
  getExpenses: (params = {}) => api.get('/expense', { params }),
  getExpenseById: (id) => api.get(`/expense/${id}`),
  createExpense: (body) => api.post('/expense', body),
  updateExpense: (id, body) => api.patch(`/expense/${id}`, body),
  deleteExpense: (id) => api.delete(`/expense/${id}`),

  // ── Committee Ledger ────────────────────────────────────
  getCommitteeLedger: (params = {}) => api.get('/committee', { params }),
  getCommitteeLedgerById: (id) => api.get(`/committee/${id}`),
  createCommitteeLedger: (body) => api.post('/committee', body),
  updateCommitteeLedger: (id, body) => api.patch(`/committee/${id}`, body),

  // ── Day Book ────────────────────────────────────────────
  getDayBook: (params = {}) => api.get('/dayBook', { params }),
  getDayBookById: (id) => api.get(`/dayBook/${id}`),

  // ── Balance Sheet ───────────────────────────────────────
  getBalanceSheet: (params = {}) => api.get('/balanceSheet', { params }),

  // ── Payables & Receivables ─────────────────────────────
  getPayablesReceivables: (params = {}) => api.get('/payables', { params }),
  getPayablesReceivablesById: (id) => api.get(`/payables/${id}`),
  updatePayablesReceivables: (id, body) => api.patch(`/payables/${id}`, body),
};
