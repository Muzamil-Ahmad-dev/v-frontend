import { useState, useEffect, useCallback } from 'react';
import { branchAdminStaffApi, branchAdminBranchApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Sparkles, Inbox, Edit3, Trash2, Calendar,
  Power, PowerOff, Building2, Mail, Phone,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

const ROLE_COLORS = {
  BILLING:  'bg-sky-50 text-sky-600 ring-sky-200/50',
  SALE:     'bg-emerald-50 text-emerald-600 ring-emerald-200/50',
  PURCHASE: 'bg-amber-50 text-amber-700 ring-amber-200/50',
};

const emptyForm = { role: 'BILLING', branchId: '', name: '', email: '', phone: '', password: '' };

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-500 ring-gray-200/50'}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
      status === 'ACTIVE'
        ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/50'
        : 'bg-gray-100 text-gray-500 ring-gray-200/50'
    }`}>
      <span className={`w-1 h-1 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('');

  const fetchStaff = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filterRole) params.role = filterRole;
    branchAdminStaffApi.list(params)
      .then((res) => setStaff(res.data?.staff || res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filterRole]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    branchAdminBranchApi.list()
      .then((res) => setBranches(res.data || []))
      .catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, branchId: branches[0]?._id || '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      role: member.role,
      branchId: member.branchId?._id || member.branchId || '',
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      password: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim() || !form.email.trim()) { setFormError('Name and email are required.'); return; }
    if (!editing && !form.password.trim()) { setFormError('Password is required for new staff.'); return; }
    if (!form.branchId) { setFormError('Please select a branch.'); return; }
    setFormLoading(true);
    try {
      const body = { ...form };
      if (editing && !body.password) delete body.password;
      if (editing) {
        await branchAdminStaffApi.update(editing._id, { name: body.name, phone: body.phone, branchId: body.branchId });
      } else {
        await branchAdminStaffApi.create(body);
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (member) => {
    setBusyId(member._id);
    const action = member.status === 'ACTIVE' ? 'deactivate' : 'activate';
    try {
      await branchAdminStaffApi.toggleStatus(member._id, action);
      fetchStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete "${member.name}"? This cannot be undone.`)) return;
    try {
      await branchAdminStaffApi.remove(member._id);
      fetchStaff();
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
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Staff</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage billing, sale, and purchase staff</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-500/25 shrink-0"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Add Staff</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'BILLING', 'SALE', 'PURCHASE'].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterRole === r
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {r || 'All Roles'}
          </button>
        ))}
      </div>

      <Alert message={error} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff Member' : 'Add Staff Member'}>
        <Alert message={formError} />
        <div className="space-y-3 mt-4">
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
              <select
                value={form.role} onChange={set('role')}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
              >
                <option value="BILLING">BILLING</option>
                <option value="SALE">SALE</option>
                <option value="PURCHASE">PURCHASE</option>
              </select>
            </div>
          )}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Building2 size={11} className="text-indigo-400" />Branch *
            </label>
            <select
              value={form.branchId} onChange={set('branchId')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Users size={11} className="text-indigo-400" />Name *
            </label>
            <input
              value={form.name} onChange={set('name')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
              placeholder="Full name"
            />
          </div>
          {!editing && (
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                <Mail size={11} className="text-indigo-400" />Email *
              </label>
              <input
                value={form.email} onChange={set('email')} type="email"
                className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
                placeholder="staff@example.com"
              />
            </div>
          )}
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
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
              <input
                value={form.password} onChange={set('password')} type="password"
                className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
                placeholder="Min 6 characters"
              />
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={formLoading}>{formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Add Staff'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : (
        <>
          {/* Mobile */}
          <div className="space-y-2 lg:hidden">
            {staff.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                  <Inbox size={20} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No staff members yet</p>
              </div>
            )}
            {staff.map((m, i) => (
              <motion.div key={m._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm truncate">{m.name}</span>
                  </div>
                  <RoleBadge role={m.role} />
                </div>
                <p className="text-xs text-gray-500">{m.email}</p>
                {m.branchId?.name && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Building2 size={10} className="text-gray-300" />{m.branchId.name}
                  </p>
                )}
                <div className="flex items-center gap-1.5 pt-1">
                  <StatusBadge status={m.status} />
                  <button onClick={() => openEdit(m)} className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100">
                    <Edit3 size={10} />Edit
                  </button>
                  <button onClick={() => handleToggleStatus(m)} disabled={busyId === m._id}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border disabled:opacity-50 ${
                      m.status === 'ACTIVE'
                        ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
                    }`}
                  >
                    {m.status === 'ACTIVE' ? <PowerOff size={10} /> : <Power size={10} />}
                  </button>
                  <button onClick={() => handleDelete(m)} className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={10} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop table */}
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
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Branch</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <Inbox size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No staff members yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  <AnimatePresence>
                    {staff.map((m, i) => (
                      <motion.tr key={m._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                        whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                        className="border-b border-gray-100 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                              {m.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><RoleBadge role={m.role} /></td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500">{m.branchId?.name || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500">{m.email}</span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar size={10} className="text-gray-300" />
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openEdit(m)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100">
                              <Edit3 size={10} />Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(m)}
                              disabled={busyId === m._id}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border disabled:opacity-50 ${
                                m.status === 'ACTIVE'
                                  ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
                              }`}
                            >
                              {m.status === 'ACTIVE' ? <><PowerOff size={10} />Deactivate</> : <><Power size={10} />Activate</>}
                            </button>
                            <button onClick={() => handleDelete(m)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
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