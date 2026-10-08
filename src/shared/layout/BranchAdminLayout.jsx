 import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import { BranchAdminBranchProvider, useBranchAdminBranch } from '../utils/BranchAdminBranchContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, LogOut, ChevronRight, Sparkles, Menu, X,
  Building2, Users, FileText, ShoppingCart, Package, Wallet, PiggyBank,
  ChevronDown, Check, Users2, Wrench, Bell, Tags, Store, Boxes, Search, Grid2x2,
  MessageCircle,
} from 'lucide-react';

const navItems = [
  { to: '/branch-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/branch-admin/branches',  label: 'Branches',  icon: Building2 },
  { to: '/branch-admin/staff',     label: 'Staff',     icon: Users },
  { to: '/branch-admin/shop-owners', label: 'Shop Owners', icon: Users2 },
  { to: '/branch-admin/purchase/dashboard', label: 'Purchase',        icon: Package },
  { to: '/branch-admin/purchase/phones',    label: 'Purchase Phones', icon: Package },
  { to: '/branch-admin/purchase/bulk',      label: 'Bulk Purchases',  icon: Package },
  { to: '/branch-admin/purchase/stock',     label: 'Stock',           icon: Package },
  { to: '/branch-admin/inventory',          label: 'Inventory',       icon: Boxes },
  { to: '/branch-admin/sale/dashboard',     label: 'Sale',            icon: ShoppingCart },
  { to: '/branch-admin/sale/invoices',      label: 'Sale Invoices',   icon: ShoppingCart },
  { to: '/branch-admin/billing/dashboard',  label: 'Billing',         icon: FileText },
  { to: '/branch-admin/billing/invoices',   label: 'Invoices',        icon: FileText },
  { to: '/branch-admin/billing/wallet/overview', label: 'My Wallet',  icon: Wallet },
  { to: '/branch-admin/billing/finance',    label: 'Finance',         icon: PiggyBank },
  { to: '/branch-admin/repairs',       label: 'Repairs',       icon: Wrench },
  { to: '/branch-admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/branch-admin/catalog',       label: 'Catalog',       icon: Tags },
  { to: '/branch-admin/shops',         label: 'Shops',         icon: Store },
];

const bottomNavItems = [
  { to: '/branch-admin/dashboard', label: 'Home',     icon: LayoutDashboard },
  { to: '/branch-admin/branches',  label: 'Branches', icon: Building2 },
  { to: '/branch-admin/sale/dashboard', label: 'Sale', icon: ShoppingCart },
  { to: '/branch-admin/billing/dashboard', label: 'Billing', icon: FileText },
];

const style = document.createElement('style');
style.textContent = `.scrollbar-none{scrollbar-width:none;-ms-overflow-style:none}.scrollbar-none::-webkit-scrollbar{display:none}`;

if (!document.getElementById('scrollbar-hide')) {
  style.id = 'scrollbar-hide';
  document.head.appendChild(style);
}

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 80, damping: 20, staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

