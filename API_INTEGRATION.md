# Frontend-Backend API Integration Guide

Complete mapping of frontend pages to backend API endpoints and data flows.

---

## 🔐 Authentication APIs

### Login
- **Page**: `/login`
- **Component**: `src/features/auth/LoginPage.jsx`
- **Backend Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGc...",
      "user": {
        "id": "userId",
        "email": "user@example.com",
        "role": "ADMIN",
        "status": "ACTIVE"
      }
    }
  }
  ```
- **Storage**: Token stored in localStorage

### Registration
- **Page**: `/register`
- **Component**: `src/features/auth/RegisterPage.jsx`
- **Backend Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+923001234567",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "businessName": "My Shop",
    "selectedPlan": "YEARLY",
    "negotiationPrice": 20000,
    "referralCode": "SA123456"
  }
  ```

### Email Verification
- **Component**: Auto-triggered on approval
- **Backend Endpoint**: `GET /api/auth/verify-email/:token`
- **Flow**: Admin approves registration → Email sent to `FIXED_VERIFICATION_EMAIL` → Link clicked → Account activated

---

## 👨‍💼 Super Admin APIs

### Dashboard
- **Page**: `/superadmin/dashboard`
- **Component**: `src/features/superadmin/dashboard/DashboardPage.jsx`
- **Backend Endpoints**:
  - `GET /api/superadmin/analytics` - Platform statistics

### Registrations (Approval Queue)
- **Page**: `/superadmin/registrations`
- **Component**: `src/features/superadmin/registrations/RegistrationsPage.jsx`
- **Backend Endpoints**:
  - `GET /api/superadmin/registrations?status=PENDING_APPROVAL` - List pending
  - `GET /api/superadmin/registrations/:id` - Get details
  - `PATCH /api/superadmin/registrations/:id/approve` - Approve registration
  - `PATCH /api/superadmin/registrations/:id/reject` - Reject registration

### Users Management
- **Page**: `/superadmin/users`
- **Component**: `src/features/superadmin/users/UsersPage.jsx`
- **Backend Endpoints**:
  - `GET /api/superadmin/users?role=ADMIN&status=ACTIVE` - Filter users
  - `GET /api/superadmin/users/:id` - User details

### Sales Agents
- **Page**: `/superadmin/sales-agents`
- **Component**: `src/features/superadmin/salesagents/SalesAgentsPage.jsx`
- **Backend Endpoints**:
  - `GET /api/superadmin/sales-agents` - List all
  - `POST /api/superadmin/sales-agents` - Create sales agent
  - `PATCH /api/superadmin/sales-agents/:id` - Update
  - `GET /api/superadmin/commissions` - View commissions

---

## 🏢 Admin APIs

### Dashboard
- **Page**: `/admin/dashboard`
- **Component**: `src/features/admin/dashboard/DashboardPage.jsx`
- **Backend Endpoints**:
  - `GET /api/admin/dashboard` - Admin overview stats

### Branch Admin Management
- **Page**: `/admin/branch-admins`
- **Component**: `src/features/admin/branchAdmins/BranchAdminsPage.jsx`
- **Backend Endpoints**:
  - `GET /api/admin/branch-admins` - List all
  - `POST /api/admin/branch-admins` - Create new
  - `PATCH /api/admin/branch-admins/:id` - Update
  - `DELETE /api/admin/branch-admins/:id` - Delete

---

## 🏪 Branch Admin APIs

### Dashboard
- **Page**: `/branch-admin/dashboard`
- **Backend Endpoints**:
  - `GET /api/branch-admin/dashboard` - Branch statistics

### Staff Management
- **Page**: `/branch-admin/staff`
- **Backend Endpoints**:
  - `GET /api/branch-admin/staff` - List staff
  - `POST /api/branch-admin/staff` - Add staff member
  - `PATCH /api/branch-admin/staff/:id` - Update
  - `DELETE /api/branch-admin/staff/:id` - Remove

### Inventory Management
- **Page**: `/branch-admin/inventory`
- **Backend Endpoints**:
  - `GET /api/purchase/phones` - Phone inventory
  - `GET /api/purchase/accessories` - Accessories
  - `POST /api/purchase/phones` - Add phone
  - `PATCH /api/purchase/phones/:id` - Update phone

### Repair Jobs
- **Page**: `/branch-admin/repairs`
- **Backend Endpoints**:
  - `GET /api/repair` - List repairs
  - `POST /api/repair` - Create repair job
  - `PATCH /api/repair/:id` - Update repair
  - `PATCH /api/repair/:id/status` - Update status

---

## 💰 Billing Staff APIs

### Dashboard
- **Page**: `/billing/dashboard`
- **Backend Endpoints**:
  - `GET /api/billing/dashboard` - Billing overview

### Invoices
- **Page**: `/billing/invoices`
- **Backend Endpoints**:
  - `GET /api/invoice` - List invoices
  - `POST /api/invoice` - Create invoice
  - `PATCH /api/invoice/:id` - Update invoice

### Wallet & Banks
- **Page**: `/billing/wallet`
- **Backend Endpoints**:
  - `GET /api/banks` - List bank accounts
  - `POST /api/banks` - Add bank
  - `GET /api/banks/:id/transactions` - Bank transactions
  - `GET /api/pocketCash` - Pocket cash records

