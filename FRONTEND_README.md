# OKIEE Frontend - Complete Platform UI

**Production-ready React / Vite frontend** fully integrated with the OKIEE backend, featuring role-based dashboards, multi-level administration, and comprehensive business operations management.

> **Version**: 1.0.0 (Final-Frontend Integrated)  
> **Status**: ✅ Ready for Production  
> **Framework**: React 18 + Vite + React Router v6

---

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL=http://localhost:5000

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

App runs on `http://localhost:5173`

---

## 👥 Role-Based Access Control

Eight complete role dashboards with unique layouts and permissions:

| Role | Dashboard | Primary Functions |
|------|-----------|-------------------|
| **SUPER_ADMIN** | `/superadmin/dashboard` | Platform management, approvals, analytics |
| **ADMIN** | `/admin/dashboard` | Company administration, branch oversight |
| **BRANCH_ADMIN** | `/branch-admin/dashboard` | Branch management, staff, inventory, operations |
| **SALES_AGENT** | `/sales-agent/dashboard` | Referrals, commissions tracking |
| **BILLING_STAFF** | `/billing/dashboard` | Invoicing, accounting, financial reports |
| **SALE_STAFF** | `/sale/dashboard` | Sales operations, invoices |
| **PURCHASE_STAFF** | `/purchase/dashboard` | Inventory, purchasing, stock |
| **SHOP_OWNER** | (Placeholder) | Shop operations |

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx               # Root component
│   │   ├── routes.jsx            # All route definitions (8 role layouts)
│   │   └── guards.jsx            # Protected & guest routes
│   │
│   ├── features/                 # Role-specific modules
│   │   ├── admin/                # Admin dashboard, staff, branches
│   │   ├── auth/                 # Login, registration, email verification
│   │   ├── billing/              # Invoices, wallet, finance suite
│   │   ├── branchAdmin/          # Branch ops, inventory, repairs, staff
│   │   ├── purchase/             # Phones, accessories, bulk, stock
│   │   ├── sale/                 # Sale invoices, operations
│   │   ├── sales_agent/          # Referrals, commissions
│   │   └── superadmin/           # Platform admin, registrations, users
│   │
│   ├── shared/
│   │   ├── api/                  # API service layer
│   │   │   ├── client.js         # Fetch client with auth
│   │   │   ├── auth.js           # Auth endpoints
│   │   │   ├── admin.js          # Admin endpoints
│   │   │   ├── billing.js        # Billing/Ledger endpoints
│   │   │   ├── purchase.js       # Purchase endpoints
│   │   │   ├── sale.js           # Sale endpoints
│   │   │   ├── repair.js         # Repair endpoints
│   │   │   ├── upload.js         # File upload endpoints
│   │   │   ├── branchAdmin.js    # Branch admin endpoints
│   │   │   ├── superadmin.js     # Super admin endpoints
│   │   │   └── salesagent.js     # Sales agent endpoints
│   │   │
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Tables/
│   │   │   ├── Forms/
│   │   │   ├── Modals/
│   │   │   └── ... (more components)
│   │   │
│   │   ├── layout/               # Role-specific layouts
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── SuperAdminLayout.jsx
│   │   │   ├── BranchAdminLayout.jsx
│   │   │   ├── StaffLayout.jsx
│   │   │   └── SalesAgentLayout.jsx
│   │   │
│   │   └── utils/
│   │       ├── AuthContext.jsx   # Auth state management
│   │       ├── BranchContext.jsx # Branch context
│   │       ├── helpers.js        # Utility functions
│   │       └── constants.js      # App constants
│   │
│   ├── index.css                 # Tailwind + custom styles
│   └── main.jsx                  # Entry point
│
├── public/                       # Static assets
├── .env.example                  # Environment template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind theme
├── package.json
└── FRONTEND_README.md           # This file
```

---

## 🔌 Backend Integration

All API calls go through `/src/shared/api/` service layer with automatic:
- JWT token management
- Branch context injection
- Error handling
- Response parsing

### Configuration

Set `VITE_API_BASE_URL` in `.env` to point to your backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🔐 Authentication Flow

```
Login Page (/login)
    ↓
POST /api/auth/login
    ↓ (success)
Store JWT token + user data
    ↓
Redirect to role dashboard
    ↓ (protected by ProtectedRoute)
AuthContext verifies token
    ↓
