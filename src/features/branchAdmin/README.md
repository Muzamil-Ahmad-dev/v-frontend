# Branch Admin Module - Complete Setup Guide

Welcome! This guide covers all the new financial management modules integrated into the Branch Admin section.

## 🎯 Overview

The Branch Admin section now includes **8 comprehensive financial modules** designed to manage all business operations:

### **Financial Management** (6 modules)
1. **Ledger** - General ledger with debit/credit entries
2. **Bank** - Bank account management and transactions
3. **Expense** - Business expense tracking
4. **Pocket Cash** - Petty cash management
5. **Party Ledger** - Customer and supplier management
6. **Committee** - Committee fund and member contributions

### **Sales & Purchase** (2 modules)
7. **Purchase** - Purchase orders and vendor tracking
8. **Sale** - Customer sales and invoice generation

---

## 📁 Directory Structure

```
src/features/branchAdmin/
├── ledger/
│   └── LedgerPage.jsx
├── bank/
│   └── BankPage.jsx
├── expense/
│   └── ExpensePage.jsx
├── pocketCash/
│   └── PocketCashPage.jsx
├── partyLedger/
│   └── PartyLedgerPage.jsx
├── committee/
│   └── CommitteePage.jsx
├── purchase/
│   └── PurchasePage.jsx
├── sale/
│   └── SalePage.jsx
├── index.js              # Export all modules and routes
├── MODULES.md           # Detailed module documentation
└── README.md            # This file
```

---

## 🚀 Quick Start

### 1. **Import Modules**

```javascript
import {
  LedgerPage,
  BankPage,
  ExpensePage,
  PocketCashPage,
  PartyLedgerPage,
  CommitteePage,
  PurchasePage,
  SalePage,
  BRANCH_ADMIN_ROUTES,
} from '@/features/branchAdmin';
```

### 2. **Setup Routes**

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as BranchAdmin from '@/features/branchAdmin';

<Routes>
  {/* Financial Management */}
  <Route path="/branch-admin/ledger" element={<BranchAdmin.LedgerPage />} />
  <Route path="/branch-admin/bank" element={<BranchAdmin.BankPage />} />
  <Route path="/branch-admin/expense" element={<BranchAdmin.ExpensePage />} />
  <Route path="/branch-admin/pocket-cash" element={<BranchAdmin.PocketCashPage />} />
  <Route path="/branch-admin/party-ledger" element={<BranchAdmin.PartyLedgerPage />} />
  <Route path="/branch-admin/committee" element={<BranchAdmin.CommitteePage />} />

  {/* Sales & Purchase */}
  <Route path="/branch-admin/purchase" element={<BranchAdmin.PurchasePage />} />
  <Route path="/branch-admin/sale" element={<BranchAdmin.SalePage />} />
</Routes>
```

### 3. **Create Navigation Menu**

```javascript
import { BRANCH_ADMIN_ROUTES, FINANCIAL_MODULES } from '@/features/branchAdmin';

const FinancialMenu = () => (
  <div>
    {FINANCIAL_MODULES.map((module) => (
      <Link key={module.path} to={module.path}>
        <span>{module.icon}</span>
        {module.name}
      </Link>
    ))}
  </div>
);
```

---

## 📋 Module Details

### **1. Ledger Module** 
**Path:** `/branch-admin/ledger`

**Purpose:** Manage general ledger entries with debit/credit transactions

**Features:**
- ✅ Create/Edit/Delete entries
- ✅ Filter by date range, type, and search
- ✅ View summary statistics
- ✅ Support for references and notes

**Form Fields:**
```javascript
{
  description: string,
  amount: number,
  date: date,
  type: 'debit' | 'credit',
  reference: string,
  notes: string
}
```

---

### **2. Bank Module**
**Path:** `/branch-admin/bank`

**Purpose:** Manage bank accounts and all transactions

**Features:**
- ✅ Add multiple bank accounts
- ✅ Track account balances
- ✅ Record deposits and withdrawals
- ✅ View transaction history
- ✅ Support for account types (checking, savings, business)

**Form Fields:**
```javascript
// Bank Account
{
  bankName: string,
  accountNumber: string,
  accountHolder: string,
  balance: number,
  accountType: 'checking' | 'savings' | 'business'
}

