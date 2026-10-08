    import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, LogOut, ChevronRight, Sparkles, Menu, X,
  FileText, ShoppingCart, Package, Wallet, PiggyBank, Boxes, Warehouse,
} from 'lucide-react';

const ROLE_CONFIG = {
  BILLING: {
    label: 'Billing',
    color: 'sky',
    gradient: 'from-sky-400 to-cyan-600',
    glow: 'rgba(14,165,233,',
    navItems: [
      { to: '/billing/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/billing/invoices',  label: 'Invoices',  icon: FileText },
      { to: '/billing/wallet/overview', label: 'My Wallet', icon: Wallet },
      { to: '/billing/finance',   label: 'Finance',   icon: PiggyBank },
    ],
  },
  SALE: {
    label: 'Sale',
    color: 'emerald',
    gradient: 'from-emerald-400 to-green-600',
    glow: 'rgba(16,185,129,',
    navItems: [
      { to: '/sale/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/sale/invoices',  label: 'Invoices',  icon: ShoppingCart },
    ],
  },
  PURCHASE: {
    label: 'Purchase',
    color: 'amber',
    gradient: 'from-amber-400 to-orange-600',
    glow: 'rgba(245,158,11,',
    navItems: [
      { to: '/purchase/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/purchase/phones',    label: 'Phones',    icon: Package },
      { to: '/purchase/bulk',      label: 'Bulk Purchases', icon: Boxes },
      { to: '/purchase/stock',     label: 'Stock',      icon: Warehouse },
    ],
  },
};

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

function SidebarContent({ user, logout, onClose, config }) {
  const { label, gradient, glow, navItems } = config;

  return (
    <>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border border-current" />
        <div className="absolute bottom-20 right-5 w-56 h-56 rounded-full border border-current" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-current" />
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-3 z-20 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors md:hidden"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      <motion.div
        variants={itemVariants}
        className="relative px-5 py-6 border-b border-slate-700/60 flex items-center gap-3"
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 8px ${glow}0.3)`,
              `0 0 20px ${glow}0.5)`,
              `0 0 8px ${glow}0.3)`,
            ],
            transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`flex items-center justify-center w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl shadow-lg flex-shrink-0`}
        >
          <img src="/image.png" alt="Logo" className="h-7 w-7 object-contain drop-shadow" />
        </motion.div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold tracking-wide text-white">Okiiee</h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">{label} Staff</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="ml-auto text-slate-500/30 flex-shrink-0"
        >
          <Sparkles size={14} />
        </motion.div>
      </motion.div>

      <nav className="relative flex-1 px-3 py-6 space-y-1.5">
        <motion.p
          variants={itemVariants}
          className="px-3 mb-3 text-[10px] font-semibold text-slate-500 tracking-widest uppercase"
        >
          Menu
        </motion.p>
        {navItems.map(({ to, label: navLabel, icon: Icon }) => (
          <motion.div key={to} variants={itemVariants}>
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId={onClose ? 'activeNavMobile' : 'activeNav'}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className={`absolute inset-0 bg-gradient-to-r ${gradient.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-xl border border-white/10`}
                        style={{ background: `linear-gradient(to right, ${glow}0.15), ${glow}0.05))` }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.12, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-300 flex-shrink-0 ${
                      isActive
                        ? `bg-gradient-to-br ${gradient} text-white shadow-lg`
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </motion.div>

                  <span className="relative z-10">{navLabel}</span>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10 ml-auto flex-shrink-0"
                    >
                      <ChevronRight size={14} className="text-slate-400" />
                    </motion.div>
                  )}

                  {!isActive && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      className="absolute left-3 right-3 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent origin-left"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <motion.div
        variants={itemVariants}
        className="relative px-3 py-5 border-t border-slate-700/60"
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <motion.div whileHover={{ scale: 1.1 }} className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900"
            />
          </motion.div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors duration-300"
        >
          <LogOut size={15} />
          Sign out
        </motion.button>
      </motion.div>
    </>
  );
}

export function StaffLayout({ role }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.BILLING;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50/30">

      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-lg z-30 flex items-center px-4 md:hidden border-b border-slate-700/40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-1 rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-colors"
        >
          <Menu size={20} className="text-white" />
        </motion.button>
        <div className="flex items-center gap-2.5 ml-2">
          <div className={`w-7 h-7 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shadow-md`}>
            <img src="/image.png" alt="Logo" className="h-4 w-4 object-contain" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Okiiee</span>
        </div>
        <div className="ml-auto">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] bg-slate-900 text-white flex flex-col shadow-2xl overflow-hidden md:hidden"
            >
              <SidebarContent user={user} logout={logout} onClose={closeSidebar} config={config} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:flex w-64 bg-slate-900 text-white flex-col shadow-2xl relative overflow-hidden flex-shrink-0"
      >
        <SidebarContent user={user} logout={logout} onClose={null} config={config} />
      </motion.aside>

      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}