Render role-specific layout
```

### Token Management

- Tokens stored in localStorage
- Automatically sent in every request header
- Auto-refresh on `/api/auth/refresh-token` (implement as needed)
- Cleared on logout

---

## 🛣️ Route Structure

### Public Routes
```
/login              Login page
/register           Registration page
```

### Protected Routes (by role)
```
/superadmin/*       Super Admin dashboard & operations
/admin/*            Admin dashboard & operations
/branch-admin/*     Branch Admin dashboard & operations
/sales-agent/*      Sales Agent dashboard & commissions
/billing/*          Billing Staff dashboard & operations
/sale/*             Sale Staff dashboard & operations
/purchase/*         Purchase Staff dashboard & operations
```

### Role-Specific Sub-routes

**Super Admin**
- `/superadmin/dashboard` - Analytics & overview
- `/superadmin/registrations` - Pending approvals
- `/superadmin/users` - User management
- `/superadmin/sales-agents` - Sales agent management
- `/superadmin/negotiation-activity` - Negotiation logs

**Admin**
- `/admin/dashboard` - Company overview
- `/admin/branch-admins` - Branch admin management

**Branch Admin**
- `/branch-admin/dashboard` - Branch statistics
- `/branch-admin/branches` - Branch management
- `/branch-admin/staff` - Staff management
- `/branch-admin/shops` - Shop management
- `/branch-admin/inventory` - Inventory management
- `/branch-admin/repairs` - Repair jobs
- `/branch-admin/catalog` - Product catalog
- `/branch-admin/purchase/*` - Full purchase module
- `/branch-admin/sale/*` - Full sale module
- `/branch-admin/billing/*` - Full billing/finance module

**Billing Staff**
- `/billing/dashboard` - Billing overview
- `/billing/invoices` - Invoice management
- `/billing/wallet/*` - Bank accounts & transactions
- `/billing/finance/*` - Ledger, reports, accounting

**Sale Staff**
- `/sale/dashboard` - Sales overview
- `/sale/invoices` - Sale invoices

**Purchase Staff**
- `/purchase/dashboard` - Purchase overview
- `/purchase/phones` - Phone inventory
- `/purchase/accessories` - Accessories
- `/purchase/stock` - Stock management
- `/purchase/bulk` - Bulk purchases

**Sales Agent**
- `/sales-agent/dashboard` - Commission & referral stats
- `/sales-agent/referrals` - Referred admins
- `/sales-agent/commissions` - Commission history

---

## 📡 API Service Layer

### Usage Pattern

```javascript
import { billingApi } from '@/shared/api/billing';

// List invoices
const invoices = await billingApi.getInvoices({ page: 1, limit: 10 });

// Get single invoice
const invoice = await billingApi.getInvoice(invoiceId);

// Create invoice
const newInvoice = await billingApi.createInvoice({
  amount: 10000,
  description: 'Monthly billing',
  // ... other fields
});

// Update invoice
const updated = await billingApi.updateInvoice(invoiceId, { status: 'PAID' });

// Delete invoice
await billingApi.deleteInvoice(invoiceId);
```

### Available Services

| Import | Endpoints |
|--------|-----------|
| `billingApi` | Invoices, ledger, banks, expenses, reports |
| `saleApi` | Sale invoices, dashboard |
| `purchaseApi` | Phones, accessories, bulk, stock |
| `repairApi` | Repair jobs, status updates |
| `uploadApi` | Image uploads to Cloudinary |
| `authApi` | Login, registration, verification |
| `adminApi` | Admin operations |
| `branchAdminApi` | Branch operations |
| `superadminApi` | Platform administration |
| `salesagentApi` | Referrals, commissions |

---

## 🎨 UI Components & Styling

### Tailwind CSS

- Pre-configured with custom theme
- Responsive design (mobile-first)
- Dark mode support (optional)

### Component Library

Located in `/src/shared/components/`:

- **Tables** - Data tables with sorting, filtering, pagination
- **Forms** - Reusable form components with validation
- **Modals** - Dialog components for actions
- **Headers** - Navigation headers
- **Sidebars** - Role-specific navigation
- **Cards** - Data display cards

### Custom Styling

- `/src/index.css` - Global styles & Tailwind imports
- Per-component CSS modules (optional)

---

## 🔄 State Management

### Authentication Context

```javascript
import { useAuth } from '@/shared/utils/AuthContext';

export default function MyComponent() {
  const { user, token, login, logout } = useAuth();
  
  return (
    <div>
      {user && <p>Welcome, {user.name}!</p>}
    </div>
  );
}
```

### Branch Context (Branch Admin)

```javascript
import { useBranchContext } from '@/shared/utils/BranchContext';

export default function MyComponent() {
  const { activeBranch, branches, selectBranch } = useBranchContext();
  
  return <div>Current branch: {activeBranch?.name}</div>;
}
```

---

## ⚡ Performance Optimizations

- Code splitting per role/feature
- Lazy loading of routes
- Optimized images
- Memoized components where needed

---

## 🚀 Building for Production

```bash
# Build optimized bundle
npm run build

# The dist/ folder is ready to deploy
```

### Deployment

Can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

Set `VITE_API_BASE_URL` to production backend URL before building.

---

## 🧪 Development

### Hot Module Replacement (HMR)

- Automatic on file change
- React Fast Refresh enabled
- No full page reload

### Console Debugging

- Dev tools available in browser console
- Network tab for API debugging
- React DevTools extension recommended

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-dom` | React rendering |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client (alternative to fetch) |
| `tailwindcss` | CSS framework |
| `lucide-react` | Icon library |
| `react-icons` | Additional icons |
| `framer-motion` | Animations |
| `vite` | Build tool |

---

## 🔗 Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:5000` |
| `VITE_APP_NAME` | App name | `OKIEE Platform` |
| `VITE_APP_VERSION` | App version | `1.0.0` |
| `VITE_ENABLE_ANALYTICS` | Analytics | `false` |
| `VITE_ENABLE_NOTIFICATIONS` | Notifications | `true` |

---

## 🐛 Troubleshooting

### CORS Errors

```
Solution: Ensure backend has CORS enabled for frontend URL
Check: Backend .env has correct CORS_ORIGIN
```

### 404 Routes

```
Solution: Verify ProtectedRoute is checking correct role
Check: User token has correct role in decoded JWT
```

### API Errors

```
Solution: Check browser network tab for failed requests
Check: Backend server is running and accessible
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

---

## 🤝 Integration with Backend

See [Backend SETUP.md](../backend/SETUP.md) for backend configuration.

### Running Both Locally

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev    # Runs on :5000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev    # Runs on :5173
```

---

## 📄 License

**Proprietary** - OKIEE Platform  
Unauthorized use, copying, or distribution is prohibited.

---

**Version 1.0.0** | Last Updated: July 2026  
Built with ❤️ for OKIEE Platform
