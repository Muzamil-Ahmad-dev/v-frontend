import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, History } from 'lucide-react';
import { useModulePrefix } from '../../../../shared/utils/useModulePrefix.js';

export default function WalletTabs() {
  const base = useModulePrefix();
  const TABS = [
    { to: `${base}/billing/wallet/overview`, label: 'Overview', icon: LayoutGrid },
    { to: `${base}/billing/wallet/history`,  label: 'History',  icon: History },
  ];
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl w-fit mb-6">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="relative">
          {({ isActive }) => (
            <span className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
              isActive ? 'text-sky-700' : 'text-gray-500 hover:text-gray-700'
            }`}>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="walletTabPill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                  />
                )}
              </AnimatePresence>
              <Icon size={13} />
              {label}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
