  import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import { salesAgentApi } from '../api/salesagent.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  LogOut,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Link2,
} from 'lucide-react';

// pendingCount is passed as a prop so badge renders in nav items
function buildNavItems(pendingCount) {
  return [
    { to: '/sales-agent/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, badge: null },
    { to: '/sales-agent/referrals',   label: 'Referrals',   icon: Users,           badge: pendingCount > 0 ? pendingCount : null },
    { to: '/sales-agent/commissions', label: 'Commissions', icon: Wallet,          badge: null },
  ];
}

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 80, damping: 20, staggerChildren: 0.07, delayChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { x: -24, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

const logoGlow = {
  animate: {
    boxShadow: [
      '0 0 8px rgba(251,146,60,0.3)',
      '0 0 20px rgba(251,146,60,0.5)',
      '0 0 8px rgba(251,146,60,0.3)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

function SidebarContent({ user, logout, onClose, navItems }) {
  return (
    <>
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border border-orange-400" />
        <div className="absolute bottom-20 right-5 w-56 h-56 rounded-full border border-orange-400" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-orange-400" />
      </div>

      {/* Close — mobile only */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-3 z-20 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors md:hidden"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Logo */}
      <motion.div
        variants={itemVariants}
        className="relative px-5 py-6 border-b border-slate-700/60 flex items-center gap-3"
      >
        <motion.div
          variants={logoGlow}
          animate="animate"
          className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg flex-shrink-0"
        >
          <img src="/image.png" alt="Logo" className="h-7 w-7 object-contain drop-shadow" />
        </motion.div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold tracking-wide bg-gradient-to-r from-orange-300 to-orange-100 bg-clip-text text-transparent">
            Okiiee
          </h1>
          <div className="flex items-center gap-1.5">
            <Link2 size={10} className="text-orange-400" />
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Sales Agent</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="ml-auto text-orange-500/30 flex-shrink-0"
        >
          <Sparkles size={14} />
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-6 space-y-1.5">
        <motion.p
          variants={itemVariants}
          className="px-3 mb-3 text-[10px] font-semibold text-slate-500 tracking-widest uppercase"
        >
          Menu
        </motion.p>
        {navItems.map(({ to, label, icon: Icon, badge }) => (
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
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-xl border border-orange-500/20"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.12, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-300 flex-shrink-0 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-orange-400'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </motion.div>

                  <span className="relative z-10 flex-1">{label}</span>

                  {badge != null && (
                    <span className="relative z-10 ml-auto flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full px-1">
                      {badge}
                    </span>
                  )}

                  {isActive && !badge && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10 ml-auto flex-shrink-0"
                    >
                      <ChevronRight size={14} className="text-orange-400" />
                    </motion.div>
                  )}

                  {!isActive && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      className="absolute left-3 right-3 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent origin-left"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      <motion.div
        variants={itemVariants}
        className="relative px-3 py-5 border-t border-slate-700/60"
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <motion.div whileHover={{ scale: 1.1 }} className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
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
            <p className="text-xs text-slate-500 truncate font-mono">{user?.referralCode}</p>
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

export function SalesAgentLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingCount,  setPendingCount]  = useState(0);

  useEffect(() => {
    salesAgentApi.getReferralStats()
      .then((res) => {
        const stats = res.data || {};
        setPendingCount((stats.pendingNegotiation ?? 0) + (stats.priceRejected ?? 0));
      })
      .catch(() => {});
  }, []);

  const navItems    = buildNavItems(pendingCount);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-orange-50/20">

      {/* Mobile Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-lg z-30 flex items-center px-4 md:hidden border-b border-slate-700/40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-1 rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-colors"
        >
          <Menu size={20} className="text-white" />
        </motion.button>
        <div className="flex items-center gap-2.5 ml-2">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20">
            <img src="/image.png" alt="Logo" className="h-4 w-4 object-contain" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Okiiee</span>
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 rounded-md">
            SA
          </span>
        </div>
        <div className="ml-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
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
              className="fixed inset-y-0 left-0 z-50 w-[272px] bg-slate-900 text-white flex flex-col shadow-2xl overflow-y-auto md:hidden"
            >
              <SidebarContent user={user} logout={logout} onClose={closeSidebar} navItems={navItems} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar — sticky, scrolls with page */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:flex w-64 bg-slate-900 text-white flex-col shadow-2xl relative overflow-hidden flex-shrink-0 self-start md:sticky md:top-0 md:h-screen"
      >
        <SidebarContent user={user} logout={logout} onClose={null} navItems={navItems} />
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}