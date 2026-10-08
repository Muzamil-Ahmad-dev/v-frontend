import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Landmark, PlusCircle, MinusCircle, Trash2, History } from 'lucide-react';
import { Button, EmptyState } from '../../../../shared/components/ui.jsx';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export default function BanksTable({ banks, onAddCash, onRemoveCash, onDelete }) {
  if (!banks || banks.length === 0) {
    return (
      <EmptyState
        icon="🏦"
        title="No bank accounts yet"
        description="Create your first bank account above to start tracking cash in/out."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Landmark size={14} className="text-sky-400" />
        <h3 className="text-sm font-semibold text-gray-700">Bank Accounts</h3>
        <span className="text-[10px] font-medium text-gray-400">({banks.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-2.5">Bank Name</th>
              <th className="px-4 py-2.5">Account Type</th>
              <th className="px-4 py-2.5 text-right">Balance</th>
              <th className="px-4 py-2.5">Account Number</th>
              <th className="px-4 py-2.5 text-right">Cash In</th>
              <th className="px-4 py-2.5 text-right">Cash Out</th>
              <th className="px-4 py-2.5">Created</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank._id} className="border-t border-gray-100 hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">{bank.bankName}</td>
                <td className="px-4 py-3 text-gray-600">{bank.accountType}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {Number(bank.accountCash || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-500">{bank.accountNumber || '—'}</td>
                <td className="px-4 py-3 text-right text-emerald-600">+{Number(bank.cashIn || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-500">-{Number(bank.cashOut || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{fmtDate(bank.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end flex-wrap gap-1.5">
                    <Button variant="success" size="sm" onClick={() => onAddCash(bank)} className="gap-1">
                      <PlusCircle size={12} /> Add
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onRemoveCash(bank)} className="gap-1">
                      <MinusCircle size={12} /> Remove
                    </Button>
                    <Link to={`/billing/wallet/bank/${bank._id}`}>
                      <Button variant="secondary" size="sm" className="gap-1">
                        <History size={12} />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(bank)} className="gap-1 text-red-500 hover:bg-red-50">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
