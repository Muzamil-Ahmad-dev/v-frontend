  import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../../../shared/api/superadmin.js';
import { StatCard, Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, Clock, XCircle,
  Wallet, Timer, CheckCircle2, UserCog,
  ChevronDown, CalendarDays, Infinity,
  AlertTriangle, Banknote, Users,
  GitPullRequest, SendHorizonal, Store, GitBranch, RefreshCw,
} from 'lucide-react';

// ── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 20, delay: i * 0.06 },
  }),
};

const expandVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: {
    opacity: 1, height: 'auto', overflow: 'hidden',
    transition: { type: 'spring', stiffness: 180, damping: 24 },
  },
  exit: {
    opacity: 0, height: 0, overflow: 'hidden',
    transition: { duration: 0.2 },
  },
};

// ── Tiny inline stat pill ─────────────────────────────────────────────────────
function Pill({ label, value, bg, text, icon: Icon }) {
  return (
    <div className={`flex flex-col items-center px-3 py-3 rounded-xl ${bg} gap-1.5`}>
      {Icon && <Icon size={14} className={text} />}
      <span className={`text-[10px] font-semibold ${text} opacity-70 uppercase tracking-wide`}>{label}</span>
      <span className={`text-sm font-bold ${text} leading-tight`}>{value}</span>
    </div>
  );
}

