import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Landmark } from 'lucide-react';
import { Spinner, Alert } from '../../../../shared/components/ui.jsx';
import { banksLedgerApi } from '../../../../shared/api/staff.js';
import TransactionsTable from '../components/TransactionsTable.jsx';
import { useModulePrefix } from '../../../../shared/utils/useModulePrefix.js';

// Normalize a raw BankAccount transaction sub-document into the shape
// TransactionsTable expects.
const normalize = (txn) => ({
  _id: txn._id,
  type: txn.sourceOfAmountAddition ? 'in' : 'out',
  amount: txn.accountCash || txn.cashIn || txn.cashOut || 0,
  note: txn.sourceOfAmountAddition || txn.reasonOfAmountDeduction || '',
  balanceAfter: txn.balanceAfter,
  date: txn.date || txn.createdAt,
});

export default function BankTransactionsPage() {
  const { id } = useParams();
  const base = useModulePrefix();
  const [bankName, setBankName] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [txnRes, banksRes] = await Promise.all([
        banksLedgerApi.getTransactions(id),
        banksLedgerApi.getAll(),
      ]);
      const list = Array.isArray(txnRes?.transactions) ? txnRes.transactions : Array.isArray(txnRes) ? txnRes : [];
      setRows(list.map(normalize).reverse());
      const banksList = Array.isArray(banksRes?.banks) ? banksRes.banks : [];
      const match = banksList.find((b) => b._id === id);
      if (match) setBankName(match.bankName);
    } catch (err) {
      setError(err.message || 'Failed to load bank transaction history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this transaction? This will reverse its effect on the balance.')) return;
    try {
      await banksLedgerApi.deleteTransaction(row._id);
      load(true);
    } catch (err) {
      setError(err.message || 'Failed to delete transaction.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <Link to={`${base}/billing/wallet/overview`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 mb-4">
        <ArrowLeft size={13} /> Back to Wallet
      </Link>

      <Alert message={error} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark size={14} className="text-sky-400" />
            <h3 className="text-sm font-semibold text-gray-700">
              {bankName || 'Bank'} — Transaction History
            </h3>
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
        <TransactionsTable rows={rows} onDelete={handleDelete} emptyLabel="No transactions for this bank yet" />
      </motion.div>
    </div>
  );
}