const logoGlow = {
  animate: {
    boxShadow: [
      '0 0 8px rgba(59,149,164,0.3)',
      '0 0 20px rgba(59,149,164,0.5)',
      '0 0 8px rgba(59,149,164,0.3)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ---- Wordmark logo, matching the reference: small circular "O" mark
// sitting tight against a lowercase "okiiee" wordmark, all one baseline. ----
function OkiieeLogo({ size = 'default' }) {
  const dims = size === 'compact'
    ? { circle: 'w-7 h-7', circleText: 'text-sm', word: 'text-base' }
    : { circle: 'w-8 h-8', circleText: 'text-base', word: 'text-lg' };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center ${dims.circle} rounded-full border-[1.5px] border-[#3B95A4] flex-shrink-0`}>
        <span className={`${dims.circleText} font-black leading-none text-[#3B95A4]`} style={{ fontFamily: 'Georgia, serif' }}>O</span>
      </div>
      <span className={`${dims.word} font-bold tracking-tight text-gray-900 lowercase leading-none`}>
        okiiee
      </span>
    </div>
  );
}

function BranchSwitcher() {
  const { branches, currentBranchId, currentBranch, setCurrentBranchId, loading, hasNoBranches } = useBranchAdminBranch();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="px-3 py-2 text-xs text-gray-400">Loading branches…</div>;
  }

  if (hasNoBranches) {
    return (
      <div className="px-3 py-2 text-xs text-[#296B77] bg-[#E8F4F6] rounded-lg mx-1 border border-[#3B95A4]/25">
        No branches yet — create one to unlock Purchase/Sale/Billing.
      </div>
    );
  }

  return (
    <div className="relative px-1 mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#F4F8F9] hover:bg-[#E8F4F6] text-left transition-colors border border-gray-100"
      >
        <Building2 size={15} className="text-[#3B95A4] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active branch</p>
          <p className="text-sm font-medium text-gray-800 truncate">{currentBranch?.name || 'Select branch'}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1 right-1 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20 max-h-64 overflow-y-auto"
          >
            {branches.map((b) => (
              <button
                key={b._id}
                onClick={() => { setCurrentBranchId(b._id); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-gray-700 hover:bg-[#E8F4F6] transition-colors"
              >
                <span className="flex-1 truncate">{b.name}</span>
                {b._id === currentBranchId && <Check size={14} className="text-[#3B95A4] flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ user, logout, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-3 z-20 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Sticky header: logo + branch switcher stay pinned while nav scrolls */}
      <div className="sticky top-0 z-10 bg-white">
        <motion.div
          variants={itemVariants}
          className="relative px-5 py-5 border-b border-gray-100 flex items-center"
        >
          <OkiieeLogo />
        </motion.div>

        <div className="relative pt-4">
          <BranchSwitcher />
        </div>
      </div>

      <nav className="relative flex-1 min-h-0 px-3 py-4 space-y-2 overflow-y-auto scrollbar-none">
        {navItems.map(({ to, label, icon: Icon }) => (
          <motion.div key={to} variants={itemVariants}>
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#3B95A4] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-[#E8F4F6] hover:text-[#296B77]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E8F4F6] text-[#3B95A4] group-hover:bg-white'
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </div>

                  <span className="relative z-10">{label}</span>

                  {isActive && (
                    <ChevronRight size={14} className="relative z-10 ml-auto flex-shrink-0 text-white" />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <motion.div
        variants={itemVariants}
        className="relative px-3 py-5 border-t border-gray-100"
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="relative flex-shrink-0">
            {user?.avatar || user?.photo || user?.profileImage ? (
              <img
                src={user.avatar || user.photo || user.profileImage}
                alt={user?.name || 'Profile'}
                className="w-10 h-10 rounded-lg object-cover shadow"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#3B95A4] flex items-center justify-center text-white font-bold shadow">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-300"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </motion.div>
    </div>
  );
}

export function BranchAdminLayout() {
  return (
    <BranchAdminBranchProvider>
      <BranchAdminLayoutInner />
    </BranchAdminBranchProvider>
  );
}

function DesktopTopbar({ user, notificationCount = 3, onToggleSidebar }) {
  return (
    <header className="hidden lg:flex items-center gap-4 h-16 px-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <button
        onClick={onToggleSidebar}
        className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 hover:bg-gray-100 transition-colors"
      >
        <Menu size={15} />
      </button>

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-full max-w-xs">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
          <Bell size={15} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-1">
          {user?.avatar || user?.photo || user?.profileImage ? (
            <img
              src={user.avatar || user.photo || user.profileImage}
              alt={user?.name || 'Profile'}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#3B95A4] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400 truncate">Branch Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ onMoreClick }) {
  const items = [
    ...bottomNavItems,
    { to: null, label: 'More', icon: Grid2x2, isMore: true },
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-30 lg:hidden">
      <div className="flex items-center justify-between gap-1 bg-white/90 backdrop-blur-md border border-gray-200/70 rounded-2xl shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] px-1.5 py-1.5">
        {items.map((item) =>
          item.isMore ? (
            <button
              key="more"
              onClick={onMoreClick}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-gray-400 active:scale-95 transition-transform"
            >
              <Grid2x2 size={18} strokeWidth={2} />
              <span className="text-[10px] font-medium">More</span>
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex-1 flex flex-col items-center justify-center py-2 rounded-xl active:scale-95 transition-transform"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavActive"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-1 bg-[#3B95A4] rounded-xl"
                    />
                  )}
                  <span className="relative z-10 flex flex-col items-center gap-1">
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.4 : 2}
                      className={isActive ? 'text-white' : 'text-gray-400'}
                    />
                    <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}

function BranchAdminLayoutInner() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen overflow-hidden flex bg-[#F4F8F9]">

      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-30 flex items-center px-4 lg:hidden shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Menu size={20} className="text-gray-700" />
        </button>
        <div className="ml-2">
          <OkiieeLogo size="compact" />
        </div>
        <div className="ml-auto">
          {user?.avatar || user?.photo || user?.profileImage ? (
            <img
              src={user.avatar || user.photo || user.profileImage}
              alt={user?.name || 'Profile'}
              className="w-8 h-8 rounded-lg object-cover shadow"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#3B95A4] flex items-center justify-center text-white text-xs font-bold shadow">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] bg-white text-gray-800 flex flex-col shadow-lg overflow-hidden lg:hidden"
            >
              <SidebarContent user={user} logout={logout} onClose={closeSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isDesktopSidebarOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            className="hidden lg:flex h-screen bg-white text-gray-800 border-r border-gray-100 shadow-sm overflow-hidden flex-shrink-0"
          >
            <div className="w-64 h-full flex flex-col flex-shrink-0">
              <SidebarContent user={user} logout={logout} onClose={null} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto pt-14 pb-24 lg:pt-0 lg:pb-0 flex flex-col relative">
        <DesktopTopbar user={user} onToggleSidebar={() => setIsDesktopSidebarOpen((v) => !v)} />
        <div className="flex-1">
          <Outlet />
        </div>

        <button
          className="hidden lg:flex fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#3B95A4] text-white items-center justify-center shadow-lg hover:bg-[#296B77] transition-colors z-20"
          aria-label="Contact support"
        >
          <MessageCircle size={20} />
        </button>
      </main>

      <BottomNav onMoreClick={() => setIsSidebarOpen(true)} />
    </div>
  );
}