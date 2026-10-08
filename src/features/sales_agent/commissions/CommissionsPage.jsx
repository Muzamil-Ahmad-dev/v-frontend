 import { useState, useEffect } from 'react';
import { salesAgentApi } from '../../../shared/api/salesagent.js';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Clock, CheckCircle2, Banknote,
  Sparkles, Calendar, CalendarDays, Infinity,
  ChevronDown, User, Inbox,
} from 'lucide-react';

function CommissionBadge({ status }) {
  const config = {
    PAID:    { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', ring: 'ring-emerald-200/50' },
    PENDING: { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-500',   ring: 'ring-amber-200/50'   },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500', ring: 'ring-gray-200/50' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {status}
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

// ── Mobile Card ──────────────────────────────────────────────────────────────
function MobileCard({ c, index }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = c.admin?.businessName || c.admin?.email || c.planType || c.paidAt;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
    >
      <div className="p-3 space-y-2">
        {/* Row 1: Admin + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {c.admin?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{c.admin?.name || '—'}</p>
              <p className="text-[10px] text-gray-400 truncate">{c.admin?.businessName || c.admin?.email || ''}</p>
            </div>
          </div>
          <CommissionBadge status={c.commissionStatus} />
        </div>

        {/* Row 2: Amount + Date */}
        <div className="flex items-center justify-between gap-2">
          {c.commissionAmount > 0 ? (
            <span className="text-xs font-bold text-gray-900">PKR {Number(c.commissionAmount).toLocaleString()}</span>
          ) : (
            <span className="text-[10px] text-gray-400 italic">Pending assignment</span>
          )}
          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
            <Calendar size={9} />
            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      {/* Expand toggle */}
      {hasExtra && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-orange-500 transition-colors py-1.5 border-t border-gray-100 bg-gray-50/40"
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
              {c.planType && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  {c.planType === 'YEARLY' ? <CalendarDays size={10} className="text-orange-400" /> : <Infinity size={10} className="text-orange-400" />}
                  <span className="font-medium">{c.planType}</span>
                </div>
              )}
              {c.paidAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  Paid on {new Date(c.paidAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CommissionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    salesAgentApi.getCommissions()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const commissions = data?.commissionHistory || [];

  const summaryCards = [
    { label: 'Total Earned', value: data?.totalCommissionEarned ?? 0, icon: Wallet,      gradient: 'from-orange-400 to-orange-600',   shadow: 'shadow-orange-500/20',  text: 'text-orange-600'  },
    { label: 'Pending',      value: data?.pendingCommission ?? 0,     icon: Clock,       gradient: 'from-amber-400 to-orange-500',    shadow: 'shadow-amber-500/20',   text: 'text-amber-600'   },
    { label: 'Paid',         value: data?.paidCommission ?? 0,        icon: CheckCircle2, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', text: 'text-emerald-600' },
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
          <Sparkles size={16} className="text-orange-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">My Commissions</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Earnings from your approved referrals</p>
      </motion.div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6">
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
              <p className={`text-xs sm:text-xl font-bold ${card.text}`}>PKR {card.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Alert message={error} />

      {loading ? <Spinner /> : (
        <>
          {/* ── Mobile: Card layout ── */}
          <div className="space-y-2 lg:hidden">
            {commissions.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                  <Banknote size={20} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No commissions yet</p>
                <p className="text-[10px] text-gray-300 mt-0.5 text-center max-w-[240px]">
                  Commissions appear when Super Admin assigns an amount for your referred admins
                </p>
              </div>
            )}
            {commissions.map((c, i) => (
              <MobileCard key={c._id} c={c} index={i} />
            ))}
          </div>

          {/* ── Desktop: Table layout ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.08 }}
            className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
          >
            {commissions.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Banknote size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No commissions yet</p>
                <p className="text-xs text-gray-300 mt-1 max-w-[360px] text-center">
                  Commissions appear when Super Admin assigns an amount for your referred admins
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-200/60">
                    <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Admin</th>
                      <th className="px-5 py-3 font-semibold">Plan</th>
                      <th className="px-5 py-3 font-semibold">Commission</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Paid On</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {commissions.map((c, i) => (
                        <motion.tr
                          key={c._id}
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
                                {c.admin?.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{c.admin?.name || '—'}</p>
                                <p className="text-[11px] text-gray-400 truncate">{c.admin?.businessName || c.admin?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {c.planType ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                                {c.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
                                {c.planType}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {c.commissionAmount > 0 ? (
                              <span className="text-xs font-bold text-gray-900">
                                PKR {Number(c.commissionAmount).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Pending assignment</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <CommissionBadge status={c.commissionStatus} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                              <Calendar size={10} className="text-gray-300" />
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {c.paidAt ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500">
                                <CheckCircle2 size={10} />
                                {new Date(c.paidAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
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
    </div>
  );
}