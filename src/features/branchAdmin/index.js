// ============= PAGES EXPORT =============

// Dashboard
export { default as DashboardPage } from './dashboard/DashboardPage';

// Financial Management
export { default as LedgerPage } from './ledger/LedgerPage';
export { default as BankPage } from './bank/BankPage';
export { default as ExpensePage } from './expense/ExpensePage';
export { default as PocketCashPage } from './pocketCash/PocketCashPage';
export { default as PartyLedgerPage } from './partyLedger/PartyLedgerPage';
export { default as CommitteePage } from './committee/CommitteePage';

// Sales & Purchase
export { default as PurchasePage } from './purchase/PurchasePage';
export { default as SalePage } from './sale/SalePage';

// Operations
export { default as InventoryPage } from './inventory/InventoryPage';
export { default as RepairsPage } from './repairs/RepairsPage';
export { default as CatalogPage } from './catalog/CatalogPage';

// Management
export { default as BranchesPage } from './branches/BranchesPage';
export { default as ShopsPage } from './shops/ShopsPage';
export { default as StaffPage } from './staff/StaffPage';
export { default as ShopOwnersPage } from './shopOwners/ShopOwnersPage';

// System
export { default as NotificationsPage } from './notifications/NotificationsPage';

// ============= ROUTE CONFIGURATION =============

/**
 * Branch Admin Routes Configuration
 * 
 * Base Path: /branch-admin
 * 
 * Financial Management Routes:
 * - /branch-admin/ledger (General Ledger)
 * - /branch-admin/bank (Bank Accounts & Transactions)
 * - /branch-admin/expense (Expenses)
 * - /branch-admin/pocket-cash (Pocket Cash)
 * - /branch-admin/party-ledger (Customer/Supplier Ledger)
 * - /branch-admin/committee (Committee Fund)
 * 
 * Sales & Purchase Routes:
 * - /branch-admin/purchase (Purchases)
 * - /branch-admin/sale (Sales)
 * 
 * Operations Routes:
 * - /branch-admin/inventory (Inventory Management)
 * - /branch-admin/repairs (Repair Management)
 * - /branch-admin/catalog (Product Catalog)
 * 
 * Management Routes:
 * - /branch-admin/branches (Branch Management)
 * - /branch-admin/shops (Shop Management)
 * - /branch-admin/staff (Staff Management)
 * - /branch-admin/shop-owners (Shop Owner Management)
 * 
 * System Routes:
 * - /branch-admin/dashboard (Dashboard)
 * - /branch-admin/notifications (Notifications)
 */

export const BRANCH_ADMIN_ROUTES = {
  // Financial Management
  LEDGER: '/branch-admin/ledger',
  BANK: '/branch-admin/bank',
  EXPENSE: '/branch-admin/expense',
  POCKET_CASH: '/branch-admin/pocket-cash',
  PARTY_LEDGER: '/branch-admin/party-ledger',
  COMMITTEE: '/branch-admin/committee',

  // Sales & Purchase
  PURCHASE: '/branch-admin/purchase',
  SALE: '/branch-admin/sale',

  // Operations
  INVENTORY: '/branch-admin/inventory',
  REPAIRS: '/branch-admin/repairs',
  CATALOG: '/branch-admin/catalog',

  // Management
  BRANCHES: '/branch-admin/branches',
  SHOPS: '/branch-admin/shops',
  STAFF: '/branch-admin/staff',
  SHOP_OWNERS: '/branch-admin/shop-owners',

  // System
  DASHBOARD: '/branch-admin/dashboard',
  NOTIFICATIONS: '/branch-admin/notifications',
};