// Transaction
{
  amount: number,
  type: 'deposit' | 'withdrawal',
  date: date,
  description: string,
  referenceNumber: string
}
```

---

### **3. Expense Module**
**Path:** `/branch-admin/expense`

**Purpose:** Track and manage business expenses

**Features:**
- ✅ Multiple expense categories
- ✅ Filter by date, category, and search
- ✅ Track payment methods
- ✅ View expense summary and totals
- ✅ Delete expense records

**Form Fields:**
```javascript
{
  expenseCategory: string,
  amount: number,
  date: date,
  description: string,
  paymentMethod: 'cash' | 'bank' | 'check',
  bankAccount: string,
  reference: string
}
```

---

### **4. Pocket Cash Module**
**Path:** `/branch-admin/pocket-cash`

**Purpose:** Manage petty cash and small cash transactions

**Features:**
- ✅ Track cash additions and deductions
- ✅ View current balance
- ✅ Transaction history with date filter
- ✅ Support for references and descriptions

**Form Fields:**
```javascript
{
  amount: number,
  type: 'add' | 'deduct',
  date: date,
  description: string,
  reference: string
}
```

---

### **5. Party Ledger Module**
**Path:** `/branch-admin/party-ledger`

**Purpose:** Manage customers and suppliers with balance tracking

**Features:**
- ✅ Add and manage parties (customers/suppliers)
- ✅ Track party balances
- ✅ Store comprehensive contact info
- ✅ Filter by party type
- ✅ Record notes and additional info

**Form Fields:**
```javascript
{
  partyName: string,
  partyType: 'customer' | 'supplier',
  contactPerson: string,
  phone: string,
  email: string,
  address: string,
  balance: number,
  notes: string
}
```

---

### **6. Committee Module**
**Path:** `/branch-admin/committee`

**Purpose:** Manage committee fund and member contributions

**Features:**
- ✅ Track member contributions
- ✅ Record withdrawals and dividends
- ✅ View total fund balance
- ✅ Filter by member and date
- ✅ Multiple transaction types

**Form Fields:**
```javascript
{
  memberName: string,
  amount: number,
  type: 'contribution' | 'withdrawal' | 'dividend',
  date: date,
  description: string,
  reference: string
}
```

---

### **7. Purchase Module**
**Path:** `/branch-admin/purchase`

**Purpose:** Manage purchase orders and supplier purchases

**Features:**
- ✅ Record purchase transactions
- ✅ Track status (pending/completed)
- ✅ Vendor management
- ✅ Filter by date and status
- ✅ Record PO numbers and references

**Form Fields:**
```javascript
{
  vendorName: string,
  phone: string,
  amount: number,
  date: date,
  description: string,
  items: array,
  status: 'pending' | 'completed',
  reference: string
}
```

---

### **8. Sale Module**
**Path:** `/branch-admin/sale`

**Purpose:** Manage customer sales and transactions

**Features:**
- ✅ Record customer sales
- ✅ Track payment methods (cash, card, bank, check)
- ✅ Support for invoice generation
- ✅ Download invoice as PDF
- ✅ Track sale status
- ✅ Store customer information

**Form Fields:**
```javascript
{
  customerName: string,
  phone: string,
  email: string,
  amount: number,
  date: date,
  description: string,
  items: array,
  status: 'pending' | 'completed',
  reference: string,
  paymentMethod: 'cash' | 'card' | 'bank' | 'check'
}
```

---

## 🔌 API Integration

All modules communicate with backend APIs through the centralized API client:

### **API Base Configuration**
```javascript
// File: src/shared/api/client.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### **Available API Modules**

1. **ledgerAPI** - `/api/ledger`
2. **bankAPI** - `/api/bank`
3. **expenseAPI** - `/api/expense`
4. **partyAPI** - `/api/party`
5. **purchaseAPI** - `/api/purchase`
6. **saleAPI** - `/api/sale`

### **Usage Example**

```javascript
import { ledgerAPI } from '@/shared/api/ledger';

// Get all ledger entries
const response = await ledgerAPI.getAll({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Create new entry
await ledgerAPI.create({
  description: 'Rent Payment',
  amount: 10000,
  date: '2024-01-15',
  type: 'debit',
  reference: 'CHQ001'
});

// Update entry
await ledgerAPI.update(id, { amount: 15000 });

// Delete entry
await ledgerAPI.delete(id);
```

---

## 🎨 Styling & Design

All modules follow consistent design patterns:

### **Color Scheme**
- **Primary Action:** `bg-blue-600`
- **Success/Add:** `bg-green-600`
- **Delete/Danger:** `bg-red-600`
- **Warning/Pending:** `bg-yellow-600`
- **Info/Supplier:** `bg-purple-600`
- **Background:** `bg-gray-50`
- **Cards:** `bg-white with shadow`

### **Responsive Layout**
- Mobile-first design
- Responsive grids (md:, lg: breakpoints)
- Horizontal scrolling for tables on mobile
- Touch-friendly buttons and inputs

### **Common UI Components**
- Filter bars with date inputs
- Summary statistics cards
- Create/Edit forms
- Data tables with actions
- Toast notifications
- Loading states

---

## 💾 Data Persistence

Each module manages its own state using React hooks:

```javascript
const [entries, setEntries] = useState([]);
const [loading, setLoading] = useState(false);
const [formVisible, setFormVisible] = useState(false);
const [filters, setFilters] = useState({...});
const [summary, setSummary] = useState({...});
```

### **State Management Flow**

```
Component Mount
    ↓
fetchData() via API
    ↓
setEntries(response.data)
    ↓
applyFilters(entries)
    ↓
updateSummary()
    ↓
Render updated UI
```

---

## 🔄 Common Operations

### **Creating a New Entry**

```javascript
const handleCreate = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    await ledgerAPI.create(formData);
    toast.success('Entry created successfully');
    resetForm();
    fetchLedgers(); // Refresh data
  } catch (error) {
    toast.error('Failed to create entry');
  } finally {
    setLoading(false);
  }
};
```

### **Filtering Data**

```javascript
const applyFilters = (data) => {
  let filtered = data;
  
  if (filters.searchTerm) {
    filtered = filtered.filter(item =>
      item.description.toLowerCase().includes(filters.searchTerm)
    );
  }
  
  setFilteredLedgers(filtered);
  updateSummary(filtered);
};
```

### **Deleting with Confirmation**

```javascript
const handleDelete = async (id) => {
  if (window.confirm('Are you sure?')) {
    try {
      await ledgerAPI.delete(id);
      toast.success('Deleted successfully');
      fetchLedgers();
    } catch (error) {
      toast.error('Failed to delete');
    }
  }
};
```

---

## 📱 Responsive Breakpoints

```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px
```

All modules are fully responsive with:
- Stacked layouts on mobile
- Grid layouts on tablet
- Multi-column layouts on desktop

---

## 🛠️ Troubleshooting

### **Issue: API calls failing**
- ✅ Check `REACT_APP_API_URL` environment variable
- ✅ Verify backend server is running
- ✅ Check browser console for CORS errors

### **Issue: Data not updating**
- ✅ Verify API response structure matches expected format
- ✅ Check loading state is properly managed
- ✅ Ensure `setEntries()` is called with API response

### **Issue: Form not submitting**
- ✅ Check form validation logic
- ✅ Verify API endpoint URL is correct
- ✅ Check network tab for failed requests

### **Issue: Toast notifications not appearing**
- ✅ Ensure `react-toastify` is installed
- ✅ Verify `ToastContainer` is in root component
- ✅ Check console for JavaScript errors

---

## 📚 Best Practices

### **Code Organization**
- ✅ Keep components focused and single-responsibility
- ✅ Extract common logic into utility functions
- ✅ Use constants for API endpoints and routes

### **Performance**
- ✅ Use React.memo for list items
- ✅ Implement pagination for large datasets
- ✅ Debounce search input

### **User Experience**
- ✅ Provide loading indicators during API calls
- ✅ Show clear error messages
- ✅ Confirm destructive actions
- ✅ Disable buttons while loading

### **Security**
- ✅ Validate inputs on client side
- ✅ Sanitize user input
- ✅ Use HTTPS for production
- ✅ Implement proper authentication

---

## 🎓 Learning Resources

- **React Hooks:** https://react.dev/reference/react
- **Axios:** https://axios-http.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Toastify:** https://fkhadra.github.io/react-toastify/introduction

---

## 📞 Support

For questions or issues:
1. Check the `MODULES.md` file for detailed module documentation
2. Review this README for common patterns
3. Check API endpoints in backend documentation
4. Review browser console for error messages

---

## 📝 Changelog

### Version 1.0 (July 6, 2026)
- ✅ Initial release with 8 modules
- ✅ Complete financial management system
- ✅ Sales and purchase tracking
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Filter and search functionality

---

**Happy coding! 🚀**

For more information, see `MODULES.md` for detailed module specifications.
