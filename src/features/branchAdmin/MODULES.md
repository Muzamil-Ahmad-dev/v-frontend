# Branch Admin Financial Modules Documentation

This document provides a comprehensive overview of all financial management modules in the Branch Admin section.

## Module Overview

### 1. **Ledger Module** (`/ledger`)
**File:** `LedgerPage.jsx`

**Purpose:** Manage main general ledger entries (debit/credit transactions)

**Features:**
- Create, read, update, delete ledger entries
- Filter by date range, type (debit/credit), and search term
- View summary statistics (count, total amount)
- Track all financial transactions
- Support for reference numbers and notes

**API Endpoints:**
```
GET /api/ledger - Get all ledger records
POST /api/ledger - Create ledger entry
PUT /api/ledger/:id - Update ledger entry
DELETE /api/ledger/:id - Delete ledger entry
GET /api/ledger/summary - Get ledger summary
```

**Key Fields:**
- Description (string)
- Amount (number)
- Date (date)
- Type (debit/credit)
- Reference (string)
- Notes (text)

---

### 2. **Bank Module** (`/bank`)
**File:** `BankPage.jsx`

**Purpose:** Manage bank accounts and transactions

**Features:**
- Add and manage multiple bank accounts
- Track bank account balances
- Record deposits and withdrawals
- View transaction history per account
- Support for different account types (checking, savings, business)

**API Endpoints:**
```
GET /api/bank - Get all bank accounts
POST /api/bank - Create bank account
DELETE /api/bank/:id - Delete bank account
GET /api/bank/:id/transactions - Get account transactions
POST /api/bank/:id/transactions - Add transaction
```

**Key Fields:**
- Bank Name (string)
- Account Number (string)
- Account Holder (string)
- Balance (number)
- Account Type (checking/savings/business)
- Transaction Type (deposit/withdrawal)
- Reference Number (string)

---

### 3. **Expense Module** (`/expense`)
**File:** `ExpensePage.jsx`

**Purpose:** Track and manage business expenses

**Features:**
- Record various expense categories
- Filter by date range, category, and search
- Track payment methods (cash, bank, check)
- View expense summary and totals
- Support for multiple expense categories

**API Endpoints:**
```
GET /api/expense - Get all expenses
POST /api/expense - Create expense
DELETE /api/expense/:id - Delete expense
GET /api/expense/categories - Get all categories
```

**Key Fields:**
- Expense Category (string)
- Amount (number)
- Date (date)
- Description (text)
- Payment Method (cash/bank/check)
- Bank Account (if bank payment)
- Reference Number (string)

---

### 4. **Pocket Cash Module** (`/pocketCash`)
**File:** `PocketCashPage.jsx`

**Purpose:** Manage petty cash and small cash transactions

**Features:**
- Track pocket cash additions and deductions
- View current balance
- Record transaction history
- Support for add/deduct operations
- Track with descriptions and references

**API Endpoints:**
```
GET /api/pocket-cash - Get all pocket cash transactions
POST /api/pocket-cash - Add pocket cash transaction
DELETE /api/pocket-cash/:id - Delete transaction
GET /api/pocket-cash/balance - Get current balance
```

**Key Fields:**
- Amount (number)
- Type (add/deduct)
- Date (date)
- Description (text)
- Reference (string)

---

### 5. **Party Ledger Module** (`/partyLedger`)
**File:** `PartyLedgerPage.jsx`

**Purpose:** Manage customer and supplier information with balances

**Features:**
- Add and manage parties (customers/suppliers)
- Track party balances
- Store contact information
- Filter by party type
- Record additional notes

**API Endpoints:**
```
GET /api/party - Get all parties
POST /api/party - Create party
PUT /api/party/:id - Update party
DELETE /api/party/:id - Delete party
GET /api/party/balance/:id - Get party balance
```

**Key Fields:**
- Party Name (string)
- Party Type (customer/supplier)
- Contact Person (string)
- Phone (string)
- Email (string)
- Address (text)
- Balance (number)
- Notes (text)

---

### 6. **Committee Module** (`/committee`)
**File:** `CommitteePage.jsx`

**Purpose:** Manage committee fund and member contributions

**Features:**
- Track member contributions
- Record withdrawals and dividends
- View total fund balance
- Filter by member name and date
- Support for different transaction types

**API Endpoints:**
```
GET /api/committee - Get all committee entries
POST /api/committee - Create committee entry
DELETE /api/committee/:id - Delete entry
GET /api/committee/total - Get total fund
GET /api/committee/member/:id - Get member details
```

**Key Fields:**
- Member Name (string)
- Amount (number)
- Type (contribution/withdrawal/dividend)
- Date (date)
- Description (text)
- Reference (string)

---

### 7. **Purchase Module** (`/purchase`)
**File:** `PurchasePage.jsx`

**Purpose:** Manage purchase orders and supplier purchases

**Features:**
- Record purchase transactions
- Track purchase status (pending/completed)
- Vendor management
- Filter by date range and status
- Record purchase reference/PO numbers

**API Endpoints:**
```
GET /api/purchase - Get all purchases
POST /api/purchase - Create purchase
PUT /api/purchase/:id - Update purchase
DELETE /api/purchase/:id - Delete purchase
GET /api/purchase/:id - Get purchase details
```

