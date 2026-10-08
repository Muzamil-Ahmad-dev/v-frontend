import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, History as HistoryIcon } from 'lucide-react';
import { Spinner, Alert } from '../../../../shared/components/ui.jsx';
import { useWalletContext } from '../context/WalletContext.jsx';
import { pocketCashLedgerApi } from '../../../../shared/api/staff.js';
import TransactionsTable from '../components/TransactionsTable.jsx';

// Normalize a raw PocketCash transaction sub-document into the shape
// TransactionsTable expects.
const normalize = (txn) => ({
  _id: txn._id,
  type: txn.amountAdded ? 'in' : 'out',
  amount: txn.amountAdded || txn.amountDeducted || 0,
  note: txn.sourceOfAmountAddition || txn.reasonOfAmountDeduction || '',
  balanceAfter: txn.remainingAmount ?? txn.accountCash,
  date: txn.date || txn.createdAt,
});

export default function WalletHistoryPage() {
  const { pocketCashId, loading: walletLoading, error: walletError } = useWalletContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (isRefresh = false) => {
    if (!pocketCashId) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const res = await pocketCashLedgerApi.getTransactions(pocketCashId);
      const list = Array.isArray(res) ? res : Array.isArray(res?.transactions) ? res.transactions : [];
      setRows(list.map(normalize).reverse());
    } catch (err) {
      setError(err.message || 'Failed to load pocket cash history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [pocketCashId]);

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this transaction? This will reverse its effect on the balance.')) return;
    try {
      await pocketCashLedgerApi.deleteTransaction(row._id);
      load(true);
    } catch (err) {
      setError(err.message || 'Failed to delete transaction.');
    }
  };

  if (walletLoading || loading) return <Spinner />;

  return (
    <div>
      <Alert message={walletError || error} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HistoryIcon size={14} className="text-sky-400" />
            <h3 className="text-sm font-semibold text-gray-700">Pocket Cash History</h3>
            <span className="text-[10px] font-medium text-gray-400">({rows.length} records)</span>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <TransactionsTable rows={rows} onDelete={handleDelete} emptyLabel="No pocket cash activity yet" />
      </motion.div>
    </div>
  );
}
