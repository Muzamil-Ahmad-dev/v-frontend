# Frontend Setup & Development Guide

Complete guide to setting up, configuring, and developing the OKIEE frontend.

---

## 📋 Prerequisites

- Node.js 16+ (check: `node --version`)
- npm, yarn, or pnpm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control)
- Text editor (VS Code recommended)

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env (important!)
# Open .env and ensure VITE_API_BASE_URL=http://localhost:5000

# 5. Start development server
npm run dev

# 6. Open browser
# Visit http://localhost:5173
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=OKIEE Platform
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

### Important Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_BASE_URL` | `http://localhost:5000` | Must match backend URL |
| `VITE_APP_NAME` | `OKIEE Platform` | Displayed in app header |
| `VITE_APP_VERSION` | `1.0.0` | Current version |

---

## 🚀 Development Server

### Start Server

```bash
npm run dev
```

Server runs on: **http://localhost:5173**

Features:
- Hot Module Replacement (HMR)
- Instant refresh on file changes
- Console shows compilation errors
- Accessible from `http://localhost:5173` or `http://127.0.0.1:5173`

### Network Access (Dev Only)

To access from another machine on your network:

```bash
# Find your machine IP
ipconfig /all              # Windows
ifconfig                   # macOS/Linux

# Edit vite.config.js:
export default defineConfig({
  server: {
    host: '0.0.0.0',      // Listen on all interfaces
    port: 5173,
  },
});

# Access from: http://<your-ip>:5173
```

---

## 📦 Package Management

### Using npm

```bash
# Install dependencies
npm install

# Add new package
npm install package-name

# Remove package
npm uninstall package-name

# Update packages
npm update
```

### Using pnpm (faster)

```bash
# Install pnpm first
npm install -g pnpm

# Then use pnpm instead of npm
pnpm install
pnpm add package-name
pnpm dev
```

---

## 🏗️ Build & Production

### Development Build

```bash
npm run dev
```

### Production Build

```bash
# Build optimized bundle
npm run build

# Output goes to: dist/
```

Bundle will be minimized and optimized for production.

### Preview Production Build

```bash
npm run preview
```

Runs production build locally on: http://localhost:4173

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx               # Root component
│   │   ├── routes.jsx            # All routes
│   │   └── guards.jsx            # Route guards
│   │
│   ├── features/                 # Feature modules by role
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── billing/
│   │   ├── branchAdmin/
│   │   ├── purchase/
│   │   ├── sale/
│   │   ├── sales_agent/
│   │   └── superadmin/
│   │
│   ├── shared/
│   │   ├── api/                  # API service layer
│   │   ├── components/           # Reusable components
│   │   ├── layout/               # Layout templates
│   │   └── utils/                # Utilities & contexts
│   │
│   ├── index.css                 # Global styles
│   └── main.jsx                  # Entry point
│
├── public/                       # Static assets
├── dist/                         # Build output (after build)
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── SETUP.md                     # This file
```

---

## 🔐 Authentication Setup

### Login Flow

1. User navigates to `/login`
2. Enters email and password
3. Frontend sends `POST /api/auth/login` to backend
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. User redirected to role-specific dashboard

### Test Login (After Backend Seed)

Default credentials (from backend seed):
- **Email**: `superadmin@okiee.com`
- **Password**: `SuperAdmin@123`
- **Role**: `SUPER_ADMIN`

### Verify Backend is Running

```bash
# In another terminal, check if backend is responding
curl http://localhost:5000/health
# Should return: { "status": "ok" }
```

---

## 🎨 Tailwind CSS

### Configuration

Located in `tailwind.config.js`:

```javascript
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
    },
  },
  plugins: [],
};
```

### Using Tailwind

```jsx
// In components
export default function Button() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Click me
    </button>
  );
}
```

### Custom Styling

Edit `src/index.css` for global styles:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Add custom styles */
.custom-class {
  @apply bg-gray-100 p-4 rounded;
}
```

---

## 🧠 State Management

### Authentication Context

Located in `src/shared/utils/AuthContext.jsx`:

```javascript
import { useAuth } from '@/shared/utils/AuthContext';

export default function MyComponent() {
  const { user, token, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user) return <div>Please login</div>;
  
  return (
    <div>
      <p>Welcome {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Branch Context (Branch Admin)

Located in `src/shared/utils/BranchContext.jsx`:

```javascript
import { useBranchContext } from '@/shared/utils/BranchContext';