**Key Fields:**
- Vendor Name (string)
- Phone (string)
- Amount (number)
- Date (date)
- Status (pending/completed)
- Description (text)
- Items (array)
- Reference/PO Number (string)

---

### 8. **Sale Module** (`/sale`)
**File:** `SalePage.jsx`

**Purpose:** Manage customer sales and transactions

**Features:**
- Record customer sales
- Track payment method (cash, card, bank transfer, check)
- Support for invoice generation
- Track sale status (pending/completed)
- Download invoice as PDF
- Store customer information

**API Endpoints:**
```
GET /api/sale - Get all sales
POST /api/sale - Create sale
PUT /api/sale/:id - Update sale
DELETE /api/sale/:id - Delete sale
GET /api/sale/:id/invoice/pdf - Download invoice PDF
```

**Key Fields:**
- Customer Name (string)
- Phone (string)
- Email (string)
- Amount (number)
- Date (date)
- Payment Method (cash/card/bank/check)
- Status (pending/completed)
- Description (text)
- Invoice Number (string)
- Items (array)

---

## Common Features Across All Modules

### 1. **Filtering & Search**
- Date range filtering (start date - end date)
- Text search functionality
- Category/type filtering
- Status filtering (where applicable)

### 2. **Form Management**
- Create new entries
- Edit existing entries
- Delete with confirmation
- Reset form functionality
- Loading states during operations

### 3. **Summary Statistics**
- Total count of entries
- Total amount calculations
- Type-wise breakdown
- Status summaries

### 4. **Table Display**
- Responsive tables with horizontal scrolling
- Alternating row colors
- Date formatting
- Amount formatting with locale strings
- Status badges with color coding

### 5. **Toast Notifications**
- Success messages on create/update/delete
- Error messages with API feedback
- Warning for destructive actions

---

## API Base Configuration

All modules use the centralized API client from `/shared/api/client.js`

```javascript
// Base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// All requests include:
- Authentication headers
- Error handling
- Response transformation
- Automatic retry logic
```

---

## Data Flow Diagram

```
Branch Admin Pages
    ↓
[Ledger, Bank, Expense, etc.]
    ↓
API Calls
    ↓
/shared/api/* (API modules)
    ↓
API Client
    ↓
Backend API Endpoints
    ↓
Database
```

---

## Integration Notes

### Backend Requirements

Each module requires corresponding backend API endpoints:

1. **Ledger API**
   - Base: `/api/ledger`
   - Methods: GET, POST, PUT, DELETE, GET (summary)

2. **Bank API**
   - Base: `/api/bank`
   - Methods: GET, POST, DELETE
   - Sub-resource: `/transactions`

3. **Expense API**
   - Base: `/api/expense`
   - Methods: GET, POST, DELETE
   - Sub-resource: `/categories`

4. **Pocket Cash API**
   - Base: `/api/pocket-cash`
   - Methods: GET, POST, DELETE
   - Sub-resource: `/balance`

5. **Party API**
   - Base: `/api/party`
   - Methods: GET, POST, PUT, DELETE
   - Sub-resource: `/balance/:id`

6. **Committee API**
   - Base: `/api/committee`
   - Methods: GET, POST, DELETE
   - Sub-resource: `/total`, `/member/:id`

7. **Purchase API**
   - Base: `/api/purchase`
   - Methods: GET, POST, PUT, DELETE

8. **Sale API**
   - Base: `/api/sale`
   - Methods: GET, POST, PUT, DELETE
   - Sub-resource: `/:id/invoice/pdf`

---

## Styling & UI

All modules follow the same design patterns:

- **Primary Color:** `bg-blue-600` for actions
- **Success Color:** `bg-green-600` for save operations
- **Danger Color:** `bg-red-600` for delete operations
- **Warning Color:** `bg-yellow-600` for pending status
- **Background:** `bg-gray-50` for page background
- **Cards:** `bg-white` with `shadow`

### Common Components

- Filter bar with inputs
- Summary cards showing statistics
- Form for create/edit operations
- Data table with actions
- Toast notifications

---

## Usage Example

```jsx
import LedgerPage from '@/features/branchAdmin/ledger/LedgerPage';
import BankPage from '@/features/branchAdmin/bank/BankPage';
import ExpensePage from '@/features/branchAdmin/expense/ExpensePage';

// In routing configuration
<Route path="/branch-admin/ledger" element={<LedgerPage />} />
<Route path="/branch-admin/bank" element={<BankPage />} />
<Route path="/branch-admin/expense" element={<ExpensePage />} />
```

---

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## Future Enhancements

1. **Reporting & Analytics**
   - Financial reports (P&L, balance sheet)
   - Chart visualizations
   - Trend analysis

2. **Advanced Features**
   - Multi-currency support
   - Recurring transactions
   - Budget management
   - Approval workflows

3. **Integration**
   - Bank statement import
   - Automatic reconciliation
   - Tax calculation

4. **Performance**
   - Pagination for large datasets
   - Lazy loading
   - Search optimization

---

## Support & Maintenance

For issues or feature requests related to financial modules:
1. Check the API endpoints are correctly configured
2. Verify backend is running and accessible
3. Check browser console for errors
4. Review API response structure
5. Contact development team

---

*Last Updated: July 6, 2026*
*Version: 1.0*
