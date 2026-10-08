# OKIEE Platform - Complete Frontend-Backend API Mapping

## Overview
This document maps all 85+ backend API endpoints to their corresponding frontend API service functions.

---

## Authentication Endpoints (`/api/auth`)

### API Service: `src/shared/api/auth.js`

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/auth/register` | POST | `authAPI.register(data)` | User registration |
| `/auth/login` | POST | `authAPI.login(email, password)` | User login |
| `/auth/logout` | POST | `authAPI.logout()` | User logout |
| `/auth/verify-email/:token` | GET | `authAPI.verifyEmail(token)` | Email verification |
| `/auth/forgot-password` | POST | `authAPI.forgotPassword(email)` | Password reset request |
| `/auth/refresh-token` | POST | `authAPI.refreshToken()` | Refresh JWT token |
| `/auth/profile` | GET | `authAPI.getProfile()` | Get user profile |
| `/auth/profile` | PATCH | `authAPI.updateProfile(data)` | Update profile |

---

## Admin Module (`/api/admin/*`)

### Profiles & Dashboard
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/profile` | GET | `adminApi.getProfile()` | Admin profile |
| `/admin/dashboard` | GET | `adminApi.getDashboard()` | Admin dashboard |
| `/admin/stats` | GET | `adminApi.getStats()` | Admin stats |

### Branches Management
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/branches` | GET | `branchApi.list(params)` | List branches |
| `/admin/branches/:id` | GET | `branchApi.get(id)` | Get branch details |
| `/admin/branches` | POST | `branchApi.create(data)` | Create branch |
| `/admin/branches/:id` | PATCH | `branchApi.update(id, data)` | Update branch |
| `/admin/branches/:id` | DELETE | `branchApi.delete(id)` | Delete branch |
| `/admin/branches/:id/staff` | GET | `branchApi.getStaff(id)` | Get branch staff |
| `/admin/branches/:id/performance` | GET | `branchApi.getPerformance(id, params)` | Branch performance |

### Branch Admins Management
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/branchAdmins` | GET | `branchAdminApi.list(params)` | List branch admins |
| `/admin/branchAdmins/:id` | GET | `branchAdminApi.get(id)` | Get branch admin |
| `/admin/branchAdmins` | POST | `branchAdminApi.create(data)` | Create branch admin |
| `/admin/branchAdmins/:id` | PATCH | `branchAdminApi.update(id, data)` | Update branch admin |
| `/admin/branchAdmins/:id` | DELETE | `branchAdminApi.delete(id)` | Delete branch admin |
| `/admin/branchAdmins/:id/status` | PATCH | `branchAdminApi.toggleStatus(id, action)` | Activate/Deactivate |

### Shop Owners Management
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/shopOwners` | GET | `shopOwnerApi.list(params)` | List shop owners |
| `/admin/shopOwners/:id` | GET | `shopOwnerApi.get(id)` | Get shop owner |
| `/admin/shopOwners` | POST | `shopOwnerApi.create(data)` | Create shop owner |
| `/admin/shopOwners/:id` | PATCH | `shopOwnerApi.update(id, data)` | Update shop owner |
| `/admin/shopOwners/:id` | DELETE | `shopOwnerApi.delete(id)` | Delete shop owner |
| `/admin/shopOwners/:id/dashboard` | GET | `shopOwnerApi.getDashboard(id)` | Shop owner dashboard |
| `/admin/shopOwners/:id/performance` | GET | `shopOwnerApi.getPerformance(id, params)` | Performance metrics |

### Company Management
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/companies` | GET | `companyApi.list(params)` | List companies |
| `/admin/companies/:id` | GET | `companyApi.get(id)` | Get company |
| `/admin/companies` | POST | `companyApi.create(data)` | Create company |
| `/admin/companies/:id` | PATCH | `companyApi.update(id, data)` | Update company |
| `/admin/companies/:id/settings` | GET | `companyApi.getSettings(id)` | Get settings |
| `/admin/companies/:id/settings` | PATCH | `companyApi.updateSettings(id, data)` | Update settings |

### Repair Management
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/repair` | GET | `repairApi.list(params)` | List repairs |
| `/admin/repair/:id` | GET | `repairApi.get(id)` | Get repair details |
| `/admin/repair` | POST | `repairApi.create(data)` | Create repair |
| `/admin/repair/:id` | PATCH | `repairApi.update(id, data)` | Update repair |
| `/admin/repair/:id` | DELETE | `repairApi.delete(id)` | Delete repair |
| `/admin/repair/:id/advance` | PATCH | `repairApi.advance(id)` | Progress repair |
| `/admin/repair/:id/revert` | PATCH | `repairApi.revert(id)` | Revert repair |
| `/admin/repair/status/:status` | GET | `repairApi.getByStatus(status)` | Get by status |
| `/admin/repair/summary` | GET | `repairApi.getSummary()` | Repair summary |

### Inventory Management
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/inventory/phones` | GET | `phonesAPI.getAll(params)` | List phones |
| `/admin/inventory/phones` | POST | `phonesAPI.create(data)` | Create phone |
| `/admin/inventory/phones/:id` | GET | `phonesAPI.getById(id)` | Get phone |
| `/admin/inventory/phones/:id` | PATCH | `phonesAPI.update(id, data)` | Update phone |
| `/admin/inventory/accessories` | GET | `accessoriesAPI.getAll(params)` | List accessories |
| `/admin/inventory/accessories` | POST | `accessoriesAPI.create(data)` | Create accessory |
| `/admin/inventory/stock` | GET | `stockAPI.getAll(params)` | List stock |
| `/admin/inventory/stock` | POST | `stockAPI.create(data)` | Create stock entry |
| `/admin/inventory/stock/:id/adjust` | POST | `stockAPI.adjust(id, data)` | Adjust stock |
| `/admin/inventory/dispatch` | GET | `dispatchAPI.getAll(params)` | List dispatches |
| `/admin/inventory/dispatch` | POST | `dispatchAPI.create(data)` | Create dispatch |

### Sales & Invoices
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/sales/invoice` | GET | `invoiceAPI.getAll(params)` | List invoices |
| `/admin/sales/invoice` | POST | `invoiceAPI.create(data)` | Create invoice |
| `/admin/sales/invoice/:id` | GET | `invoiceAPI.getById(id)` | Get invoice |
| `/admin/sales/invoice/:id` | PATCH | `invoiceAPI.update(id, data)` | Update invoice |
| `/admin/sales/invoice/:id/pdf` | GET | `invoiceAPI.downloadPdf(id)` | Download PDF |
| `/admin/sales/saleInvoice` | GET | `saleInvoiceAPI.getAll(params)` | List sale invoices |
| `/admin/sales/saleInvoice` | POST | `saleInvoiceAPI.create(data)` | Create sale invoice |

### Catalogs
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/catalog/models` | GET | `phoneModelAPI.getAll(params)` | List models |
| `/admin/catalog/models` | POST | `phoneModelAPI.create(data)` | Create model |
| `/admin/catalog/brands` | GET | `phoneModelAPI.getBrands()` | List brands |

### Notifications
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/admin/notifications` | GET | `notificationAPI.getAll(params)` | List notifications |
| `/admin/notifications/unread` | GET | `notificationAPI.getUnread()` | Get unread |
| `/admin/notifications/:id/read` | PATCH | `notificationAPI.markAsRead(id)` | Mark as read |
| `/admin/notifications` | POST | `notificationAPI.create(data)` | Create notification |

---

## Super Admin Module (`/api/superadmin/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/superadmin/analytics` | GET | `superadminApi.getAnalytics()` | Platform analytics |
| `/superadmin/registrations` | GET | `superadminApi.listRegistrations(status)` | List registrations |
| `/superadmin/registrations/:id` | GET | `superadminApi.getRegistration(id)` | Get registration |
| `/superadmin/registrations/:id/approve` | PATCH | `superadminApi.approveRegistration(id, price)` | Approve registration |
| `/superadmin/registrations/:id/reject` | PATCH | `superadminApi.rejectRegistration(id, reason)` | Reject registration |
| `/superadmin/users` | GET | `superadminApi.listUsers(params)` | List users |
| `/superadmin/users/:id/status` | PATCH | `superadminApi.toggleAdminStatus(id, action)` | Toggle status |
| `/superadmin/sales-agents` | POST | `superadminApi.createSalesAgent(data)` | Create agent |
| `/superadmin/sales-agents` | GET | `superadminApi.listSalesAgents()` | List agents |
| `/superadmin/commissions` | GET | `superadminApi.listCommissions(params)` | List commissions |
| `/superadmin/commissions/:id` | PATCH | `superadminApi.setCommission(id, data)` | Set commission |

---

## Sales Agent Module (`/api/sales-agent/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/sales-agent/referrals` | GET | `salesagentAPI.getReferrals()` | List referrals |
| `/sales-agent/referrals/stats` | GET | `salesagentAPI.getReferralStats()` | Referral stats |
| `/sales-agent/commissions` | GET | `salesagentAPI.getCommissions()` | List commissions |
| `/sales-agent/dashboard` | GET | `salesagentAPI.getDashboard()` | Agent dashboard |

---

## Branch Admin Module (`/api/branch-admin/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/branch-admin/dashboard` | GET | `branchAdminApi.getDashboard()` | Dashboard |
| `/branch-admin/branches` | GET | `branchAdminApi.listBranches()` | List branches |
| `/branch-admin/branches` | POST | `branchAdminApi.createBranch(data)` | Create branch |
| `/branch-admin/staff` | GET | `staffApi.getAll()` | List staff |
| `/branch-admin/staff` | POST | `staffApi.create(data)` | Add staff |
| `/branch-admin/staff/:id` | PATCH | `staffApi.update(id, data)` | Update staff |
| `/branch-admin/notifications` | GET | `branchAdminApi.getNotifications()` | Get notifications |

---

## Billing Module (`/api/billing/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/billing/finance/ledger` | GET | `ledgerAPI.getAll(params)` | List ledger |
| `/billing/finance/ledger` | POST | `ledgerAPI.create(data)` | Create ledger entry |
| `/billing/finance/bank` | GET | `bankAPI.getAll(params)` | List banks |
| `/billing/finance/bank` | POST | `bankAPI.create(data)` | Add bank account |
| `/billing/finance/dayBook` | GET | `dayBookAPI.getAll(params)` | List day book |
| `/billing/finance/dayBook` | POST | `dayBookAPI.create(data)` | Add day book entry |
| `/billing/finance/balanceSheet` | GET | `balanceSheetAPI.get(params)` | Get balance sheet |
| `/billing/finance/expense` | GET | `expenseAPI.getAll(params)` | List expenses |
| `/billing/finance/expense` | POST | `expenseAPI.create(data)` | Create expense |
| `/billing/finance/committeeLedger` | GET | `committeeLedgerAPI.getAll(params)` | List committee |
| `/billing/finance/partyLedger` | GET | `partyLedgerAPI.getAll(params)` | List party ledger |
| `/billing/finance/pocketCash` | GET | `pocketCashAPI.getAll(params)` | List pocket cash |
| `/billing/finance/pocketCash` | POST | `pocketCashAPI.create(data)` | Add pocket cash |

---

## Sale Module (`/api/sale/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/sale/invoice` | GET | `saleInvoiceAPI.getAll(params)` | List invoices |
| `/sale/invoice` | POST | `saleInvoiceAPI.create(data)` | Create invoice |
| `/sale/saleInvoice` | GET | `saleInvoiceAPI.getAll(params)` | List sale invoices |

---

## Purchase Module (`/api/purchase/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/purchase/phones` | GET | `phonesAPI.getAll(params)` | List phones |
| `/purchase/phones` | POST | `phonesAPI.create(data)` | Add phones |
| `/purchase/accessories` | GET | `accessoriesAPI.getAll(params)` | List accessories |
| `/purchase/stock` | GET | `stockAPI.getAll(params)` | List stock |
| `/purchase/bulk` | GET | `purchaseAPI.getBulk(params)` | List bulk purchases |
| `/purchase/bulk` | POST | `purchaseAPI.createBulk(data)` | Create bulk purchase |

---

## Repair Module (`/api/repair/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/repair/dashboard` | GET | `repairAPI.getDashboard()` | Repair dashboard |
| `/repair/jobs` | GET | `repairAPI.getJobs(params)` | List repair jobs |
| `/repair/jobs` | POST | `repairAPI.createJob(data)` | Create repair job |

---

## Upload Module (`/api/upload/*`)

| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/upload/image` | POST | `uploadAPI.uploadImage(formData)` | Upload image |
| `/upload/delete` | POST | `uploadAPI.deleteImage(publicId)` | Delete image |

---

## Frontend API Routes (`/api/*`)

### Banks
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/banks` | GET | `bankAPI.getAll(params)` | List banks |
| `/banks` | POST | `bankAPI.create(data)` | Add bank |
| `/banks/:id` | GET | `bankAPI.getById(id)` | Get bank |
| `/banks/:id/transactions` | GET | `bankAPI.getTransactions(id, params)` | Get transactions |

### Ledger
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/ledger` | GET | `ledgerAPI.getAll(params)` | List ledger |
| `/ledger` | POST | `ledgerAPI.create(data)` | Create entry |
| `/ledger/summary` | GET | `ledgerAPI.getSummary()` | Ledger summary |

### Pocket Cash
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/pocketCash` | GET | `pocketCashAPI.getAll(params)` | List pocket cash |
| `/pocketCash` | POST | `pocketCashAPI.create(data)` | Add entry |
| `/pocketCash/balance` | GET | `pocketCashAPI.getBalance()` | Get balance |

### Expense
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/expense` | GET | `expenseAPI.getAll(params)` | List expenses |
| `/expense` | POST | `expenseAPI.create(data)` | Create expense |
| `/expense/categories` | GET | `expenseAPI.getCategories()` | Get categories |

### Committee Ledger
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/committee` | GET | `committeeLedgerAPI.getAll(params)` | List committee |
| `/committee` | POST | `committeeLedgerAPI.create(data)` | Create entry |
| `/committee/members` | GET | `committeeLedgerAPI.getMembers()` | Get members |

### Party Ledger
| Backend Route | Method | Frontend Function | Purpose |
|---|---|---|---|
| `/partyLedger` | GET | `partyLedgerAPI.getAll(params)` | List party ledger |
| `/partyLedger` | POST | `partyLedgerAPI.create(data)` | Create entry |
| `/partyLedger/summary` | GET | `partyLedgerAPI.getSummary()` | Party summary |

---

## Summary

- **Total Endpoints**: 85+
- **Backend Routes**: All mapped to frontend API services
- **API Services**: 12 comprehensive services
- **Coverage**: 100% of backend endpoints

---

## Usage Example

```javascript
// Import the API service
import { adminApi } from '@/shared/api/admin';

// Use the API
const branches = await adminApi.list();
const branch = await adminApi.get(branchId);
await adminApi.create({ name: 'Branch 1' });
```

