  import { api } from './client.js';

// ── Billing ───────────────────────────────────────────────────────────────────
// GET  /api/billing/dashboard
// POST/GET/PUT/DELETE /api/billing/invoices[/:id]
export const billingApi = {
  getDashboard:  ()         => api.get('/billing/dashboard'),
  listInvoices:  (params={})=> api.get('/billing/invoices', { params }),
  getInvoice:    (id)       => api.get(`/billing/invoices/${id}`),
  createInvoice: (body)     => api.post('/billing/invoices', body),
  updateInvoice: (id, body) => api.put(`/billing/invoices/${id}`, body),
  deleteInvoice: (id)       => api.delete(`/billing/invoices/${id}`),
};

// ── Billing: My Wallet (daily cash ledger — Payables / Receivables / Expense) ──
// GET  /api/billing/wallet/today
// PUT  /api/billing/wallet/opening-cash
// POST /api/billing/wallet/receivable | /payable | /expense
// GET  /api/billing/wallet/recalculate/:id
// POST /api/billing/wallet/end-day
// GET  /api/billing/wallet/history
// GET  /api/billing/wallet/:id
export const walletApi = {
  getToday:           ()         => api.get('/billing/wallet/today'),
  updateOpeningCash:  (amount)   => api.put('/billing/wallet/opening-cash', { amount }),
  addReceivable:      (body)     => api.post('/billing/wallet/receivable', body),
  addPayable:         (body)     => api.post('/billing/wallet/payable', body),
  addExpense:         (body)     => api.post('/billing/wallet/expense', body),
  recalculate:        (id)       => api.get(`/billing/wallet/recalculate/${id}`),
  endDay:             ()         => api.post('/billing/wallet/end-day'),
  getHistory:         (params={})=> api.get('/billing/wallet/history', { params }),
  getById:            (id)       => api.get(`/billing/wallet/${id}`),
};

// ── Billing: Finance ────────────────────────────────────────────────────────────
// NEW: Whole Finance module (moved from /api/admin/finance/* on the backend) is
// now also available to the BILLING role under /api/billing/finance/*.
// Each sub-resource is a standard CRUD: POST/GET/PUT/DELETE [/:id]
const makeCrud = (basePath) => ({
  list:   (params={})=> api.get(basePath, { params }),
  getOne: (id)       => api.get(`${basePath}/${id}`),
  create: (body)     => api.post(basePath, body),
  update: (id, body) => api.put(`${basePath}/${id}`, body),
  remove: (id)       => api.delete(`${basePath}/${id}`),
});

export const financeApi = {
  ledger:               makeCrud('/billing/finance/ledger'),
  bank:                 makeCrud('/billing/finance/bank'),
  expense:              makeCrud('/billing/finance/expenses'),
  partyLedger:          makeCrud('/billing/finance/party-ledger'),
  committeeLedger:      makeCrud('/billing/finance/committee-ledger'),
  shopLedger:           makeCrud('/billing/finance/shop-ledger'),
  pocketCash:           makeCrud('/billing/finance/pocket-cash'),
  payablesReceivables:  makeCrud('/billing/finance/payables-receivables'),
  dayBook:              makeCrud('/billing/finance/daybook'),
  balanceSheet:         makeCrud('/billing/finance/balance-sheet'),
};

// ── Ledger-suite: flat top-level API (matches AddLedger / Wallet UI 1:1) ──────
// GET/POST /api/expense/types, GET/POST /api/expense (with bank + pocket-cash
// payment splitting), GET /api/banks/getAllBanks, GET /api/pocketCash/total.
export const expenseLedgerApi = {
  listTypes:  ()         => api.get('/expense/types'),
  createType: (body)     => api.post('/expense/types', body),
  list:       (params={})=> api.get('/expense', { params }),
  create:     (body)     => api.post('/expense', body),
};

export const banksLedgerApi = {
  getAll:            ()               => api.get('/banks/getAllBanks'),
  create:            (body)           => api.post('/banks/create', body),
  addCash:           (body)           => api.post('/banks/addCash', body),
  removeCash:        (body)           => api.post('/banks/removeCash', body),
  remove:            (id)             => api.delete(`/banks/delete/${id}`),
  getTransactions:   (id)             => api.get(`/banks/getBankTransaction/${id}`),
  deleteTransaction: (transactionId)  => api.delete(`/banks/deleteTransaction/${transactionId}`),
};

export const pocketCashLedgerApi = {
  getTotal:          ()               => api.get('/pocketCash/total'),
  add:               (body)           => api.post('/pocketCash/add', body),
  deduct:            (body)           => api.post('/pocketCash/deduct', body),
  getTransactions:   (id)             => api.get(`/pocketCash/get/${id}`),
  deleteTransaction: (transactionId)  => api.delete(`/pocketCash/delete/${transactionId}`),
};

