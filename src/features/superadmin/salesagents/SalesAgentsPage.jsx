 import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../../../shared/api/superadmin.js';
import { Spinner, Alert, Button, Modal, Input, Card } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog, Plus, Users, Wallet, Clock, CheckCircle2,
  Mail, Phone, Calendar, Link2, Sparkles,
  ChevronDown, Ban, Edit3, X, Check,
  Banknote, Inbox, User, CalendarDays, Infinity,
  Filter, ShieldCheck, Tag,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

const cardFade = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20, delay: 0.08 } },
};

function StatusBadge({ status }) {
  const config = {
    ACTIVE:   { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500',  ring: 'ring-emerald-200/50' },
    PAID:     { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500',  ring: 'ring-emerald-200/50' },
    PENDING:  { bg: 'bg-amber-50',    text: 'text-amber-600',   dot: 'bg-amber-500',    ring: 'ring-amber-200/50'   },
    APPROVED: { bg: 'bg-blue-50',     text: 'text-blue-600',    dot: 'bg-blue-500',     ring: 'ring-blue-200/50'    },
    REJECTED: { bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-500',      ring: 'ring-red-200/50'     },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500', ring: 'ring-gray-200/50' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {status?.replace('_', ' ')}
    </span>
  );
}

// ── CommissionRow (desktop table row) ────────────────────────────────────────
function CommissionRow({ commission, onUpdate }) {
  const [paying, setPaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState('');

  const handleEditOpen = () => {
    setAmountInput(commission.commissionAmount > 0 ? String(commission.commissionAmount) : '');
    setRowError('');
    setEditing(true);
  };

  const handleSaveAmount = async () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount < 0) {
      setRowError('Enter a valid amount');
      return;
    }
    setSaving(true);
    setRowError('');
    try {
      await onUpdate(commission._id, { commissionAmount: amount });
      setEditing(false);
    } catch (err) {
      setRowError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!window.confirm('Mark this commission as PAID?')) return;
    setPaying(true);
    try {
      await onUpdate(commission._id, { commissionStatus: 'PAID' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <motion.tr
        whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
        className="border-b border-gray-100 transition-colors"
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {commission.salesAgent?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{commission.salesAgent?.name}</p>
              <p className="text-[10px] text-gray-400 font-mono">{commission.salesAgent?.referralCode}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <p className="text-xs font-medium text-gray-700">{commission.admin?.name}</p>
          <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{commission.admin?.businessName || commission.admin?.email}</p>
        </td>
        <td className="px-5 py-3.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
            {commission.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
            {commission.planType}
          </span>
        </td>
        <td className="px-5 py-3.5">
          {editing ? (
            <div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={amountInput}
                  onChange={(e) => { setAmountInput(e.target.value); setRowError(''); }}
                  className="w-24 px-2 py-1 bg-white/80 border border-purple-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="PKR"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveAmount} loading={saving} className="!py-1 !px-2 !text-[10px]">
                  <Check size={10} className="mr-0.5" />Save
                </Button>
                <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <X size={12} />
                </button>
              </div>
              {rowError && <p className="text-[10px] text-red-500 mt-0.5">{rowError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${commission.commissionAmount > 0 ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                {commission.commissionAmount > 0
                  ? `PKR ${Number(commission.commissionAmount).toLocaleString()}`
                  : 'Not set'}
              </span>
              {commission.commissionStatus !== 'PAID' && (
                <button
                  onClick={handleEditOpen}
                  className="inline-flex items-center gap-0.5 text-[10px] text-purple-500 hover:text-purple-700 font-medium"
                >
                  <Edit3 size={9} />
                  {commission.commissionAmount > 0 ? 'Edit' : 'Set'}
                </button>
              )}
            </div>
          )}
        </td>
        <td className="px-5 py-3.5">
          <StatusBadge status={commission.commissionStatus} />
        </td>
        <td className="px-5 py-3.5">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar size={9} className="text-gray-300" />
            {commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : '—'}
          </span>
        </td>
        <td className="px-5 py-3.5 text-right">
          {commission.commissionStatus === 'PENDING' && commission.commissionAmount > 0 && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" variant="success" onClick={handleMarkPaid} loading={paying} className="!py-1 !px-2.5 !text-[10px]">
                <CheckCircle2 size={10} className="mr-0.5" />Paid
              </Button>
            </motion.div>
          )}
        </td>
      </motion.tr>
    </>
  );
}

// ── Mobile Commission Card ───────────────────────────────────────────────────
function MobileCommissionCard({ commission, onUpdate, index }) {
  const [paying, setPaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState('');

  const handleEditOpen = () => {
    setAmountInput(commission.commissionAmount > 0 ? String(commission.commissionAmount) : '');
    setRowError('');
    setEditing(true);
  };

  const handleSaveAmount = async () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount < 0) { setRowError('Enter a valid amount'); return; }
    setSaving(true); setRowError('');
    try {
      await onUpdate(commission._id, { commissionAmount: amount });
      setEditing(false);
    } catch (err) { setRowError(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleMarkPaid = async () => {
    if (!window.confirm('Mark this commission as PAID?')) return;
    setPaying(true);
    try { await onUpdate(commission._id, { commissionStatus: 'PAID' }); }
    finally { setPaying(false); }
  };

  const canEdit = commission.commissionStatus !== 'PAID';
  const canPay = commission.commissionStatus === 'PENDING' && commission.commissionAmount > 0;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-3 space-y-2"
    >
      {/* Row 1: Agent + Admin */}
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">
          {commission.salesAgent?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-900 truncate">{commission.salesAgent?.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{commission.admin?.name} · {commission.admin?.businessName || commission.admin?.email}</p>
        </div>
        <StatusBadge status={commission.commissionStatus} />
      </div>

      {/* Row 2: Plan + Amount */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
          {commission.planType === 'YEARLY' ? <CalendarDays size={8} /> : <Infinity size={8} />}
          {commission.planType}
        </span>
        {editing ? (
          <div className="flex items-center gap-1 flex-1 max-w-[180px]">
            <input
              type="number"
              min="0"
              value={amountInput}
              onChange={(e) => { setAmountInput(e.target.value); setRowError(''); }}
              className="w-full px-2 py-1 bg-white/80 border border-purple-300 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="PKR"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveAmount} loading={saving} className="!py-1 !px-2 !text-[9px] shrink-0">Save</Button>
            <button onClick={() => setEditing(false)} className="p-0.5 text-gray-400"><X size={11} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${commission.commissionAmount > 0 ? 'text-gray-900' : 'text-gray-300 italic text-[10px]'}`}>
              {commission.commissionAmount > 0 ? `PKR ${Number(commission.commissionAmount).toLocaleString()}` : 'Not set'}
            </span>
            {canEdit && (
              <button onClick={handleEditOpen} className="text-purple-500 p-0.5">
                <Edit3 size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {rowError && <p className="text-[10px] text-red-500">{rowError}</p>}

      {/* Actions */}
      {canPay && (
        <Button
          size="sm"
          variant="success"
          onClick={handleMarkPaid}
          loading={paying}
          className="!py-1.5 !text-[10px] w-full !rounded-lg"
        >
          <CheckCircle2 size={11} className="mr-1" />Mark as Paid
        </Button>
      )}
    </motion.div>
  );
}

// ── Mobile Agent Card ────────────────────────────────────────────────────────
function MobileAgentCard({ agent, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-3 space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
            {agent.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{agent.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{agent.email}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/40 px-1.5 py-0.5 rounded">
          {agent.referralCode}
        </span>
        {agent.phone && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
            <Phone size={9} />{agent.phone}
          </span>
        )}
        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 ml-auto">
          <Calendar size={9} />{new Date(agent.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}

export default function SalesAgentsPage() {
  const [tab, setTab] = useState('agents');

  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [commissions, setCommissions] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [commissionsError, setCommissionsError] = useState('');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('');

  const fetchAgents = useCallback(() => {
    setAgentsLoading(true);
    superadminApi.listSalesAgents()
      .then((res) => setAgents(res.data || []))
      .catch((err) => setAgentsError(err.message))
      .finally(() => setAgentsLoading(false));
  }, []);

  const fetchCommissions = useCallback(() => {
    setCommissionsLoading(true);
    const params = {};
    if (commissionStatusFilter) params.status = commissionStatusFilter;
    superadminApi.listCommissions(params)
      .then((res) => setCommissions(res.data || []))
      .catch((err) => setCommissionsError(err.message))
      .finally(() => setCommissionsLoading(false));
  }, [commissionStatusFilter]);

  useEffect(() => { if (tab === 'agents') fetchAgents(); }, [tab, fetchAgents]);
  useEffect(() => { if (tab === 'commissions') fetchCommissions(); }, [tab, fetchCommissions]);

  const handleCreateAgent = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      await superadminApi.createSalesAgent(form);
      setCreateModal(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      fetchAgents();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCommission = async (id, body) => {
    try {
      await superadminApi.setCommission(id, body);
      fetchCommissions();
    } catch (err) {
      setCommissionsError(err.message);
      throw err;
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pendingTotal = commissions
    .filter((c) => c.commissionStatus === 'PENDING')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const paidTotal = commissions
    .filter((c) => c.commissionStatus === 'PAID')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const tabs = [
    ['agents', 'Agents', Users],
    ['commissions', 'Commissions', Wallet],
  ];

  const commFilters = [
    ['', 'All', Filter],
    ['PENDING', 'Pending', Clock],
    ['PAID', 'Paid', CheckCircle2],
  ];

  const summaryCards = [
    { label: 'Total Commissions', value: pendingTotal + paidTotal, icon: Wallet, gradient: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/20', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Pending', value: pendingTotal, icon: Clock, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Paid', value: paidTotal, icon: CheckCircle2, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50', text: 'text-emerald-600' },
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
            <Sparkles size={16} className="text-purple-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Sales Agents</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage agents and their commissions</p>
        </div>
        {tab === 'agents' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setCreateModal(true); setFormError(''); setForm({ name: '', email: '', phone: '', password: '' }); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-purple-500/25 shrink-0"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Create Agent</span>
            <span className="sm:hidden">Create</span>
          </motion.button>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.04 }}
        className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit mb-5"
      >
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              tab === key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Create Agent Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Sales Agent">
        <Alert message={formError} />
        <div className="space-y-3 mt-4">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <User size={11} className="text-purple-400" />Name *
            </label>
            <input
              value={form.name} onChange={set('name')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all"
              placeholder="Agent name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Mail size={11} className="text-purple-400" />Email *
            </label>
            <input
              type="email" value={form.email} onChange={set('email')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all"
              placeholder="agent@email.com"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Phone size={11} className="text-purple-400" />Phone *
            </label>
            <input
              value={form.phone} onChange={set('phone')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all"
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <ShieldCheck size={11} className="text-purple-400" />Password *
            </label>
            <input
              type="password" value={form.password} onChange={set('password')}
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateAgent} loading={formLoading}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AGENTS TAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === 'agents' && (
        <>
          <Alert message={agentsError} />
          {agentsLoading ? <Spinner /> : (
            <>
              {/* Mobile cards */}
              <div className="space-y-2 lg:hidden">
                {agents.length === 0 && (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                      <UserCog size={20} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-medium text-gray-400">No sales agents yet</p>
                  </div>
                )}
                {agents.map((agent, i) => (
                  <MobileAgentCard key={agent._id} agent={agent} index={i} />
                ))}
              </div>

              {/* Desktop table */}
              <motion.div
                variants={cardFade}
                initial="hidden"
                animate="visible"
                className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
              >
                {agents.length === 0 ? (
                  <div className="flex flex-col items-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <UserCog size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No sales agents yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 border-b border-gray-200/60">
                        <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-semibold">Agent</th>
                          <th className="px-5 py-3 font-semibold">Referral Code</th>
                          <th className="px-5 py-3 font-semibold">Phone</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {agents.map((agent, i) => (
                            <motion.tr
                              key={agent._id}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                              className="border-b border-gray-100 transition-colors"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                                    {agent.name?.[0]?.toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{agent.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{agent.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/40 px-2 py-1 rounded-lg">
                                  {agent.referralCode}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                {agent.phone ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <Phone size={11} className="text-gray-300" />
                                    {agent.phone}
                                  </span>
                                ) : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                              <td className="px-5 py-3.5"><StatusBadge status={agent.status} /></td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                  <Calendar size={10} className="text-gray-300" />
                                  {new Date(agent.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMMISSIONS TAB */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === 'commissions' && (
        <>
          {/* Summary cards */}
          {!commissionsLoading && commissions.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
              {summaryCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-3 sm:p-4 overflow-hidden"
                >
                  <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon size={13} className="text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <p className={`text-sm sm:text-xl font-bold ${card.text}`}>PKR {card.value.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Commission filters */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.04 }}
            className="flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none sm:overflow-visible"
          >
            {commFilters.map(([val, label, Icon], i) => (
              <motion.button
                key={val || 'all'}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileTap={{ scale: 0.96 }}
                onClick={() => setCommissionStatusFilter(val)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all duration-200 shrink-0 ${
                  commissionStatusFilter === val
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                    : 'bg-white/80 text-gray-500 border-gray-200/60 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <Icon size={11} />
                {label}
              </motion.button>
            ))}
          </motion.div>

          <Alert message={commissionsError} />

          {commissionsLoading ? <Spinner /> : (
            <>
              {/* Mobile cards */}
              <div className="space-y-2 lg:hidden">
                {commissions.length === 0 && (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                      <Banknote size={20} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-medium text-gray-400">No commissions yet</p>
                  </div>
                )}
                {commissions.map((c, i) => (
                  <MobileCommissionCard key={c._id} commission={c} onUpdate={handleUpdateCommission} index={i} />
                ))}
              </div>

              {/* Desktop table */}
              <motion.div
                variants={cardFade}
                initial="hidden"
                animate="visible"
                className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
              >
                {commissions.length === 0 ? (
                  <div className="flex flex-col items-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <Banknote size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No commissions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 border-b border-gray-200/60">
                        <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-semibold">Agent</th>
                          <th className="px-5 py-3 font-semibold">Admin</th>
                          <th className="px-5 py-3 font-semibold">Plan</th>
                          <th className="px-5 py-3 font-semibold">Amount</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Paid On</th>
                          <th className="px-5 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {commissions.map((c) => (
                            <CommissionRow key={c._id} commission={c} onUpdate={handleUpdateCommission} />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </>
      )}
    </div>
  );
}