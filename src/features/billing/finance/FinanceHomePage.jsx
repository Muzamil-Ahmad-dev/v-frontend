import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, BookOpen, Landmark, Receipt, Users, HandCoins,
  Store, Wallet2, ArrowLeftRight, CalendarDays, PieChart, ChevronRight,
} from 'lucide-react';

const MODULES = [
  { to: 'ledger',               label: 'Ledger',                desc: 'Daily cash ledger entries',          icon: BookOpen },
  { to: 'bank',                 label: 'Bank',                   desc: 'Bank accounts & transactions',       icon: Landmark },
  { to: 'expenses',             label: 'Expenses',                desc: 'Shop expense tracking',              icon: Receipt },
  { to: 'party-ledger',         label: 'Party Ledger',           desc: 'Credit given/taken with parties',    icon: Users },
  { to: 'committee-ledger',     label: 'Committee Ledger',       desc: 'Committee (BC) contributions',       icon: HandCoins },
  { to: 'shop-ledger',          label: 'Shop Ledger',            desc: 'Per-shop running ledger',            icon: Store },
  { to: 'pocket-cash',          label: 'Pocket Cash',            desc: 'Petty cash in/out',                  icon: Wallet2 },
  { to: 'payables-receivables', label: 'Payables & Receivables', desc: 'Amounts owed and due',               icon: ArrowLeftRight },
  { to: 'daybook',              label: 'Day Book',               desc: 'Daily cash in/out log',              icon: CalendarDays },
  { to: 'balance-sheet',        label: 'Balance Sheet',          desc: 'Assets, liabilities & equity',       icon: PieChart },
];

export default function FinanceHomePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={16} className="text-sky-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Finance</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage all your branch finance records in one place</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(({ to, label, desc, icon: Icon }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 22, delay: i * 0.04 }}
          >
            <Link
              to={to}
              className="group flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-sky-400 transition-colors shrink-0 mt-1" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