// ── Person Ledger (Payables & Receivables — matches /api/person/* 1:1) ────────
// GET    /api/person/all
// POST   /api/person/create                 { name, number, reference }
// PUT    /api/person/update/:id              { name, number, reference }
// PATCH  /api/person/:id                     (toggle favourite)
// DELETE /api/person/:id
// GET    /api/person/:id                     -> { person, transactions }
// POST   /api/person/give-credit             { personId, amount, description, bankAccountUsed?, accountCash?, pocketCash? }
// POST   /api/person/take-credit             { personId, amount, description, bankAccountUsed?, accountCash?, pocketCash? }
// PUT    /api/person/update-transaction/:id
// DELETE /api/person/delete-transaction/:id
// GET    /api/person/credit-transaction-details/:id
// POST   /api/person/verify-password         { password }
export const personApi = {
  getAll:                  ()          => api.get('/person/all'),
  getOne:                  (id)        => api.get(`/person/${id}`),
  create:                  (body)      => api.post('/person/create', body),
  update:                  (id, body)  => api.put(`/person/update/${id}`, body),
  toggleFavourite:         (id)        => api.patch(`/person/${id}`),
  remove:                  (id)        => api.delete(`/person/${id}`),
  giveCredit:              (body)      => api.post('/person/give-credit', body),
  takeCredit:              (body)      => api.post('/person/take-credit', body),
  updateTransaction:       (id, body)  => api.put(`/person/update-transaction/${id}`, body),
  deleteTransaction:       (id)        => api.delete(`/person/delete-transaction/${id}`),
  getTransactionDetails:   (id)        => api.get(`/person/credit-transaction-details/${id}`),
  verifyPassword:          (password)  => api.post('/person/verify-password', { password }),
};

// ── Sale ──────────────────────────────────────────────────────────────────────
// GET  /api/sale/dashboard
// POST/GET/PUT/DELETE /api/sale/invoices[/:id]
export const saleApi = {
  getDashboard:  ()         => api.get('/sale/dashboard'),
  listInvoices:  (params={})=> api.get('/sale/invoices', { params }),
  getInvoice:    (id)       => api.get(`/sale/invoices/${id}`),
  createInvoice: (body)     => api.post('/sale/invoices', body),
  updateInvoice: (id, body) => api.put(`/sale/invoices/${id}`, body),
  deleteInvoice: (id)       => api.delete(`/sale/invoices/${id}`),
};

// ── Purchase ──────────────────────────────────────────────────────────────────
// GET /api/purchase/dashboard
export const purchaseApi = {
  getDashboard: () => api.get('/purchase/dashboard'),
};

// ── Purchase: Single Phones ─────────────────────────────────────────────────
// POST   /api/purchase/phones
// GET    /api/purchase/phones[?status&companyName&modelName&imei&dateFrom&dateTo&page&limit]
// GET    /api/purchase/phones/:id
// PUT    /api/purchase/phones/:id
// DELETE /api/purchase/phones/:id
// PATCH  /api/purchase/phones/:id/dispatch          { receiverName }
// PATCH  /api/purchase/phones/:id/return-dispatch
export const purchasePhonesApi = {
  list:           (params={}) => api.get('/purchase/phones', { params }),
  getOne:         (id)        => api.get(`/purchase/phones/${id}`),
  create:         (body)      => api.post('/purchase/phones', body),
  update:         (id, body)  => api.put(`/purchase/phones/${id}`, body),
  remove:         (id)        => api.delete(`/purchase/phones/${id}`),
  dispatch:       (id, body)  => api.patch(`/purchase/phones/${id}/dispatch`, body),
  returnDispatch: (id)        => api.patch(`/purchase/phones/${id}/return-dispatch`),
};

// ── Purchase: Bulk Purchases ─────────────────────────────────────────────────
// POST   /api/purchase/bulk
// GET    /api/purchase/bulk[?status&companyName&modelName&page&limit]
// GET    /api/purchase/bulk/:id
// PUT    /api/purchase/bulk/:id
// DELETE /api/purchase/bulk/:id
// PATCH  /api/purchase/bulk/:id/dispatch            { imeis: [], receiverName }
// PATCH  /api/purchase/bulk/dispatch/:dispatchId/return
// PATCH  /api/purchase/bulk-purchase-credit-pay/:id  { amountToPay }  — pay down remaining supplier credit
export const purchaseBulkApi = {
  list:           (params={}) => api.get('/purchase/bulk', { params }),
  getOne:         (id)        => api.get(`/purchase/bulk/${id}`),
  create:         (body)      => api.post('/purchase/bulk', body),
  update:         (id, body)  => api.put(`/purchase/bulk/${id}`, body),
  remove:         (id)        => api.delete(`/purchase/bulk/${id}`),
  dispatch:       (id, body)  => api.patch(`/purchase/bulk/${id}/dispatch`, body),
  returnDispatch: (dispatchId)=> api.patch(`/purchase/bulk/dispatch/${dispatchId}/return`),
  payCredit:      (id, amountToPay) => api.patch(`/purchase/bulk-purchase-credit-pay/${id}`, { amountToPay }),
};

// ── Purchase: Stock (read-only, combined view across phones + bulk) ─────────
// GET /api/purchase/stock[?companyName&modelName]
// GET /api/purchase/stock/summary
// GET /api/purchase/stock/imei/:imei
export const purchaseStockApi = {
  getAvailable: (params={}) => api.get('/purchase/stock', { params }),
  getSummary:   ()          => api.get('/purchase/stock/summary'),
  getByImei:    (imei)      => api.get(`/purchase/stock/imei/${imei}`),
};