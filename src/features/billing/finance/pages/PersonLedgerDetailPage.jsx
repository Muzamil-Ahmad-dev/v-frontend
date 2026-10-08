import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, FileText, Edit2, Trash2, Inbox, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Card, Button, Modal, Alert, Spinner, Badge } from '../../../../shared/components/ui.jsx';
import { personApi } from '../../../../shared/api/staff.js';
import { useModulePrefix } from '../../../../shared/utils/useModulePrefix.js';

function money(n) {
  return `PKR ${Number(n || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function getStatus(person) {
  const taking = Number(person?.takingCredit || 0);
  const giving = Number(person?.givingCredit || 0);
  if (taking > giving) return 'Payable';
  if (giving > taking) return 'Receivable';
  return 'Settled';
}

export default function PersonLedgerDetailPage() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const base = useModulePrefix();

  const [person, setPerson] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [editTxn, setEditTxn] = useState(null); // { _id, takingCredit, givingCredit, description }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await personApi.getOne(personId);
      setPerson(res?.person || null);
      setTransactions(Array.isArray(res?.transactions) ? res.transactions : []);
    } catch (err) {
      setPageError(err.message || 'Failed to load person.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  const openEditTxn = (txn) => {
    setEditTxn({
      _id: txn._id,
      takingCredit: txn.takingCredit || 0,
      givingCredit: txn.givingCredit || 0,
      description: txn.description || '',
    });
    setFormError('');
  };

  const handleUpdateTxn = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError('');
      const balanceAmount = Number(editTxn.takingCredit || 0) - Number(editTxn.givingCredit || 0);
      await personApi.updateTransaction(editTxn._id, {
        takingCredit: Number(editTxn.takingCredit) || 0,
        givingCredit: Number(editTxn.givingCredit) || 0,
        description: editTxn.description,
        balanceAmount,
      });
      setEditTxn(null);
      fetchDetail();
    } catch (err) {
      setFormError(err.message || 'Error updating transaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTxn = async (id) => {
    try {
      await personApi.deleteTransaction(id);
      fetchDetail();
    } catch (err) {
      setPageError(err.message || 'Error deleting transaction.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto"><Spinner /></div>
    );
  }

  if (!person) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Alert message={pageError || 'Person not found.'} />
        <Link to={`${base}/billing/finance/payables-receivables`} className="text-sm text-indigo-600 mt-3 inline-block">← Back to list</Link>
      </div>
    );
  }

  const status = getStatus(person);
  const net = Math.abs((person.takingCredit || 0) - (person.givingCredit || 0));
  const statusColor = status === 'Payable' ? 'red' : status === 'Receivable' ? 'green' : 'gray';

  return (
    <div className="p-3 sm:p-5 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(`${base}/billing/finance/payables-receivables`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Payables & Receivables
      </button>

      <Alert message={pageError} />

      <Card className="p-5 sm:p-7 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{person.name}</h1>
              <Badge color={statusColor}>{status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5"><Phone size={13} /> {person.number}</span>
              {person.reference && (
                <span className="inline-flex items-center gap-1.5"><FileText size={13} /> {person.reference}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Net Balance</p>
            <p className={`text-xl font-bold ${status === 'Payable' ? 'text-red-500' : status === 'Receivable' ? 'text-emerald-500' : 'text-gray-500'}`}>
              {money(net)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="p-3 rounded-lg bg-red-50 text-center">
            <p className="text-[11px] text-gray-500 mb-1 inline-flex items-center gap-1 justify-center"><ArrowDown size={11} /> Taking Credit</p>
            <p className="text-sm font-bold text-red-600">{money(person.takingCredit)}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-center">
            <p className="text-[11px] text-gray-500 mb-1 inline-flex items-center gap-1 justify-center"><ArrowUp size={11} /> Giving Credit</p>
            <p className="text-sm font-bold text-emerald-600">{money(person.givingCredit)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Inbox size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Date</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold text-right">Taking</th>
                  <th className="px-4 py-3 font-semibold text-right">Giving</th>
                  <th className="px-4 py-3 font-semibold text-right">Balance</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((t, idx) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(t.createdAt || t.date)}</td>
                      <td className="px-4 py-3 text-gray-600">{t.description || '—'}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{t.takingCredit ? money(t.takingCredit) : '—'}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">{t.givingCredit ? money(t.givingCredit) : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{money(t.balanceAmount)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Edit2 size={14} className="cursor-pointer text-indigo-500" onClick={() => openEditTxn(t)} />
                          <Trash2 size={14} className="cursor-pointer text-red-500" onClick={() => handleDeleteTxn(t._id)} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Transaction Modal */}
      <Modal open={!!editTxn} onClose={() => setEditTxn(null)} title="Edit Transaction">
        {editTxn && (
          <form onSubmit={handleUpdateTxn} className="space-y-4">
            <Alert message={formError} />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Taking Credit</label>
              <input
                type="number" min="0" step="0.01" value={editTxn.takingCredit}
                onChange={(e) => setEditTxn({ ...editTxn, takingCredit: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Giving Credit</label>
              <input
                type="number" min="0" step="0.01" value={editTxn.givingCredit}
                onChange={(e) => setEditTxn({ ...editTxn, givingCredit: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
              <input
                type="text" value={editTxn.description}
                onChange={(e) => setEditTxn({ ...editTxn, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditTxn(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}