export const FINANCIAL_MODULES = [
  {
    name: 'Ledger',
    path: BRANCH_ADMIN_ROUTES.LEDGER,
    icon: 'Book',
    description: 'General ledger entries and transactions',
  },
  {
    name: 'Bank',
    path: BRANCH_ADMIN_ROUTES.BANK,
    icon: 'Building2',
    description: 'Bank accounts and transactions',
  },
  {
    name: 'Expense',
    path: BRANCH_ADMIN_ROUTES.EXPENSE,
    icon: 'TrendingDown',
    description: 'Business expenses tracking',
  },
  {
    name: 'Pocket Cash',
    path: BRANCH_ADMIN_ROUTES.POCKET_CASH,
    icon: 'Wallet',
    description: 'Petty cash management',
  },
  {
    name: 'Party Ledger',
    path: BRANCH_ADMIN_ROUTES.PARTY_LEDGER,
    icon: 'Users',
    description: 'Customer and supplier ledger',
  },
  {
    name: 'Committee',
    path: BRANCH_ADMIN_ROUTES.COMMITTEE,
    icon: 'Users2',
    description: 'Committee fund management',
  },
];

export const SALES_PURCHASE_MODULES = [
  {
    name: 'Purchase',
    path: BRANCH_ADMIN_ROUTES.PURCHASE,
    icon: 'ShoppingCart',
    description: 'Purchase orders and tracking',
  },
  {
    name: 'Sale',
    path: BRANCH_ADMIN_ROUTES.SALE,
    icon: 'TrendingUp',
    description: 'Customer sales and invoices',
  },
];

export const OPERATIONS_MODULES = [
  {
    name: 'Inventory',
    path: BRANCH_ADMIN_ROUTES.INVENTORY,
    icon: 'Package',
    description: 'Stock and inventory management',
  },
  {
    name: 'Repairs',
    path: BRANCH_ADMIN_ROUTES.REPAIRS,
    icon: 'Wrench',
    description: 'Repair jobs and tracking',
  },
  {
    name: 'Catalog',
    path: BRANCH_ADMIN_ROUTES.CATALOG,
    icon: 'Layers',
    description: 'Product catalog management',
  },
];

export const MANAGEMENT_MODULES = [
  {
    name: 'Branches',
    path: BRANCH_ADMIN_ROUTES.BRANCHES,
    icon: 'MapPin',
    description: 'Branch administration',
  },
  {
    name: 'Shops',
    path: BRANCH_ADMIN_ROUTES.SHOPS,
    icon: 'Store',
    description: 'Shop management',
  },
  {
    name: 'Staff',
    path: BRANCH_ADMIN_ROUTES.STAFF,
    icon: 'Users',
    description: 'Staff management',
  },
  {
    name: 'Shop Owners',
    path: BRANCH_ADMIN_ROUTES.SHOP_OWNERS,
    icon: 'User',
    description: 'Shop owner management',
  },
];

// ============= UTILITY FUNCTIONS =============

/**
 * Get all available modules grouped by category
 */
export const getAllModules = () => ({
  financial: FINANCIAL_MODULES,
  salesAndPurchase: SALES_PURCHASE_MODULES,
  operations: OPERATIONS_MODULES,
  management: MANAGEMENT_MODULES,
});

/**
 * Get module by path
 */
export const getModuleByPath = (path) => {
  const allModules = [
    ...FINANCIAL_MODULES,
    ...SALES_PURCHASE_MODULES,
    ...OPERATIONS_MODULES,
    ...MANAGEMENT_MODULES,
  ];
  return allModules.find((module) => module.path === path);
};

/**
 * Check if user has access to module
 * (Can be extended with role-based logic)
 */
export const hasModuleAccess = (userRole, modulePath) => {
  // Add your authorization logic here
  // Example:
  // const MODULE_ACCESS = {
  //   admin: Object.values(BRANCH_ADMIN_ROUTES),
  //   manager: [LEDGER, BANK, EXPENSE, etc.]
  //   staff: [SALE, INVENTORY]
  // }
  
  return true; // Default to true for now
};

export default {
  BRANCH_ADMIN_ROUTES,
  FINANCIAL_MODULES,
  SALES_PURCHASE_MODULES,
  OPERATIONS_MODULES,
  MANAGEMENT_MODULES,
  getAllModules,
  getModuleByPath,
  hasModuleAccess,
};
