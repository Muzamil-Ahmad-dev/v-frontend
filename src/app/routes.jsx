    import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from './guards.jsx';

// Layouts
import { AdminLayout } from '../shared/layout/AdminLayout.jsx';
import { SuperAdminLayout } from '../shared/layout/SuperAdminLayout.jsx';
import { SalesAgentLayout } from '../shared/layout/SalesAgentLayout.jsx';
import { BranchAdminLayout } from '../shared/layout/BranchAdminLayout.jsx';
import { StaffLayout } from '../shared/layout/StaffLayout.jsx';

// Auth
import LoginPage from '../features/auth/LoginPage.jsx';
import RegisterPage from '../features/auth/RegisterPage.jsx';

// SuperAdmin
import SuperAdminDashboardPage from '../features/superadmin/dashboard/DashboardPage.jsx';
import NegotiationActivityPage from '../features/superadmin/negotiation_activity/NegotiationActivityPage.jsx';
import SuperAdminRegistrationsPage from '../features/superadmin/registrations/RegistrationsPage.jsx';
import SuperAdminUsersPage from '../features/superadmin/users/UsersPage.jsx';
import SuperAdminSalesAgentsPage from '../features/superadmin/salesagents/SalesAgentsPage.jsx';

// Admin
import AdminDashboardPage from '../features/admin/dashboard/DashboardPage.jsx';
// import AdminBranchesPage from '../features/admin/branches/BranchesPage.jsx';
// import AdminShopOwnersPage from '../features/admin/shopOwners/ShopOwnersPage.jsx';
import AdminBranchAdminsPage from '../features/admin/branchAdmins/BranchAdminsPage.jsx';

// Sales Agent
import SalesAgentDashboard from '../features/sales_agent/dashboard/DashboardPage.jsx';
import SalesAgentReferrals from '../features/sales_agent/referrals/ReferralsPage.jsx';
import SalesAgentCommissions from '../features/sales_agent/commissions/CommissionsPage.jsx';

// Branch Admin
import BranchAdminDashboardPage from '../features/branchAdmin/dashboard/DashboardPage.jsx';
import BranchAdminBranchesPage from '../features/branchAdmin/branches/BranchesPage.jsx';
import BranchAdminStaffPage from '../features/branchAdmin/staff/StaffPage.jsx';
import BranchAdminShopOwnersPage from '../features/branchAdmin/shopOwners/ShopOwnersPage.jsx';
import BranchAdminInventoryPage from '../features/branchAdmin/inventory/InventoryPage.jsx';
import BranchAdminRepairsPage from '../features/branchAdmin/repairs/RepairsPage.jsx';
import BranchAdminNotificationsPage from '../features/branchAdmin/notifications/NotificationsPage.jsx';
import BranchAdminCatalogPage from '../features/branchAdmin/catalog/CatalogPage.jsx';
import BranchAdminShopsPage from '../features/branchAdmin/shops/ShopsPage.jsx';

// Billing
 import BillingDashboardPage from '../features/billing/dashboard/DashboardPage.jsx';
import BillingInvoicesPage  from '../features/billing/invoices/InvoicesPage.jsx';
import BillingWalletPage    from '../features/billing/wallet/WalletPage.jsx';
import BillingWalletOverviewPage from '../features/billing/wallet/pages/WalletOverviewPage.jsx';
import BillingWalletHistoryPage  from '../features/billing/wallet/pages/WalletHistoryPage.jsx';
import BillingBankTransactionsPage from '../features/billing/wallet/pages/BankTransactionsPage.jsx';

// Billing: Finance (NEW — moved from admin, shared with BILLING role)
import FinanceHomePage from '../features/billing/finance/FinanceHomePage.jsx';
import FinanceLedgerPage              from '../features/billing/finance/pages/LedgerPage.jsx';
import FinanceBankPage                from '../features/billing/finance/pages/BankPage.jsx';
import FinanceExpensePage             from '../features/billing/finance/pages/ExpensePage.jsx';
import FinancePartyLedgerPage         from '../features/billing/finance/pages/PartyLedgerPage.jsx';
import FinanceCommitteeLedgerPage     from '../features/billing/finance/pages/CommitteeLedgerPage.jsx';
import FinanceShopLedgerPage          from '../features/billing/finance/pages/ShopLedgerPage.jsx';
import FinancePocketCashPage          from '../features/billing/finance/pages/PocketCashPage.jsx';
import FinancePayablesReceivablesPage from '../features/billing/finance/pages/PayablesReceivablesPage.jsx';
import FinancePersonLedgerDetailPage  from '../features/billing/finance/pages/PersonLedgerDetailPage.jsx';
import FinanceDayBookPage             from '../features/billing/finance/pages/DayBookPage.jsx';
import FinanceBalanceSheetPage        from '../features/billing/finance/pages/BalanceSheetPage.jsx';