// ── Per-agent expandable row ──────────────────────────────────────────────────
function AgentCommissionRow({ agent }) {
  const [open, setOpen]           = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [loaded, setLoaded]       = useState(false);
  const [error, setError]         = useState('');

  const toggle = useCallback(async () => {
    if (loaded) { setOpen((o) => !o); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await superadminApi.listCommissions({ salesAgentId: agent._id });
      setCommissions(res.data || []);
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agent._id, loaded]);

  const total        = commissions.length;
  const totalAmount  = commissions.reduce((s, c) => s + (c.commissionAmount || 0), 0);
  const pendingAmt   = commissions.filter((c) => c.commissionStatus === 'PENDING').reduce((s, c) => s + (c.commissionAmount || 0), 0);
  const paidAmt      = commissions.filter((c) => c.commissionStatus === 'PAID').reduce((s, c) => s + (c.commissionAmount || 0), 0);
  const pendingCount = commissions.filter((c) => c.commissionStatus === 'PENDING').length;
  const paidCount    = commissions.filter((c) => c.commissionStatus === 'PAID').length;
  const notSetCount  = commissions.filter((c) => c.commissionAmount === 0).length;
  const paidPct      = totalAmount > 0 ? Math.round((paidAmt / totalAmount) * 100) : 0;

  return (
    <>
      {/* ── Agent summary row ── */}
      <motion.tr
        onClick={toggle}
        whileHover={{ backgroundColor: open ? 'rgba(239,246,255,1)' : 'rgba(249,250,251,1)' }}
        className={`border-b border-gray-100 cursor-pointer transition-colors ${
          open ? 'bg-indigo-50/80' : ''
        }`}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-orange-500/20 shrink-0">
              {agent.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{agent.name}</p>
              <p className="text-xs text-gray-400 truncate">{agent.email}</p>
            </div>
          </div>
        </td>

        <td className="px-5 py-4">
          <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-lg">
            {agent.referralCode}
          </span>
        </td>

        <td className="px-5 py-4">
          {loaded ? (
            <span className="text-sm font-bold text-gray-900">PKR {totalAmount.toLocaleString()}</span>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          )}
        </td>

        <td className="px-5 py-4">
          {loaded ? (
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium border border-amber-200/50">
                <Timer size={10} /> {pendingAmt.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/50">
                <CheckCircle2 size={10} /> {paidAmt.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          )}
        </td>

        <td className="px-5 py-4">
          {loaded ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
              <Users size={13} className="text-gray-400" /> {total}
            </span>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          )}
        </td>

        <td className="px-5 py-4 text-right">
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              open
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            {open ? 'Collapse' : 'Expand'}
            <ChevronDown size={12} />
          </motion.span>
        </td>
      </motion.tr>

      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {open && (
          <motion.tr
            key="expanded"
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <td colSpan={6} className="p-0 border-b-2 border-indigo-100">
              <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50/80 backdrop-blur-sm px-6 py-5">
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-indigo-500 animate-pulse py-2">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    Loading agent stats…
                  </div>
                )}
                {error && <p className="text-sm text-red-500 py-2">{error}</p>}

                {!loading && !error && (
                  <>
                    {commissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                          <Banknote size={22} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">No commissions yet for this agent</p>
                      </div>
                    ) : (
                      <>
                        {/* ── Full stats grid ── */}
                        <div className="mb-5">
                          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                            {agent.name}'s Commission Stats
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                            <Pill label="Total Referrals"  value={total}                                bg="bg-indigo-100/80"  text="text-indigo-700" icon={Users} />
                            <Pill label="Total Earned"     value={`PKR ${totalAmount.toLocaleString()}`} bg="bg-indigo-100/80"  text="text-indigo-700" icon={Wallet} />
                            <Pill label="Pending Amt"      value={`PKR ${pendingAmt.toLocaleString()}`}  bg="bg-amber-100/80"   text="text-amber-700"  icon={Timer} />
                            <Pill label="Paid Amt"         value={`PKR ${paidAmt.toLocaleString()}`}     bg="bg-emerald-100/80" text="text-emerald-700" icon={CheckCircle2} />
                            <Pill label="Pending #"        value={pendingCount}                          bg="bg-amber-100/80"   text="text-amber-700"  icon={Clock} />
                            <Pill label="Paid #"           value={paidCount}                             bg="bg-emerald-100/80" text="text-emerald-700" icon={CheckCircle2} />
                            <Pill label="Not Set"          value={notSetCount}                           bg="bg-gray-100/80"    text="text-gray-600"   icon={XCircle} />
                          </div>

                          {/* Progress bar */}
                          {totalAmount > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                <span>Paid out</span>
                                <span className="font-medium text-emerald-600">{paidPct}%</span>
                              </div>
                              <div className="h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${paidPct}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ── Commission history table ── */}
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                          Commission History
                        </p>
                        <div className="rounded-xl overflow-hidden border border-indigo-100/60 bg-white/80 backdrop-blur-sm shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-indigo-50/80">
                                <tr className="text-[10px] text-indigo-500 uppercase tracking-wider">
                                  <th className="py-3 px-4 font-semibold text-left">Admin</th>
                                  <th className="py-3 px-4 font-semibold text-left">Plan</th>
                                  <th className="py-3 px-4 font-semibold text-left">Commission</th>
                                  <th className="py-3 px-4 font-semibold text-left">Status</th>
                                  <th className="py-3 px-4 font-semibold text-left">Created</th>
                                  <th className="py-3 px-4 font-semibold text-left">Paid On</th>
                                </tr>
                              </thead>
                              <tbody>
                                {commissions.map((c, i) => (
                                  <tr
                                    key={c._id}
                                    className={`border-t border-gray-50 transition-colors hover:bg-indigo-50/30 ${
                                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                    }`}
                                  >
                                    <td className="py-3 px-4">
                                      <p className="font-medium text-gray-900 text-sm">{c.admin?.name || '—'}</p>
                                      <p className="text-xs text-gray-400">{c.admin?.businessName || c.admin?.email}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">
                                        {c.planType === 'YEARLY' ? <CalendarDays size={10} /> : <Infinity size={10} />}
                                        {c.planType}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      {c.commissionAmount > 0 ? (
                                        <span className="font-bold text-gray-900">PKR {Number(c.commissionAmount).toLocaleString()}</span>
                                      ) : (
                                        <span className="text-xs text-gray-400 italic">Not assigned</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        c.commissionStatus === 'PAID'
                                          ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50'
                                          : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/50'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          c.commissionStatus === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`} />
                                        {c.commissionStatus}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-gray-400">
                                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-xs text-gray-400">
                                      {c.paidAt ? new Date(c.paidAt).toLocaleDateString() : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      superadminApi.getAnalytics(),
      superadminApi.listSalesAgents(),
    ])
      .then(([aRes, saRes]) => {
        setAnalytics(aRes.data);
        setAgents(saRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><Spinner /></div>;
  if (error)   return <div className="p-8"><Alert message={error} /></div>;

  const commTotal   = analytics?.commissionBreakdown?.reduce((s, c) => s + (c.total || 0), 0) ?? 0;
  const commPending = analytics?.commissionBreakdown?.find((c) => c._id === 'PENDING')?.total ?? 0;
  const commPaid    = analytics?.commissionBreakdown?.find((c) => c._id === 'PAID')?.total    ?? 0;

  // Total pending = PENDING_APPROVAL + NEGOTIATION_SUBMITTED (both need superadmin action)
  const totalActionRequired = (analytics?.pendingApprovals ?? 0) + (analytics?.negotiationSubmitted ?? 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">SuperAdmin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Platform-wide overview</p>
      </motion.div>

      {/* Pending banner — shows when either direct pending or negotiation submitted */}
      {totalActionRequired > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.1 }}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl text-sm text-amber-800 shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <span>
            <strong>{totalActionRequired}</strong> registration(s) awaiting your approval
            {analytics?.negotiationSubmitted > 0 && (
              <span className="ml-1 text-amber-600">
                ({analytics.negotiationSubmitted} with negotiated price)
              </span>
            )}
          </span>
        </motion.div>
      )}

      {/* Admin stats */}
      <section>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Admins</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[
            { title: 'Total Admins',      value: analytics?.totalAdmins      ?? 0, icon: Shield,     gradient: 'from-indigo-400 to-indigo-600',   shadow: 'shadow-indigo-500/20',  bg: 'bg-indigo-50',   text: 'text-indigo-600'   },
            { title: 'Active Admins',     value: analytics?.activeAdmins     ?? 0, icon: ShieldCheck, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50',  text: 'text-emerald-600' },
            { title: 'Pending Approval',  value: analytics?.pendingApprovals ?? 0, icon: Clock,       gradient: 'from-amber-400 to-orange-500',    shadow: 'shadow-amber-500/20',   bg: 'bg-amber-50',    text: 'text-amber-600'   },
            { title: 'Rejected',          value: analytics?.rejectedAdmins   ?? 0, icon: XCircle,     gradient: 'from-red-400 to-rose-500',        shadow: 'shadow-red-500/20',     bg: 'bg-red-50',      text: 'text-red-600'     },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/60"
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{card.title}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <card.icon size={16} className="text-white" strokeWidth={2.2} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${card.text}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Negotiation pipeline stats */}
      {((analytics?.pendingNegotiation ?? 0) > 0 || (analytics?.negotiationSubmitted ?? 0) > 0 || (analytics?.priceRejected ?? 0) > 0) && (
        <section>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Negotiation Pipeline</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {[
              { title: 'Pending Negotiation', value: analytics?.pendingNegotiation ?? 0, icon: GitPullRequest, gradient: 'from-violet-400 to-violet-600', shadow: 'shadow-violet-500/20', text: 'text-violet-600', desc: 'Assigned to sales agent, awaiting price' },
              { title: 'Submitted to You',    value: analytics?.negotiationSubmitted ?? 0, icon: SendHorizonal,  gradient: 'from-sky-400 to-blue-600',     shadow: 'shadow-sky-500/20',    text: 'text-sky-600',    desc: 'Sales agent set price, ready for approval' },
              { title: 'Price Rejected',      value: analytics?.priceRejected       ?? 0, icon: RefreshCw,      gradient: 'from-orange-400 to-amber-500',  shadow: 'shadow-orange-500/20', text: 'text-orange-600', desc: 'Sent back to sales agent for re-negotiation' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 sm:p-6 flex items-center gap-5 overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50"
              >
                <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <card.icon size={22} className="text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.text} mt-0.5`}>{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Platform stats */}
      <section>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Platform</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {[
            { title: 'Sales Agents',  value: analytics?.totalSalesAgents ?? 0, icon: UserCog,    gradient: 'from-orange-400 to-amber-500',    shadow: 'shadow-orange-500/20', text: 'text-orange-600' },
            { title: 'Branches',      value: analytics?.totalBranches    ?? 0, icon: GitBranch,  gradient: 'from-teal-400 to-cyan-600',       shadow: 'shadow-teal-500/20',   text: 'text-teal-600'   },
            { title: 'Shop Owners',   value: analytics?.totalShopOwners  ?? 0, icon: Store,      gradient: 'from-fuchsia-400 to-pink-600',    shadow: 'shadow-fuchsia-500/20', text: 'text-fuchsia-600' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/60"
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{card.title}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <card.icon size={16} className="text-white" strokeWidth={2.2} />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${card.text}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Plan breakdown */}
      {analytics?.planBreakdown?.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Plan Breakdown</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {analytics.planBreakdown.map((plan, i) => {
              const isYearly = plan._id === 'YEARLY';
              const PlanIcon = isYearly ? CalendarDays : Infinity;
              const gradient = isYearly
                ? 'from-violet-400 to-purple-600'
                : 'from-sky-400 to-blue-600';
              const shadow = isYearly
                ? 'shadow-violet-500/20'
                : 'shadow-sky-500/20';
              return (
                <motion.div
                  key={plan._id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 sm:p-6 flex items-center gap-5 overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/60"
                >
                  <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} ${shadow} shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <PlanIcon size={22} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{plan._id}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{plan.count} <span className="text-sm font-medium text-gray-400">admins</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">PKR {plan.revenue?.toLocaleString()} revenue</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Commission overview */}
      <section>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Commission Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {[
            { title: 'Total Commissions', value: `PKR ${commTotal.toLocaleString()}`,   icon: Wallet,      gradient: 'from-indigo-400 to-indigo-600',   shadow: 'shadow-indigo-500/20'  },
            { title: 'Pending Payout',    value: `PKR ${commPending.toLocaleString()}`, icon: Timer,       gradient: 'from-amber-400 to-orange-500',    shadow: 'shadow-amber-500/20'   },
            { title: 'Paid Out',          value: `PKR ${commPaid.toLocaleString()}`,    icon: CheckCircle2, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/60"
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{card.title}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <card.icon size={16} className="text-white" strokeWidth={2.2} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Per-agent table */}
      {agents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Per-Agent Breakdown
            </p>
            <span className="text-[10px] text-gray-300 font-normal normal-case">— click any row to expand</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5 font-semibold text-left">Agent</th>
                    <th className="px-5 py-3.5 font-semibold text-left">Referral Code</th>
                    <th className="px-5 py-3.5 font-semibold text-left">Total Earned</th>
                    <th className="px-5 py-3.5 font-semibold text-left">Pending / Paid</th>
                    <th className="px-5 py-3.5 font-semibold text-left">Referrals</th>
                    <th className="px-5 py-3.5 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <AgentCommissionRow key={agent._id} agent={agent} />
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>
      )}

      {agents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-14"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <UserCog size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No sales agents created yet</p>
        </motion.div>
      )}

    </div>
  );
}