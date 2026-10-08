import { useState, useEffect, useCallback } from 'react';
import { shopOwnerApi, branchApi } from '../../../shared/api/admin.js';
import { Spinner, Alert, Button, Modal, Pagination } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Plus, Mail, Phone, MapPin, Building2, Sparkles,
  Inbox, Edit3, Trash2, Power, PowerOff, Calendar,
  Users, CheckCircle2, XCircle, Crown,
  CalendarDays, Infinity, ChevronDown, Lock,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

const emptyForm = {
  name: '', email: '', phone: '', password: '',
  businessName: '', address: '', branchId: '', planType: '',
};

function StatusBadge({ status }) {
  const config = {
    ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', ring: 'ring-emerald-200/50' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', ring: 'ring-amber-200/50' },
    DEACTIVATED: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', ring: 'ring-gray-200/50' },
  };
  const c = config[status] || config.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, gradient, shadow, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg ${shadow} shrink-0`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className={`text-lg font-bold ${text || 'text-gray-900'}`}>{value}</p>
      </div>
    </motion.div>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function MobileCard({ owner, index, onEdit, onToggle, onDelete, busy }) {
  const [expanded, setExpanded] = useState(false);
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {owner.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{owner.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{owner.email}</p>
            </div>
          </div>
          <StatusBadge status={owner.status} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {owner.businessName && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
              <Building2 size={10} className="text-teal-400" />{owner.businessName}
            </span>
          )}
          {owner.branchId?.name && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
              <MapPin size={9} />{owner.branchId.name}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-teal-500 transition-colors py-1 border-t border-gray-100"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} />
          </motion.span>
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3 space-y-1.5 bg-gray-50/30">
              {owner.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Phone size={10} className="text-teal-400" />{owner.phone}
                </div>
              )}
              {owner.address && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <MapPin size={10} className="text-teal-400" />{owner.address}
                </div>
              )}
              {owner.planType && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  {owner.planType === 'YEARLY' ? <CalendarDays size={10} className="text-teal-400" /> : <Infinity size={10} className="text-teal-400" />}
                  {owner.planType}
                </div>
              )}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => onEdit(owner)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-200/50 hover:bg-teal-100"
                >
                  <Edit3 size={10} />Edit
                </button>
                <button
                  onClick={() => onToggle(owner)}
                  disabled={busy}
                  className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold border disabled:opacity-50 ${
                    owner.status === 'ACTIVE'
                      ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
                  }`}
                >
                  {owner.status === 'ACTIVE' ? <PowerOff size={10} /> : <Power size={10} />}
                  {owner.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDelete(owner)}
                  className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ShopOwnersPage() {
  const [owners, setOwners] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchOwners = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (branchFilter) params.branchId = branchFilter;
    shopOwnerApi.list(params)
      .then((res) => {
        setOwners(res.data?.shopOwners || []);
        setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, statusFilter, branchFilter]);

  const fetchStats = useCallback(() => {
    shopOwnerApi.getDashboard()
      .then((res) => setStats(res.data?.shopOwners || null))
      .catch(() => {});
  }, []);

  const fetchBranches = useCallback(() => {
    branchApi.list().then((res) => setBranches(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchOwners(); }, [fetchOwners]);
  useEffect(() => { fetchStats(); fetchBranches(); }, [fetchStats, fetchBranches]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (owner) => {
    setEditing(owner);
    setForm({
      name: owner.name || '',
      email: owner.email || '',
      phone: owner.phone || '',
      password: '',
      businessName: owner.businessName || '',
      address: owner.address || '',
      branchId: owner.branchId?._id || owner.branchId || '',
      planType: owner.planType || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing && (!form.name.trim() || !form.email.trim() || !form.password.trim())) {
      setFormError('Name, email and password are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      if (editing) {
        const { password, email, ...rest } = form; // email & password not editable here
        await shopOwnerApi.update(editing._id, rest);
      } else {
        await shopOwnerApi.create(form);
      }
      setModalOpen(false);
      fetchOwners();
      fetchStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (owner) => {
    setBusyId(owner._id);
    try {
      await shopOwnerApi.toggleStatus(owner._id, owner.status === 'ACTIVE' ? 'deactivate' : 'activate');
      fetchOwners();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (owner) => {
    if (!window.confirm(`Delete shop owner "${owner.name}"? This cannot be undone.`)) return;
    setBusyId(owner._id);
    try {
      await shopOwnerApi.remove(owner._id);
      fetchOwners();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const statusOptions = [
    ['', 'All Status'], ['ACTIVE', 'Active'], ['PENDING', 'Pending'], ['DEACTIVATED', 'Deactivated'],
  ];

  return (
    <div className="p-3 sm:p-5 lg:p-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex items-center justify-between mb-5 sm:mb-7 gap-3"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={16} className="text-teal-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Shop Owners</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage shop owner accounts across your branches</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-teal-500/25 shrink-0"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Add Shop Owner</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard label="Total" value={stats.total} icon={Users} gradient="from-teal-400 to-cyan-500" shadow="shadow-teal-500/20" />
          <StatCard label="Active" value={stats.active} icon={CheckCircle2} gradient="from-emerald-400 to-emerald-600" shadow="shadow-emerald-500/20" text="text-emerald-600" />
          <StatCard label="Deactivated" value={stats.deactivated} icon={XCircle} gradient="from-gray-400 to-gray-500" shadow="shadow-gray-500/20" text="text-gray-500" />
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
      >
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200/60 rounded-lg text-xs font-medium text-gray-600 shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        >
          {statusOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
        <select
          value={branchFilter}
          onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200/60 rounded-lg text-xs font-medium text-gray-600 shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        >
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </motion.div>

      <Alert message={error} />

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Shop Owner' : 'Add Shop Owner'}>
        <Alert message={formError} />
        <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Store size={11} className="text-teal-400" />Name *
            </label>
            <input
              value={form.name} onChange={set('name')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
              placeholder="Owner name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Mail size={11} className="text-teal-400" />Email *
            </label>
            <input
              type="email" value={form.email} onChange={set('email')} disabled={!!editing}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all disabled:opacity-60"
              placeholder="owner@email.com"
            />
          </div>
          {!editing && (
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                <Lock size={11} className="text-teal-400" />Password *
              </label>
              <input
                type="password" value={form.password} onChange={set('password')}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Phone size={11} className="text-teal-400" />Phone
            </label>
            <input
              value={form.phone} onChange={set('phone')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Building2 size={11} className="text-teal-400" />Business Name
            </label>
            <input
              value={form.businessName} onChange={set('businessName')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
              placeholder="Shop / business name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <MapPin size={11} className="text-teal-400" />Address
            </label>
            <input
              value={form.address} onChange={set('address')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
              placeholder="Shop address"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <MapPin size={11} className="text-teal-400" />Branch
            </label>
            <select
              value={form.branchId} onChange={set('branchId')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
            >
              <option value="">No branch</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Crown size={11} className="text-teal-400" />Plan Type
            </label>
            <select
              value={form.planType} onChange={set('planType')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
            >
              <option value="">No plan</option>
              <option value="YEARLY">Yearly</option>
              <option value="LIFETIME">Lifetime</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={formLoading}>{formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create Shop Owner'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : (
        <>
          {/* Mobile cards */}
          <div className="space-y-2 lg:hidden">
            {owners.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                  <Inbox size={20} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No shop owners found</p>
              </div>
            )}
            {owners.map((o, i) => (
              <MobileCard key={o._id} owner={o} index={i} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} busy={busyId === o._id} />
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
                    <th className="px-5 py-3 font-semibold">Owner</th>
                    <th className="px-5 py-3 font-semibold">Business</th>
                    <th className="px-5 py-3 font-semibold">Branch</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <Inbox size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No shop owners found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  <AnimatePresence>
                    {owners.map((o, i) => (
                      <motion.tr
                        key={o._id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                        className="border-b border-gray-100 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                              {o.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{o.name}</p>
                              <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                                <Mail size={9} />{o.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-600 truncate max-w-[160px] inline-block">{o.businessName || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {o.branchId?.name ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                              <MapPin size={9} />{o.branchId.name}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {o.planType ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                              {o.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
                              {o.planType}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar size={10} className="text-gray-300" />
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(o)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-200/50 hover:bg-teal-100"
                            >
                              <Edit3 size={10} />Edit
                            </button>
                            <button
                              onClick={() => handleToggle(o)}
                              disabled={busyId === o._id}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border disabled:opacity-50 ${
                                o.status === 'ACTIVE'
                                  ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
                              }`}
                            >
                              {o.status === 'ACTIVE' ? <PowerOff size={10} /> : <Power size={10} />}
                              {o.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(o)}
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

          <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
