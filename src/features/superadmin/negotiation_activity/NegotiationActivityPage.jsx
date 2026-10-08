 import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../../../shared/api/superadmin.js';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronDown, Inbox, CalendarDays, Infinity,
  SendHorizonal, RefreshCw, CheckCircle2, XCircle,
  Building2, AlertTriangle, Clock, Users,
} from 'lucide-react';

function StatusBadge({ status }) {
  const config = {
    ACTIVE:                 { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500',  ring: 'ring-emerald-200/50'  },
    APPROVED:               { bg: 'bg-blue-50',     text: 'text-blue-600',    dot: 'bg-blue-500',     ring: 'ring-blue-200/50'     },
    PENDING_APPROVAL:       { bg: 'bg-amber-50',    text: 'text-amber-600',   dot: 'bg-amber-500',    ring: 'ring-amber-200/50'    },
    PENDING_NEGOTIATION:    { bg: 'bg-violet-50',   text: 'text-violet-600',  dot: 'bg-violet-500',   ring: 'ring-violet-200/50'   },
    NEGOTIATION_SUBMITTED:  { bg: 'bg-sky-50',      text: 'text-sky-600',     dot: 'bg-sky-500',      ring: 'ring-sky-200/50'      },
    PRICE_REJECTED:         { bg: 'bg-orange-50',   text: 'text-orange-600',  dot: 'bg-orange-500',   ring: 'ring-orange-200/50'   },
    REJECTED:               { bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-500',      ring: 'ring-red-200/50'      },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500', ring: 'ring-gray-200/50' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {status?.replace(/_/g, ' ')}
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

function PriceHistoryRow({ entry }) {
  const actionConfig = {
    REGISTRATION:              { icon: Inbox,         color: 'text-emerald-500',bg: 'bg-emerald-50', label: 'Initial Registration' },
    NEGOTIATION_UPDATED:       { icon: RefreshCw,     color: 'text-violet-500', bg: 'bg-violet-50',  label: 'Price Updated' },
    SUBMITTED_TO_SUPERADMIN:   { icon: SendHorizonal, color: 'text-sky-500',    bg: 'bg-sky-50',     label: 'Submitted' },
    RESUBMITTED_TO_SUPERADMIN: { icon: SendHorizonal, color: 'text-blue-500',   bg: 'bg-blue-50',    label: 'Re-submitted' },
    PRICE_REJECTED:            { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50',  label: 'Price Rejected' },
  };
  const cfg = actionConfig[entry.action] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: entry.action };
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${cfg.bg} border border-current/10`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
        <Icon size={11} className={cfg.color} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</p>
          <p className="text-[9px] text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
        </div>
        {entry.metadata?.negotiatedPrice && (
          <p className="text-[10px] text-gray-600">Price: PKR {entry.metadata.negotiatedPrice?.toLocaleString()}</p>
        )}
        {entry.note && (
          <p className="text-[10px] text-gray-500 italic truncate">"{entry.note}"</p>
        )}
        {entry.metadata?.negotiationRound && (
          <p className="text-[9px] text-orange-500">Round {entry.metadata.negotiationRound}</p>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const hasPriceHistory = item.priceHistory?.length > 0;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Left: name / business */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
              {item.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{item.email}</p>
              {item.businessName && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  <Building2 size={9} className="text-gray-300" />
                  {item.businessName}
                </div>
              )}
            </div>
          </div>

          {/* Right: status + round */}
          <div className="flex items-center gap-2 shrink-0">
            {item.negotiationRound > 0 && (
              <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200/50 px-1.5 py-0.5 rounded">
                Round {item.negotiationRound}
              </span>
            )}
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* Price row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Plan Price</p>
            <p className="text-xs font-medium text-gray-700">PKR {item.planPrice?.toLocaleString() || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Requested Price</p>
            <p className="text-xs font-medium text-emerald-700">
              {item.negotiationPrice ? `PKR ${item.negotiationPrice?.toLocaleString()}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Submitted Price</p>
            <p className="text-xs font-medium text-sky-700">
              {item.negotiatedPrice ? `PKR ${item.negotiatedPrice?.toLocaleString()}` : '—'}
            </p>
          </div>
          {item.superadminDesiredPrice && (
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">SA Desired</p>
              <p className="text-xs font-medium text-orange-600">PKR {item.superadminDesiredPrice?.toLocaleString()}</p>
            </div>
          )}
          {item.salesAgentId && (
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Sales Agent</p>
              <p className="text-xs font-medium text-gray-700">{item.salesAgentId.name}</p>
              <p className="font-mono text-[9px] text-orange-600">{item.salesAgentId.referralCode}</p>
            </div>
          )}
        </div>

        {/* Admin's original negotiation reason (given at registration) */}
        {item.negotiationReason && (
          <div className="mt-2 p-2 bg-emerald-50/60 border border-emerald-100/60 rounded-lg">
            <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Admin's Requested-Price Reason</p>
            <p className="text-[11px] text-emerald-700 italic">"{item.negotiationReason}"</p>
          </div>
        )}

        {/* Rejection reason */}
        {item.priceRejectionReason && (
          <div className="mt-2 p-2 bg-orange-50/60 border border-orange-100/60 rounded-lg">
            <p className="text-[9px] font-semibold text-orange-600 uppercase tracking-wider mb-0.5">Last Rejection Reason</p>
            <p className="text-[11px] text-orange-700 italic">"{item.priceRejectionReason}"</p>
          </div>
        )}
      </div>

      {/* Expand: price history */}
      {hasPriceHistory && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-purple-500 transition-colors py-1.5 border-t border-gray-100 bg-gray-50/40"
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={11} />
            </motion.span>
            {expanded ? 'Hide' : 'Show'} Price History ({item.priceHistory.length})
          </button>
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
                  {item.priceHistory.map((entry, i) => (
                    <PriceHistoryRow key={i} entry={entry} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

export default function NegotiationActivityPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchActivity = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (statusFilter) params.status = statusFilter;
    superadminApi.getNegotiationActivity(params)
      .then((res) => setActivity(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const filters = [
    ['', 'All', Users],
    ['PENDING_NEGOTIATION', 'Pending', Clock],
    ['NEGOTIATION_SUBMITTED', 'Submitted', SendHorizonal],
    ['PRICE_REJECTED', 'Price Rejected', AlertTriangle],
    ['APPROVED', 'Approved', CheckCircle2],
    ['REJECTED', 'Rejected', XCircle],
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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Negotiation Activity</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Full price negotiation history for all referred registrations</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        className="flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none sm:overflow-visible sm:flex-wrap"
      >
        {filters.map(([val, label, Icon], i) => (
          <motion.button
            key={val || 'all'}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileTap={{ scale: 0.96 }}
            onClick={() => setStatusFilter(val)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all duration-200 shrink-0 ${
              statusFilter === val
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                : 'bg-white/80 text-gray-500 border-gray-200/60 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <Icon size={12} />
            {label}
          </motion.button>
        ))}
      </motion.div>

      <Alert message={error} />

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {activity.length === 0 && (
            <div className="flex flex-col items-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Inbox size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">No negotiation activity found</p>
              <p className="text-xs text-gray-300 mt-1">Referral registrations with price negotiations will appear here</p>
            </div>
          )}
          {activity.map((item, i) => (
            <ActivityRow key={item._id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}