### Finance & Accounting
- **Pages**: `/billing/finance/*`
- **Backend Endpoints**:
  - `GET /api/ledger` - Main ledger
  - `GET /api/partyLedger` - Party ledger
  - `GET /api/shop/ledger` - Shop ledger
  - `GET /api/pocketCash` - Pocket cash
  - `GET /api/expense` - Expenses
  - `GET /api/committee` - Committee ledger
  - `GET /api/dayBook` - Day book records
  - `GET /api/balanceSheet` - Financial reports

---

## 📦 Purchase Staff APIs

### Dashboard
- **Page**: `/purchase/dashboard`
- **Backend Endpoints**:
  - `GET /api/purchase/dashboard` - Purchase overview

### Phones
- **Page**: `/purchase/phones`
- **Backend Endpoints**:
  - `GET /api/purchase/phones` - List phones
  - `POST /api/purchase/phones` - Add phone
  - `PATCH /api/purchase/phones/:id` - Update phone

### Stock Management
- **Page**: `/purchase/stock`
- **Backend Endpoints**:
  - `GET /api/purchase/stock` - Stock levels
  - `PATCH /api/purchase/stock/:id` - Update stock

### Bulk Purchase
- **Page**: `/purchase/bulk`
- **Backend Endpoints**:
  - `GET /api/purchase/bulk` - Bulk purchases
  - `POST /api/purchase/bulk` - Create bulk order

---

## 🛍️ Sale Staff APIs

### Dashboard
- **Page**: `/sale/dashboard`
- **Backend Endpoints**:
  - `GET /api/sale/dashboard` - Sales overview

### Invoices
- **Page**: `/sale/invoices`
- **Backend Endpoints**:
  - `GET /api/sale/invoice` - List sales invoices
  - `POST /api/sale/invoice` - Create invoice
  - `PATCH /api/sale/invoice/:id` - Update invoice

---

## 💼 Sales Agent APIs

### Dashboard
- **Page**: `/sales-agent/dashboard`
- **Backend Endpoints**:
  - `GET /api/sales-agent/dashboard` - Agent stats

### Referrals
- **Page**: `/sales-agent/referrals`
- **Backend Endpoints**:
  - `GET /api/sales-agent/referrals` - List referrals
  - `GET /api/sales-agent/referrals/stats` - Referral statistics

### Commissions
- **Page**: `/sales-agent/commissions`
- **Backend Endpoints**:
  - `GET /api/sales-agent/commissions` - Commission history
  - `GET /api/sales-agent/commissions/stats` - Commission stats

---

## 📤 File Upload APIs

### Image Upload
- **Used in**: Any form with image upload
- **Backend Endpoint**: `POST /api/upload/image`
- **Request**: FormData with `file` field
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "url": "https://cloudinary-url...",
      "publicId": "public_id"
    }
  }
  ```

### Image Delete
- **Backend Endpoint**: `POST /api/upload/delete`
- **Request Body**: `{ "publicId": "public_id" }`

---

## 🔄 Branch Context Injection

All API requests automatically include `branchId` in query params for BRANCH_ADMIN users.

```javascript
// In client.js
const withBranch = (obj = {}) => {
  const branchId = branchContext.get();
  return branchId ? { ...obj, branchId } : obj;
};
```

This ensures:
- BRANCH_ADMIN queries filtered to their branch
- BILLING/SALE/PURCHASE staff queries use their fixed branch
- Safe to send for all roles

---

## 🛡️ Error Handling

All API responses follow pattern:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { /* response data */ }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 500 | Server error |

---

## 📝 Example API Usage

### Get List of Invoices
```javascript
import { billingApi } from '@/shared/api/billing';

const fetchInvoices = async () => {
  try {
    const { data } = await billingApi.getInvoices({
      page: 1,
      limit: 10,
      status: 'PENDING'
    });
    setInvoices(data);
  } catch (error) {
    console.error('Failed to fetch invoices:', error.message);
  }
};
```

### Create New Invoice
```javascript
const createInvoice = async (formData) => {
  try {
    const { data } = await billingApi.createInvoice({
      amount: formData.amount,
      description: formData.description,
      dueDate: formData.dueDate,
      status: 'DRAFT'
    });
    setInvoices([...invoices, data]);
  } catch (error) {
    console.error('Failed to create invoice:', error.message);
  }
};
```

### Upload Image
```javascript
import { uploadApi } from '@/shared/api/upload';

const handleImageUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await uploadApi.uploadImage(formData);
    setImageUrl(data.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

---

## ✅ Integration Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:5000`
- [ ] JWT tokens working (login successful)
- [ ] Protected routes showing correct dashboards
- [ ] API calls returning data in browser console
- [ ] Forms submitting data correctly
- [ ] Error messages displaying properly

---

## 🔗 Full Request/Response Flow

```
User Action (e.g., click "Create Invoice")
    ↓
Component calls billingApi.createInvoice(data)
    ↓
api.post() adds token to headers + branchId to body
    ↓
HTTP POST /api/invoice with Authorization header
    ↓
Backend validates token & permissions
    ↓
Backend processes request, saves to MongoDB
    ↓
Returns { success: true, data: {...} }
    ↓
Frontend receives response
    ↓
Component updates state & re-renders
    ↓
User sees new invoice in list
```

---

This integration guide ensures every frontend component has corresponding backend API support for a seamless user experience.