export default function BranchSelector() {
  const { activeBranch, branches, selectBranch } = useBranchContext();
  
  return (
    <select 
      value={activeBranch?.id || ''}
      onChange={(e) => selectBranch(e.target.value)}
    >
      {branches.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  );
}
```

---

## 🔌 API Integration

### Using API Services

```javascript
import { billingApi } from '@/shared/api/billing';

// In component
const fetchInvoices = async () => {
  try {
    const { data } = await billingApi.getInvoices({ page: 1 });
    setInvoices(data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Available Services

- `authApi` - Authentication
- `adminApi` - Admin operations
- `billingApi` - Invoicing & accounting
- `saleApi` - Sales operations
- `purchaseApi` - Purchase operations
- `repairApi` - Repair jobs
- `uploadApi` - File uploads
- `branchAdminApi` - Branch admin
- `superadminApi` - Super admin
- `salesagentApi` - Sales agents

See [API_INTEGRATION.md](./API_INTEGRATION.md) for full documentation.

---

## 🐛 Debugging

### Browser DevTools

1. Open DevTools: **F12** or **Ctrl+Shift+I**
2. **Console** tab: View logs and errors
3. **Network** tab: View API requests/responses
4. **Application** tab: Check localStorage tokens

### Common Issues

#### "Failed to fetch" error
```
Problem: Backend not running or wrong URL
Solution: 
1. Check backend is running: npm run dev (in backend folder)
2. Verify VITE_API_BASE_URL in .env matches backend URL
3. Check no firewall blocking localhost:5000
```

#### "401 Unauthorized" error
```
Problem: Token missing or expired
Solution:
1. Login again
2. Check localStorage has token (DevTools > Application > localStorage)
3. Verify token is valid (decode at jwt.io)
```

#### Route not found (404)
```
Problem: Wrong role or missing authentication
Solution:
1. Verify you're logged in
2. Check your user role matches the route
3. Review route definitions in src/app/routes.jsx
```

### Console Logging

Add debug logs for troubleshooting:

```javascript
// In API calls
console.log('[v0] Fetching invoices...', params);

// In components
console.log('[v0] User data:', user);
console.log('[v0] Render invoice list:', invoices.length);
```

---

## 🚧 Development Workflow

### Creating a New Feature

1. **Create feature folder**
   ```
   src/features/myfeature/
   ├── components/
   ├── pages/
   └── hooks/
   ```

2. **Create page component**
   ```javascript
   // src/features/myfeature/pages/MyPage.jsx
   export default function MyPage() {
     return <div>My Feature</div>;
   }
   ```

3. **Add route**
   ```javascript
   // In src/app/routes.jsx
   import MyPage from '../features/myfeature/pages/MyPage';
   
   // Add to route definition
   <Route path="/myfeature" element={<MyPage />} />
   ```

4. **Add navigation**
   - Update sidebar or header with link to new route

### Component Best Practices

```javascript
// Functional component with hooks
import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/utils/AuthContext';
import { billingApi } from '@/shared/api/billing';

export default function InvoiceList() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await billingApi.getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {invoices.map(inv => (
        <div key={inv.id}>{inv.description}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Resources

### Documentation
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios](https://axios-http.com)

### Tools
- [VS Code](https://code.visualstudio.com) - Text editor
- [React DevTools](https://react-devtools-tutorial.vercel.app/) - Browser extension
- [Redux DevTools](https://extension.remotedev.io/) - For debugging
- [jwt.io](https://jwt.io) - Decode JWT tokens

---

## ✅ Checklist Before Production

- [ ] Backend running and accessible
- [ ] `.env` configured correctly
- [ ] Login working with test credentials
- [ ] All dashboards loading
- [ ] API calls working (check Network tab)
- [ ] Forms submitting data
- [ ] Error messages displaying
- [ ] No console errors in DevTools
- [ ] Responsive design on mobile
- [ ] Build completes without errors: `npm run build`

---

## 🚀 Deployment

### Build for Production

```bash
npm run build

# Creates dist/ folder with optimized bundle
```

### Deploy to Vercel

```bash
npm install -g vercel

vercel

# Follow prompts to deploy
```

### Deploy to Other Hosts

- **Netlify**: Drag & drop `dist/` folder
- **AWS S3 + CloudFront**: Upload `dist/` to S3
- **Docker**: Create Dockerfile with `npm run build && npm run preview`

---

## 📞 Troubleshooting

See [FRONTEND_README.md](./FRONTEND_README.md#-troubleshooting) for common issues and solutions.

---

**Happy Coding!** 🎉

For questions or issues, check the documentation files or the backend integration guide.