// Sale
import SaleDashboardPage from '../features/sale/dashboard/DashboardPage.jsx';
import SaleInvoicesPage from '../features/sale/invoices/SaleInvoicesPage.jsx';

// Purchase
import PurchaseDashboardPage from '../features/purchase/dashboard/DashboardPage.jsx';
import PurchasePhonesPage from '../features/purchase/phones/PurchasePhonesPage.jsx';
import PurchaseBulkPage from '../features/purchase/bulk/PurchaseBulkPage.jsx';
import PurchaseStockPage from '../features/purchase/stock/PurchaseStockPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* SuperAdmin */}
      <Route path="/superadmin" element={<ProtectedRoute role="SUPER_ADMIN"><SuperAdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="registrations" element={<SuperAdminRegistrationsPage />} />
        <Route path="users" element={<SuperAdminUsersPage />} />
        <Route path="sales-agents" element={<SuperAdminSalesAgentsPage />} />
        <Route path="negotiation-activity" element={<NegotiationActivityPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        {/* <Route path="branches" element={<AdminBranchesPage />} /> */}
        <Route path="branch-admins" element={<AdminBranchAdminsPage />} />
        {/* <Route path="shop-owners" element={<AdminShopOwnersPage />} /> */}
      </Route>

      {/* Sales Agent */}
      <Route path="/sales-agent" element={<ProtectedRoute role="SALES_AGENT"><SalesAgentLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/sales-agent/dashboard" replace />} />
        <Route path="dashboard" element={<SalesAgentDashboard />} />
        <Route path="referrals" element={<SalesAgentReferrals />} />
        <Route path="commissions" element={<SalesAgentCommissions />} />
      </Route>

      {/* Branch Admin */}
      <Route path="/branch-admin" element={<ProtectedRoute role="BRANCH_ADMIN"><BranchAdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/branch-admin/dashboard" replace />} />
        <Route path="dashboard" element={<BranchAdminDashboardPage />} />
        <Route path="branches" element={<BranchAdminBranchesPage />} />
        <Route path="staff" element={<BranchAdminStaffPage />} />
        <Route path="shop-owners" element={<BranchAdminShopOwnersPage />} />

        {/* NEW: Inventory (Phones / Accessories / Dispatch tabs) */}
        <Route path="inventory" element={<BranchAdminInventoryPage />} />

        {/* NEW: Repair jobs */}
        <Route path="repairs" element={<BranchAdminRepairsPage />} />

        {/* NEW: Notifications */}
        <Route path="notifications" element={<BranchAdminNotificationsPage />} />

        {/* NEW: Catalog — Companies & Phone Models, shared with the parent Admin */}
        <Route path="catalog" element={<BranchAdminCatalogPage />} />

        {/* NEW: Shops */}
        <Route path="shops" element={<BranchAdminShopsPage />} />

        {/* NEW: full Purchase module, scoped to whichever branch is active
            in the sidebar's branch switcher (see BranchAdminBranchContext) */}
        <Route path="purchase/dashboard" element={<PurchaseDashboardPage />} />
        <Route path="purchase/phones"    element={<PurchasePhonesPage />} />
        <Route path="purchase/bulk"      element={<PurchaseBulkPage />} />
        <Route path="purchase/stock"     element={<PurchaseStockPage />} />

        {/* NEW: full Sale module */}
        <Route path="sale/dashboard" element={<SaleDashboardPage />} />
        <Route path="sale/invoices"  element={<SaleInvoicesPage />} />

        {/* NEW: full Billing module — invoices, wallet, finance suite */}
        <Route path="billing/dashboard" element={<BillingDashboardPage />} />
        <Route path="billing/invoices"  element={<BillingInvoicesPage />} />
        <Route path="billing/wallet" element={<BillingWalletPage />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<BillingWalletOverviewPage />} />
          <Route path="history"  element={<BillingWalletHistoryPage />} />
        </Route>
        <Route path="billing/wallet/bank/:id" element={<BillingBankTransactionsPage />} />
        <Route path="billing/finance" element={<FinanceHomePage />} />
        <Route path="billing/finance/ledger"              element={<FinanceLedgerPage />} />
        <Route path="billing/finance/bank"                element={<FinanceBankPage />} />
        <Route path="billing/finance/expenses"            element={<FinanceExpensePage />} />
        <Route path="billing/finance/party-ledger"        element={<FinancePartyLedgerPage />} />
        <Route path="billing/finance/committee-ledger"    element={<FinanceCommitteeLedgerPage />} />
        <Route path="billing/finance/shop-ledger"         element={<FinanceShopLedgerPage />} />
        <Route path="billing/finance/pocket-cash"         element={<FinancePocketCashPage />} />
        <Route path="billing/finance/payables-receivables" element={<FinancePayablesReceivablesPage />} />
        <Route path="billing/finance/payables-receivables/:personId" element={<FinancePersonLedgerDetailPage />} />
        <Route path="billing/finance/daybook"             element={<FinanceDayBookPage />} />
        <Route path="billing/finance/balance-sheet"       element={<FinanceBalanceSheetPage />} />
      </Route>

      {/* Billing Staff */}
      <Route path="/billing" element={<ProtectedRoute role="BILLING"><StaffLayout role="BILLING" /></ProtectedRoute>}>
        <Route index element={<Navigate to="/billing/dashboard" replace />} />
        <Route path="dashboard" element={<BillingDashboardPage />} />
        <Route path="invoices" element={<BillingInvoicesPage />} />
        <Route path="wallet" element={<BillingWalletPage />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<BillingWalletOverviewPage />} />
          <Route path="history" element={<BillingWalletHistoryPage />} />
        </Route>
        <Route path="wallet/bank/:id" element={<BillingBankTransactionsPage />} />
        <Route path="finance" element={<FinanceHomePage />} />
        <Route path="finance/ledger" element={<FinanceLedgerPage />} />
        <Route path="finance/bank" element={<FinanceBankPage />} />
        <Route path="finance/expenses" element={<FinanceExpensePage />} />
        <Route path="finance/party-ledger" element={<FinancePartyLedgerPage />} />
        <Route path="finance/committee-ledger" element={<FinanceCommitteeLedgerPage />} />
        <Route path="finance/shop-ledger" element={<FinanceShopLedgerPage />} />
        <Route path="finance/pocket-cash" element={<FinancePocketCashPage />} />
        <Route path="finance/payables-receivables" element={<FinancePayablesReceivablesPage />} />
        <Route path="finance/payables-receivables/:personId" element={<FinancePersonLedgerDetailPage />} />
        <Route path="finance/daybook" element={<FinanceDayBookPage />} />
        <Route path="finance/balance-sheet" element={<FinanceBalanceSheetPage />} />
      </Route>

      {/* Sale Staff */}
      <Route path="/sale" element={<ProtectedRoute role="SALE"><StaffLayout role="SALE" /></ProtectedRoute>}>
        <Route index element={<Navigate to="/sale/dashboard" replace />} />
        <Route path="dashboard" element={<SaleDashboardPage />} />
        <Route path="invoices" element={<SaleInvoicesPage />} />
      </Route>

      {/* Purchase Staff */}
      <Route path="/purchase" element={<ProtectedRoute role="PURCHASE"><StaffLayout role="PURCHASE" /></ProtectedRoute>}>
        <Route index element={<Navigate to="/purchase/dashboard" replace />} />
        <Route path="dashboard" element={<PurchaseDashboardPage />} />
        <Route path="phones" element={<PurchasePhonesPage />} />
        <Route path="bulk" element={<PurchaseBulkPage />} />
        <Route path="stock" element={<PurchaseStockPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
            <a href="/login" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">← Go to login</a>
          </div>
        </div>
      } />
    </Routes>
  );
}