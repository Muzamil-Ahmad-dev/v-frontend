import { useState, useEffect, useCallback } from 'react';
import { branchAdminRepairsApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Button, Modal, Badge } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Plus, Sparkles, Inbox, Edit3, Trash2, Search } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 } }),
};

const STATUS_COLOR = { todo: 'gray', 'in-progress': 'yellow', complete: 'green', handover: 'indigo' };
const STATUS_LABEL = { todo: 'To Do', 'in-progress': 'In Progress', complete: 'Complete', handover: 'Handed Over' };

const EMPTY_FORM = {
  customerName: '', customerNumber: '', customerType: 'new', company: '', model: '',
  faultIssue: '', estimatedAmount: '', paymentType: 'full', advance: '', status: 'todo',
};

function Field({ label, children, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children || (
        <input
          {...rest}
          className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
        />
      )}
    </div>
  );
}

export default function RepairsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    branchAdminRepairsApi.list(params)
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true); };
  const openEdit = (job) => {
    setEditing(job);
    setForm({
      customerName: job.customerName || '', customerNumber: job.customerNumber || '',
      customerType: job.customerType || 'new', company: job.company || '', model: job.model || '',
      faultIssue: job.faultIssue || '', estimatedAmount: job.estimatedAmount ?? '',
      paymentType: job.paymentType || 'full', advance: job.advance ?? '', status: job.status || 'todo',
    });
    setFormError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.customerNumber.trim() || !form.faultIssue.trim() || form.estimatedAmount === '') {
      setFormError('Customer name, number, fault issue and estimated amount are required.'); return;
    }
    setSaving(true); setFormError('');
    try {
      const body = { ...form, estimatedAmount: Number(form.estimatedAmount), advance: Number(form.advance || 0) };
      if (editing) await branchAdminRepairsApi.update(editing._id, body);
      else await branchAdminRepairsApi.create(body);
      setModalOpen(false); fetchItems();
    } catch (err) { setFormError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete repair job for "${job.customerName}"?`)) return;
    try { await branchAdminRepairsApi.remove(job._id); fetchItems(); }
    catch (err) { setError(err.message); }
  };

  const quickStatus = async (job, status) => {
    try { await branchAdminRepairsApi.update(job._id, { status }); fetchItems(); }
    catch (err) { setError(err.message); }
  };

  const filtered = items.filter((j) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [j.customerName, j.customerNumber, j.company, j.model].some((v) => v?.toLowerCase().includes(s));
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={16} className="text-indigo-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Repairs</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Track repair jobs for your branch</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer..."
              className="pl-8 pr-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-40"
            />
          </div>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-500/25 shrink-0"
          >
            <Plus size={13} />New Job
          </motion.button>
        </div>
      </motion.div>

      <Alert type="error" message={error} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Repair Job' : 'New Repair Job'}>
        <div className="space-y-3">
          <Alert type="error" message={formError} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer name *" value={form.customerName} onChange={set('customerName')} />
            <Field label="Customer number *" value={form.customerNumber} onChange={set('customerNumber')} />
            <Field label="Company" value={form.company} onChange={set('company')} />
            <Field label="Model" value={form.model} onChange={set('model')} />
            <Field label="Estimated amount *" type="number" value={form.estimatedAmount} onChange={set('estimatedAmount')} />
            <Field label="Advance" type="number" value={form.advance} onChange={set('advance')} />
            <Field label="Payment type">
              <select value={form.paymentType} onChange={set('paymentType')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="full">Full</option>
                <option value="credit">Credit</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Fault / Issue *" value={form.faultIssue} onChange={set('faultIssue')} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Job'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Device</th>
                  <th className="px-5 py-3 font-semibold">Issue</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-14">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                          <Inbox size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No repair jobs yet</p>
                      </div>
                    </td>
                  </tr>
                )}
                <AnimatePresence>
                  {filtered.map((job, i) => (
                    <motion.tr key={job._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                      className="border-b border-gray-100 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
                            <Wrench size={13} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{job.customerName}</p>
                            <p className="text-[11px] text-gray-400">{job.customerNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{job.company} {job.model}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 max-w-[200px] truncate">{job.faultIssue}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">Rs. {job.estimatedAmount}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={job.status}
                          onChange={(e) => quickStatus(job, e.target.value)}
                          className="text-[10px] font-semibold rounded-full px-2 py-1 border border-gray-200/60 bg-white"
                        >
                          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(job)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100">
                            <Edit3 size={10} />Edit
                          </button>
                          <button onClick={() => handleDelete(job)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
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
