import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { WalletProvider, useWalletContext } from './context/WalletContext.jsx';
import WalletTabs from './components/WalletTabs.jsx';

function WalletHeader() {
  const { refresh, loading } = useWalletContext();
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="flex items-start sm:items-center justify-between gap-3 mb-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={16} className="text-sky-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">My Wallet</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Pocket Cash &amp; Bank Accounts</p>
      </div>
      <button
        onClick={refresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50"
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </motion.div>
  );
}

function WalletShell() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <WalletHeader />
      <WalletTabs />
      <Outlet />
    </div>
  );
}

/**
 * WalletPage
 * Layout/route-shell for the "My Wallet" feature (Pocket Cash + Bank
 * Accounts). Wraps Overview and History sub-routes in a single
 * WalletProvider so they all share the same live data without re-fetching.
 */
export default function WalletPage() {
  return (
    <WalletProvider>
      <WalletShell />
    </WalletProvider>
  );
}
