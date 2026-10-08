 import { useState, useEffect, useCallback } from 'react';
import { branchAdminBranchApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, MapPin, Phone, UserCog, Sparkles,
  Inbox, Edit3, Trash2, Calendar,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

const emptyForm = { name: '', address: '', phone: '', managerName: '' };

function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
      isActive
        ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/50'
        : 'bg-gray-100 text-gray-500 ring-gray-200/50'
    }`}>
      <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

function MobileCard({ branch, index, onEdit, onDelete }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {branch.name?.[0]?.toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900 text-sm truncate">{branch.name}</span>
          </div>
          <StatusBadge isActive={branch.isActive} />
        </div>
        {branch.address && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={10} className="text-gray-400 shrink-0" />
            <span className="truncate">{branch.address}</span>
          </div>
        )}
        {branch.phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone size={10} className="text-gray-400 shrink-0" />
            <span>{branch.phone}</span>
          </div>
        )}
        {branch.managerName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <UserCog size={10} className="text-gray-400 shrink-0" />
            <span>{branch.managerName}</span>
          </div>
        )}
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => onEdit(branch)}
            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100"
          >
            <Edit3 size={10} />Edit
          </button>
          <button
            onClick={() => onDelete(branch)}
            className="px-3 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchBranches = useCallback(() => {
    setLoading(true);
    branchAdminBranchApi.list()
      .then((res) => setBranches(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (branch) => {
    setEditing(branch);
    setForm({ name: branch.name || '', address: branch.address || '', phone: branch.phone || '', managerName: branch.managerName || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Branch name is required.'); return; }
    setFormLoading(true);
    try {
      if (editing) {
        await branchAdminBranchApi.update(editing._id, form);
      } else {
        await branchAdminBranchApi.create(form);
      }
      setModalOpen(false);
      fetchBranches();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (branch) => {
    if (!window.confirm(`Delete "${branch.name}"? This cannot be undone.`)) return;
    try {
      await branchAdminBranchApi.remove(branch._id);
      fetchBranches();
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
            <Sparkles size={16} className="text-indigo-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Branches</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage your branches</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-500/25 shrink-0"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Add Branch</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </motion.div>

      <Alert message={error} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Branch' : 'Add Branch'}>
        <Alert message={formError} />
        <div className="space-y-3 mt-4">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Building2 size={11} className="text-indigo-400" />Branch Name *
            </label>
            <input
              value={form.name} onChange={set('name')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
              placeholder="Main Branch"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <MapPin size={11} className="text-indigo-400" />Address
            </label>
            <input
              value={form.address} onChange={set('address')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
              placeholder="Street, City"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Phone size={11} className="text-indigo-400" />Phone
            </label>
            <input
              value={form.phone} onChange={set('phone')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <UserCog size={11} className="text-indigo-400" />Manager Name
            </label>
            <input
              value={form.managerName} onChange={set('managerName')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
              placeholder="Branch manager"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={formLoading}>{formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create Branch'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : (
        <>
          <div className="space-y-2 lg:hidden">
            {branches.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                  <Inbox size={20} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No branches yet</p>
              </div>
            )}
            {branches.map((b, i) => (
              <MobileCard key={b._id} branch={b} index={i} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.08 }}
            className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Branch</th>
                    <th className="px-5 py-3 font-semibold">Address</th>
                    <th className="px-5 py-3 font-semibold">Manager</th>
                    <th className="px-5 py-3 font-semibold">Phone</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <Inbox size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No branches yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  <AnimatePresence>
                    {branches.map((b, i) => (
                      <motion.tr
                        key={b._id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                        className="border-b border-gray-100 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                              {b.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm truncate">{b.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500 truncate max-w-[200px] inline-block">{b.address || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-600">{b.managerName || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500">{b.phone || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge isActive={b.isActive} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar size={10} className="text-gray-300" />
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(b)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100"
                            >
                              <Edit3 size={10} />Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500"
                            >
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
        </>
      )}
    </div>
  );
}