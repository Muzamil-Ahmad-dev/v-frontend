 import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../../../shared/api/superadmin.js';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Clock, XCircle, CheckCircle2,
  User, Crown, UserCog, Link2, Sparkles,
  CalendarDays, Infinity, Inbox, Filter,
  ChevronDown, Mail, Calendar, Users as UsersIcon,
  Power, PowerOff, GitPullRequest, SendHorizonal, DollarSign,
} from 'lucide-react';

// Requested price = the price the admin/sales-agent submitted for approval.
// Prefer the negotiated (submitted) price, fall back to the older negotiationPrice field.
function getRequestedPrice(user) {
  return user.negotiatedPrice ?? user.negotiationPrice ?? null;
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE:                { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500',  ring: 'ring-emerald-200/50'  },
    APPROVED:              { bg: 'bg-blue-50',     text: 'text-blue-600',    dot: 'bg-blue-500',     ring: 'ring-blue-200/50'     },
    PENDING_APPROVAL:      { bg: 'bg-amber-50',    text: 'text-amber-600',   dot: 'bg-amber-500',    ring: 'ring-amber-200/50'    },
    PENDING_NEGOTIATION:   { bg: 'bg-violet-50',   text: 'text-violet-600',  dot: 'bg-violet-500',   ring: 'ring-violet-200/50'   },
    NEGOTIATION_SUBMITTED: { bg: 'bg-sky-50',      text: 'text-sky-600',     dot: 'bg-sky-500',      ring: 'ring-sky-200/50'      },
    REJECTED:              { bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-500',      ring: 'ring-red-200/50'      },
    DEACTIVATED:           { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400',     ring: 'ring-gray-200/50'     },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500', ring: 'ring-gray-200/50' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

function RoleBadge({ role }) {
  const config = {
    ADMIN:       { bg: 'bg-purple-50',  text: 'text-purple-600', border: 'border-purple-200/50',  icon: Crown     },
    SALES_AGENT: { bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200/50', icon: UserCog   },
    SUPER_ADMIN: { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200/50',  icon: ShieldCheck },
  };
  const c = config[role] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200/50', icon: User };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <Icon size={9} />
      {role?.replace(/_/g, ' ')}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

// ── Activate / Deactivate button (ADMIN accounts only) ──────────────────────
function ToggleStatusButton({ user, onToggle, busy }) {
  if (user.role !== 'ADMIN') return null;
  if (user.status !== 'ACTIVE' && user.status !== 'DEACTIVATED') return null;

  const isActive = user.status === 'ACTIVE';
  return (
    <button
      onClick={() => onToggle(user, isActive ? 'deactivate' : 'activate')}
      disabled={busy}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
          : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
      }`}
    >
      {isActive ? <PowerOff size={10} /> : <Power size={10} />}
      {isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
}

// ── Mobile Card ──────────────────────────────────────────────────────────────
function MobileCard({ user, index, onToggle, busyId }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = user.planType || user.salesAgentId || getRequestedPrice(user) != null;

  const roleColors = {
    ADMIN: 'from-purple-400 to-purple-600',
    SALES_AGENT: 'from-orange-400 to-amber-500',
    SUPER_ADMIN: 'from-slate-500 to-slate-700',
  };
  const gradient = roleColors[user.role] || 'from-slate-400 to-slate-600';

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
    >
      <div className="p-3 space-y-2">
        {/* Row 1: Name + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0`}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <StatusBadge status={user.status} />
        </div>

        {/* Row 2: Role badge + joined date */}
        <div className="flex items-center gap-2 flex-wrap">
          <RoleBadge role={user.role} />
          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
            <Calendar size={9} />
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Row 3: Activate / Deactivate (ADMIN only) */}
        <ToggleStatusButton user={user} onToggle={onToggle} busy={busyId === user._id} />
      </div>

      {/* Expand toggle */}
      {hasExtra && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-purple-500 transition-colors py-1.5 border-t border-gray-100 bg-gray-50/40"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} />
          </motion.span>
          {expanded ? 'Less' : 'Details'}
        </button>
      )}

      {/* Expanded */}
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
              {user.planType && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  {user.planType === 'YEARLY' ? <CalendarDays size={10} className="text-purple-400" /> : <Infinity size={10} className="text-purple-400" />}
                  <span className="font-medium">{user.planType}</span>
                </div>
              )}
              {user.registrationSource === 'REFERRAL' && user.salesAgentId ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/40 px-1.5 py-0.5 rounded">
                    {user.salesAgentId.referralCode || user.salesAgentId.name}
                  </span>
                  <span className="text-[10px] text-gray-400">referred</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-gray-300">
                  <Link2 size={9} />No referral
                </div>
              )}
              {user.role === 'ADMIN' && getRequestedPrice(user) != null && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <DollarSign size={10} className="text-emerald-500" />
                  <span className="font-medium">
                    Requested Price: PKR {getRequestedPrice(user).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Select styled as filter chip ────────────────────────────────────────────
function FilterSelect({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative">
      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Icon size={13} />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-8 pr-8 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all cursor-pointer"
      >
        {options.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <ChevronDown size={12} />
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId]         = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = {};
    if (roleFilter)   params.role   = roleFilter;
    if (statusFilter) params.status = statusFilter;
    superadminApi.listUsers(params)
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Backend expects { action: 'activate' | 'deactivate' } in PATCH body
  const handleToggleStatus = (user, action) => {
    setBusyId(user._id);
    setError('');
    superadminApi.toggleAdminStatus(user._id, action)
      .then(() => fetchUsers())
      .catch((err) => setError(err.message))
      .finally(() => setBusyId(null));
  };

  const roleOptions = [
    ['',            'All Roles'],
    ['ADMIN',       'Admin'],
    ['SALES_AGENT', 'Sales Agent'],
    ['SUPER_ADMIN', 'Super Admin'],
  ];

  const statusOptions = [
    ['',                       'All Status'],
    ['PENDING_APPROVAL',       'Pending Approval'],
    ['PENDING_NEGOTIATION',    'Pending Negotiation'],
    ['NEGOTIATION_SUBMITTED',  'Negotiation Submitted'],
    ['APPROVED',               'Approved'],
    ['ACTIVE',                 'Active'],
    ['DEACTIVATED',            'Deactivated'],
    ['REJECTED',               'Rejected'],
  ];

  return (
    <div className="p-3 sm:p-5 lg:p-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-5 sm:mb-7"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={16} className="text-purple-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">All Users</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">View all users across all roles</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none sm:overflow-visible"
      >
        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          options={roleOptions}
          icon={UsersIcon}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          icon={Filter}
        />
        {(roleFilter || statusFilter) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 border border-purple-200/50 rounded-lg shrink-0"
          >
            <span className="text-[10px] font-semibold text-purple-600">{users.length} result{users.length !== 1 ? 's' : ''}</span>
          </motion.div>
        )}
      </motion.div>

      <Alert message={error} />

      {loading ? <Spinner /> : (
        <>
          {/* ── Mobile: Card layout ── */}
          <div className="space-y-2 lg:hidden">
            {users.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                  <Inbox size={20} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No users found</p>
              </div>
            )}
            {users.map((u, i) => (
              <MobileCard key={u._id} user={u} index={i} onToggle={handleToggleStatus} busyId={busyId} />
            ))}
          </div>

          {/* ── Desktop: Table layout ── */}
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
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Requested Price</th>
                    <th className="px-5 py-3 font-semibold">Source</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <Inbox size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No users found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  <AnimatePresence>
                    {users.map((u, i) => (
                      <motion.tr
                        key={u._id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                        className="border-b border-gray-100 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                              u.role === 'ADMIN'       ? 'from-purple-400 to-purple-600' :
                              u.role === 'SALES_AGENT' ? 'from-orange-400 to-amber-500'  :
                              'from-slate-500 to-slate-700'
                            } flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm truncate">{u.name}</span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={11} className="text-gray-300 shrink-0" />
                            <span className="truncate max-w-[200px]">{u.email}</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <RoleBadge role={u.role} />
                        </td>

                        <td className="px-5 py-3.5">
                          {u.planType ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                              {u.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
                              {u.planType}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Requested Price column: the price submitted for Super Admin approval */}
                        <td className="px-5 py-3.5">
                          {u.role === 'ADMIN' && getRequestedPrice(u) != null ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded">
                              <DollarSign size={10} />
                              PKR {getRequestedPrice(u).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Source column: shows referral code if referred, Direct otherwise */}
                        <td className="px-5 py-3.5">
                          {u.registrationSource === 'REFERRAL' && u.salesAgentId ? (
                            <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/40 px-1.5 py-0.5 rounded">
                              {u.salesAgentId.referralCode || u.salesAgentId.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-300">
                              <Link2 size={9} />—
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <StatusBadge status={u.status} />
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar size={10} className="text-gray-300" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <ToggleStatusButton user={u} onToggle={handleToggleStatus} busy={busyId === u._id} />
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