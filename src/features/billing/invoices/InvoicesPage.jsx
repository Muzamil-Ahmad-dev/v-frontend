import { useState, useEffect, useCallback } from 'react';
import { billingApi } from '../../../shared/api/staff.js';
import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Sparkles, Inbox, Edit3, Trash2, Calendar } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

const emptyForm = { customerName: '', amount: '', description: '', status: 'PENDING' };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchInvoices = useCallback(() => {
    setLoading(true);
    billingApi.listInvoices()
      .then((res) => setInvoices(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      customerName: inv.customerName || '',
      amount: inv.amount != null ? String(inv.amount) : '',
      description: inv.description || '',
      status: inv.status || 'PENDING',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    const body = { ...form, amount: Number(form.amount) };
    setFormLoading(true);
    try {
      if (editing) {
        await billingApi.updateInvoice(editing._id, body);
      } else {
        await billingApi.createInvoice(body);
      }
      setModalOpen(false);
      fetchInvoices();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await billingApi.deleteInvoice(inv._id);
      fetchInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex items-start sm:items-center justify-between gap-3 mb-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={16} className="text-sky-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Invoices</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Your branch invoices</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-sky-500/25 shrink-0"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </motion.div>

      <Alert message={error} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Invoice' : 'New Invoice'}>
        <Alert message={formError} />
        <div className="space-y-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
            <input value={form.customerName} onChange={set('customerName')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
              placeholder="Customer name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
            <input value={form.amount} onChange={set('amount')} type="number"
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all resize-none"
              placeholder="Invoice description" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={set('status')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all">
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={formLoading}>{formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create Invoice'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.08 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Invoice ID</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-14">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                          <Inbox size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No invoices yet</p>
                      </div>
                    </td>
                  </tr>
                )}
                <AnimatePresence>
                  {invoices.map((inv, i) => (
                    <motion.tr key={inv._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                      className="border-b border-gray-100 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                            <FileText size={12} />
                          </div>
                          <span className="font-mono text-xs text-gray-500">{inv._id?.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-gray-900">{inv.customerName || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {inv.amount != null ? `PKR ${Number(inv.amount).toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
                          inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/50' :
                          inv.status === 'CANCELLED' ? 'bg-red-50 text-red-500 ring-red-200/50' :
                          'bg-amber-50 text-amber-600 ring-amber-200/50'
                        }`}>
                          {inv.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar size={10} className="text-gray-300" />
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(inv)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-200/50 hover:bg-sky-100">
                            <Edit3 size={10} />Edit
                          </button>
                          <button onClick={() => handleDelete(inv)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}