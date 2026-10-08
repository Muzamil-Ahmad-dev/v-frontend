import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet2, PlusCircle, MinusCircle, History } from 'lucide-react';
import { Button } from '../../../../shared/components/ui.jsx';
import { useModulePrefix } from '../../../../shared/utils/useModulePrefix.js';

export default function PocketCashCard({ total, onAdd, onRemove }) {
  const base = useModulePrefix();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="relative overflow-hidden rounded-2xl shadow-sm text-white p-6 sm:p-8 flex flex-col items-center text-center"
      style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Wallet2 size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-50/90">Pocket Cash</h3>
      </div>
      <p className="text-4xl font-bold my-3">{Number(total || 0).toLocaleString()}</p>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
        <Button variant="success" size="sm" onClick={onAdd} className="gap-1.5">
          <PlusCircle size={14} /> Add Cash
        </Button>
        <Button variant="danger" size="sm" onClick={onRemove} className="gap-1.5">
          <MinusCircle size={14} /> Remove Cash
        </Button>
      </div>

      <Link
        to={`${base}/billing/wallet/history`}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        <History size={13} /> View Transactions
      </Link>
    </motion.div>
  );
}
