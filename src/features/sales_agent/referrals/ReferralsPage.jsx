   import { useState, useEffect, useCallback } from 'react';
import { salesAgentApi } from '../../../shared/api/salesagent.js';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Building2, Calendar, Sparkles,
  CalendarDays, Infinity, ChevronDown,
  SendHorizonal, Tag, MessageSquare,
  CheckCircle2, Clock, X, Pencil, Check, AlertTriangle,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    ACTIVE:                { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500',  ring: 'ring-emerald-200/50'  },
    APPROVED:              { bg: 'bg-blue-50',     text: 'text-blue-600',   dot: 'bg-blue-500',     ring: 'ring-blue-200/50'     },
    PENDING_APPROVAL:      { bg: 'bg-amber-50',    text: 'text-amber-600',  dot: 'bg-amber-500',    ring: 'ring-amber-200/50'    },
    PENDING_NEGOTIATION:   { bg: 'bg-amber-50',    text: 'text-amber-600',  dot: 'bg-amber-500',    ring: 'ring-amber-200/50'    },
    NEGOTIATION_SUBMITTED: { bg: 'bg-violet-50',   text: 'text-violet-600', dot: 'bg-violet-500',   ring: 'ring-violet-200/50'   },
    PRICE_REJECTED:        { bg: 'bg-orange-50',  text: 'text-orange-600', dot: 'bg-orange-500',  ring: 'ring-orange-200/50'   },
    COUNTER_OFFER:         { bg: 'bg-cyan-50',     text: 'text-cyan-600',   dot: 'bg-cyan-500',    ring: 'ring-cyan-200/50'     },
    REJECTED:              { bg: 'bg-red-50',      text: 'text-red-600',    dot: 'bg-red-500',      ring: 'ring-red-200/50'      },
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
  hidden:  { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={15} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ── Pending Mobile Card ──────────────────────────────────────────────────────
function PendingMobileCard({ r, index, onNegotiate, onSubmit, submittingId }) {
  const [expanded, setExpanded] = useState(false);
  const hasCustomerRequest = r.negotiationPrice != null;
  const hasYourPrice = r.negotiatedPrice != null && r.negotiatedPrice > 0;
  const isSubmitting = submittingId === r._id;

  return (
    <motion.div
      custom={index} variants={fadeUp} initial="hidden" animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-xl overflow-hidden"
    >
      <div className="p-3 space-y-2">
        {/* Row 1: Name + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {r.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{r.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{r.email}</p>
            </div>
          </div>
          <StatusBadge status={r.status} />
        </div>

        {/* Row 2: Date */}
        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
          <Calendar size={9} />
          {new Date(r.createdAt).toLocaleDateString()}
        </span>

        {/* Your negotiated price (if already set) */}
        {hasYourPrice && (
          <div className="bg-emerald-50/60 border border-emerald-100/50 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">Your Negotiated Price</p>
              <p className="text-xs font-bold text-emerald-700">PKR {r.negotiatedPrice?.toLocaleString()}</p>
            </div>
            <Check size={14} className="text-emerald-500 shrink-0" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          {hasYourPrice ? (
            <>
              <button
                onClick={() => onNegotiate(r)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold rounded-lg transition-colors"
              >
                <Pencil size={11} /> Edit Price
              </button>
              <button
                onClick={() => onSubmit(r)}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                <SendHorizonal size={11} /> {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onNegotiate(r)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold rounded-lg transition-colors"
            >
              <Tag size={11} /> Negotiate Price
            </button>
          )}
        </div>
      </div>

      {/* Expandable details */}
      {(hasCustomerRequest || r.businessName || r.planType) && (
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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3 space-y-1.5 bg-gray-50/30">
              {r.businessName && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Building2 size={10} className="text-gray-300" />{r.businessName}
                </div>
              )}
              {r.planType && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  {r.planType === 'YEARLY' ? <CalendarDays size={10} className="text-orange-400" /> : <Infinity size={10} className="text-orange-400" />}
                  <span className="font-medium">{r.planType}</span>
                  <span className="text-gray-400">· PKR {r.planPrice?.toLocaleString()}</span>
                </div>
              )}
              {hasCustomerRequest && (
                <div className="bg-amber-50/60 border border-amber-100/50 rounded-lg p-2">
                  <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">Customer Requested</p>
                  <p className="text-xs font-bold text-amber-700">PKR {r.negotiationPrice?.toLocaleString()}</p>
                  {r.negotiationReason && (
                    <p className="text-[10px] text-amber-500/70 italic mt-0.5">"{r.negotiationReason}"</p>
                  )}
                </div>
              )}
              {/* Price rejection reason */}
              {r.status === 'PRICE_REJECTED' && r.priceRejectionReason && (
                <div className="bg-orange-50/60 border border-orange-100/50 rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-0.5">
                    <AlertTriangle size={9} className="text-orange-500" />
                    <p className="text-[9px] font-semibold text-orange-600 uppercase tracking-wider">Rejected Reason</p>
                  </div>
                  <p className="text-xs text-orange-700 italic">"{r.priceRejectionReason}"</p>
                  {r.superadminDesiredPrice && (
                    <p className="text-[10px] font-semibold text-orange-600 mt-0.5">Desired: PKR {r.superadminDesiredPrice?.toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── All Referrals Mobile Card ────────────────────────────────────────────────
function AllMobileCard({ r, index }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = r.businessName || r.planType || r.negotiatedPrice || r.submittedToSuperAdminAt;

  return (
    <motion.div
      custom={index} variants={fadeUp} initial="hidden" animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {r.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{r.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{r.email}</p>
            </div>
          </div>
          <StatusBadge status={r.status} />
        </div>
        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
          <Calendar size={9} />{new Date(r.createdAt).toLocaleDateString()}
        </span>
      </div>

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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3 space-y-1.5 bg-gray-50/30">
              {r.businessName && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Building2 size={10} className="text-gray-300" />{r.businessName}
                </div>
              )}
              {r.planType && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  {r.planType === 'YEARLY' ? <CalendarDays size={10} className="text-orange-400" /> : <Infinity size={10} className="text-orange-400" />}
                  <span className="font-medium">{r.planType}</span>
                  <span className="text-gray-400">· PKR {r.planPrice?.toLocaleString()}</span>
                </div>
              )}
              {r.negotiationPrice && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
                  <Tag size={10} className="text-amber-400" />
                  Customer requested: <span className="font-semibold">PKR {r.negotiationPrice?.toLocaleString()}</span>
                </div>
              )}
              {r.negotiatedPrice != null && r.negotiatedPrice > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                  <Check size={10} className="text-emerald-400" />
                  Your price: <span className="font-semibold">PKR {r.negotiatedPrice?.toLocaleString()}</span>
                </div>
              )}
              {r.submittedToSuperAdminAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-violet-500">
                  <SendHorizonal size={9} className="text-violet-400" />
                  Submitted: {new Date(r.submittedToSuperAdminAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReferralsPage() {
  const [tab, setTab] = useState('pending');

  const [allReferrals,     setAllReferrals]     = useState([]);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [stats,            setStats]            = useState({});
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');

  // Negotiate modal
  const [negotiateModal,  setNegotiateModal]  = useState(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [note,            setNote]            = useState('');
  const [actionLoading,   setActionLoading]   = useState(false);
  const [actionError,     setActionError]     = useState('');

  // Direct submit loading (per-card)
  const [submittingId, setSubmittingId] = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      salesAgentApi.getReferrals(),
      salesAgentApi.getReferralStats(),
    ])
      .then(([allRes, statsRes]) => {
        const allData = allRes.data || [];
        setAllReferrals(allData);
        setPendingReferrals(allData.filter((r) => ['PENDING_NEGOTIATION', 'PRICE_REJECTED', 'COUNTER_OFFER'].includes(r.status)));
        setStats(statsRes.data || {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Open negotiate modal ───────────────────────────────────────────────
  const openNegotiate = (r) => {
    setNegotiateModal(r);
    setNegotiatedPrice(r.negotiatedPrice != null ? String(r.negotiatedPrice) : '');
    setNote('');
    setActionError('');
  };

  // ── Save negotiated price only ────────────────────────────────────────
  const handleSavePrice = async () => {
    const price = parseFloat(negotiatedPrice);
    if (!negotiatedPrice || isNaN(price) || price < 0) {
      setActionError('Please enter a valid negotiated price.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await salesAgentApi.updateNegotiatedPrice(negotiateModal._id, {
        negotiatedPrice: price,
        note: note.trim() || undefined,
      });
      setNegotiateModal(null);
      fetchAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Save price then submit to super admin ─────────────────────────────
  const handleSaveAndSubmit = async () => {
    const price = parseFloat(negotiatedPrice);
    if (!negotiatedPrice || isNaN(price) || price < 0) {
      setActionError('Please enter a valid negotiated price.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await salesAgentApi.updateNegotiatedPrice(negotiateModal._id, {
        negotiatedPrice: price,
        note: note.trim() || undefined,
      });
      await salesAgentApi.submitToSuperAdmin(negotiateModal._id);
      setNegotiateModal(null);
      fetchAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Direct submit (price already set) ─────────────────────────────────
  const handleDirectSubmit = async (r) => {
    setSubmittingId(r._id);
    try {
      await salesAgentApi.submitToSuperAdmin(r._id);
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const pendingCount = (stats.pendingNegotiation ?? 0) + (stats.priceRejected ?? 0) || pendingReferrals.length;

  return (
    <div className="p-3 sm:p-5 lg:p-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-5 sm:mb-7"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={16} className="text-orange-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">My Referrals</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Negotiate prices and submit referrals to Super Admin</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.04 }}
        className="flex gap-2 mb-5"
      >
        <button
          onClick={() => setTab('pending')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
            tab === 'pending'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
              : 'bg-white/80 text-gray-500 border-gray-200/60 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          <Clock size={12} />
          Action Required
          {pendingCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'pending' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
            tab === 'all'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
              : 'bg-white/80 text-gray-500 border-gray-200/60 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          <Users size={12} />
          All Referrals
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {allReferrals.length}
          </span>
        </button>
      </motion.div>

      <Alert message={error} />

      {/* ── Negotiate Modal ── */}
      <Modal
        isOpen={!!negotiateModal}
        onClose={() => { setNegotiateModal(null); setNegotiatedPrice(''); setNote(''); setActionError(''); }}
        title={negotiateModal?.negotiatedPrice != null && negotiateModal?.negotiatedPrice > 0 ? 'Update Negotiated Price' : 'Negotiate Price'}
      >
        {negotiateModal && (
          <>
            {actionError && <p className="text-xs text-red-500 bg-red-50 border border-red-200/60 rounded-lg px-3 py-2 mb-3">{actionError}</p>}
            <div className="space-y-3">
              {/* Applicant info */}
              <div className="bg-orange-50/50 border border-orange-100/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                    {negotiateModal.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{negotiateModal.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{negotiateModal.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-100/60">
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Plan</p>
                    <p className="text-xs text-gray-700 flex items-center gap-1">
                      {negotiateModal.planType === 'YEARLY' ? <CalendarDays size={10} className="text-orange-400" /> : <Infinity size={10} className="text-orange-400" />}
                      {negotiateModal.planType}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Standard Price</p>
                    <p className="text-xs text-gray-700">PKR {negotiateModal.planPrice?.toLocaleString()}</p>
                  </div>
                </div>
                {/* Customer requested price */}
                {negotiateModal.negotiationPrice && (
                  <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg p-2">
                    <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider mb-0.5">Customer Requested</p>
                    <p className="text-xs font-bold text-amber-700">PKR {negotiateModal.negotiationPrice?.toLocaleString()}</p>
                    {negotiateModal.negotiationReason && (
                      <p className="text-[10px] text-amber-500/70 italic mt-0.5">"{negotiateModal.negotiationReason}"</p>
                    )}
                  </div>
                )}
                {/* Price rejection info from superadmin */}
                {negotiateModal.status === 'PRICE_REJECTED' && negotiateModal.priceRejectionReason && (
                  <div className="bg-orange-50/60 border border-orange-200/50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <AlertTriangle size={10} className="text-orange-500 shrink-0" />
                      <p className="text-[9px] font-semibold text-orange-600 uppercase tracking-wider">Super Admin Rejection Reason</p>
                    </div>
                    <p className="text-xs text-orange-700 italic">"{negotiateModal.priceRejectionReason}"</p>
                    {negotiateModal.superadminDesiredPrice && (
                      <p className="text-[10px] font-semibold text-orange-600 mt-1">
                        Desired price: PKR {negotiateModal.superadminDesiredPrice?.toLocaleString()}
                      </p>
                    )}
                    {negotiateModal.negotiationRound > 0 && (
                      <p className="text-[9px] text-orange-500 mt-0.5">Negotiation round: {negotiateModal.negotiationRound}</p>
                    )}
                  </div>
                )}
                {/* Counter-offer from Super Admin — admin has accepted, agent re-submits */}
                {negotiateModal.status === 'COUNTER_OFFER' && negotiateModal.counterOfferPrice && (
                  <div className="bg-cyan-50/60 border border-cyan-200/50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle2 size={10} className="text-cyan-500 shrink-0" />
                      <p className="text-[9px] font-semibold text-cyan-600 uppercase tracking-wider">Super Admin Counter-Offer</p>
                    </div>
                    <p className="text-[10px] text-cyan-700">
                      The Super Admin has offered a final price. The admin has contacted you to accept it.
                      Set the price below to match the counter-offer and submit for final approval.
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      <div className="flex-1 bg-white/60 rounded-lg px-2 py-1 border border-cyan-100">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase">Admin Requested</p>
                        <p className="text-xs font-bold text-gray-700">PKR {negotiateModal.negotiationPrice?.toLocaleString() || '—'}</p>
                      </div>
                      <div className="flex-1 bg-cyan-100/60 rounded-lg px-2 py-1 border border-cyan-200">
                        <p className="text-[9px] font-semibold text-cyan-600 uppercase">Final Offer</p>
                        <p className="text-xs font-bold text-cyan-700">PKR {negotiateModal.counterOfferPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                    {negotiateModal.counterOfferMessage && (
                      <p className="text-[10px] text-cyan-600 italic mt-1">"{negotiateModal.counterOfferMessage}"</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setNegotiatedPrice(String(negotiateModal.counterOfferPrice))}
                      className="mt-1.5 text-[10px] font-semibold text-cyan-600 underline underline-offset-2 hover:text-cyan-700"
                    >
                      Auto-fill counter-offer price ↓
                    </button>
                  </div>
                )}
              </div>

              {/* Negotiated price input */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <Tag size={11} className="text-orange-400" />Your Negotiated Price (PKR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={negotiatedPrice}
                  onChange={(e) => setNegotiatedPrice(e.target.value)}
                  placeholder={`e.g. ${negotiateModal.negotiationPrice || negotiateModal.planPrice}`}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">This price will be sent to Super Admin for final approval.</p>
              </div>

              {/* Note */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <MessageSquare size={11} className="text-gray-400" />Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Any notes for this negotiation..."
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => { setNegotiateModal(null); setNegotiatedPrice(''); setNote(''); setActionError(''); }}
                className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrice}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                <Check size={12} />
                {actionLoading ? 'Saving…' : 'Save Price'}
              </button>
              <button
                onClick={handleSaveAndSubmit}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                <SendHorizonal size={12} />
                {actionLoading ? 'Saving…' : 'Save & Submit'}
              </button>
            </div>
          </>
        )}
      </Modal>

      {loading ? <Spinner /> : (
        <AnimatePresence mode="wait">

          {/* ══ TAB: PENDING ACTION ══ */}
          {tab === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

              {/* Mobile */}
              <div className="space-y-2 lg:hidden">
                {pendingReferrals.length === 0 ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                      <CheckCircle2 size={20} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-medium text-gray-400">All caught up!</p>
                    <p className="text-[10px] text-gray-300 mt-0.5 text-center max-w-[200px]">No referrals waiting for your action</p>
                  </div>
                ) : pendingReferrals.map((r, i) => (
                  <PendingMobileCard
                    key={r._id} r={r} index={i}
                    onNegotiate={openNegotiate}
                    onSubmit={handleDirectSubmit}
                    submittingId={submittingId}
                  />
                ))}
              </div>

              {/* Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.06 }}
                className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
              >
                {pendingReferrals.length === 0 ? (
                  <div className="flex flex-col items-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <CheckCircle2 size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">All caught up!</p>
                    <p className="text-xs text-gray-300 mt-1">No referrals waiting for your action</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 border-b border-gray-200/60">
                        <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-semibold">Applicant</th>
                          <th className="px-5 py-3 font-semibold">Business</th>
                          <th className="px-5 py-3 font-semibold">Plan</th>
                          <th className="px-5 py-3 font-semibold">Customer Request</th>
                          <th className="px-5 py-3 font-semibold">Your Price</th>
                          <th className="px-5 py-3 font-semibold">Registered</th>
                          <th className="px-5 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {pendingReferrals.map((r, i) => {
                            const hasYourPrice = r.negotiatedPrice != null && r.negotiatedPrice > 0;
                            const isSubmitting = submittingId === r._id;
                            return (
                              <motion.tr
                                key={r._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                                whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                                className="border-b border-gray-100 transition-colors"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                                      {r.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 text-sm truncate">{r.name}</p>
                                      <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                    <Building2 size={11} className="text-gray-300 shrink-0" />
                                    <span className="truncate">{r.businessName || '—'}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                                    {r.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
                                    {r.planType}
                                  </span>
                                  <p className="text-[11px] text-gray-400 mt-0.5">PKR {r.planPrice?.toLocaleString()}</p>
                                </td>
                                <td className="px-5 py-3.5">
                                  {r.negotiationPrice ? (
                                    <div className="bg-amber-50/60 border border-amber-100/50 rounded-lg p-2 max-w-[160px]">
                                      <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">Requested</p>
                                      <p className="text-xs font-semibold text-amber-700">PKR {r.negotiationPrice?.toLocaleString()}</p>
                                      {r.negotiationReason && (
                                        <p className="text-[10px] text-amber-500/70 italic mt-0.5 truncate">"{r.negotiationReason}"</p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 text-xs">—</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5">
                                  {hasYourPrice ? (
                                    <div className="bg-emerald-50/60 border border-emerald-100/50 rounded-lg p-2">
                                      <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">Your Price</p>
                                      <p className="text-xs font-semibold text-emerald-700">PKR {r.negotiatedPrice?.toLocaleString()}</p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 text-xs">Not set</span>
                                  )}
                                  {r.status === 'PRICE_REJECTED' && r.priceRejectionReason && (
                                    <div className="mt-1 bg-orange-50/60 border border-orange-100/50 rounded-lg p-1.5">
                                      <div className="flex items-center gap-0.5 mb-0.5">
                                        <AlertTriangle size={9} className="text-orange-500" />
                                        <p className="text-[9px] font-semibold text-orange-600">SA Rejected</p>
                                      </div>
                                      <p className="text-[10px] text-orange-700 italic truncate max-w-[140px]">"{r.priceRejectionReason}"</p>
                                      {r.superadminDesiredPrice && (
                                        <p className="text-[9px] text-orange-600 font-semibold">Want: PKR {r.superadminDesiredPrice?.toLocaleString()}</p>
                                      )}
                                    </div>
                                  )}
                                  {r.status === 'COUNTER_OFFER' && r.counterOfferPrice && (
                                    <div className="mt-1 bg-cyan-50/60 border border-cyan-100/50 rounded-lg p-1.5">
                                      <p className="text-[9px] font-semibold text-cyan-600">Counter-Offer</p>
                                      <p className="text-[10px] font-bold text-cyan-700">PKR {r.counterOfferPrice?.toLocaleString()}</p>
                                      <p className="text-[9px] text-cyan-500">Admin must accept & contact you</p>
                                    </div>
                                  )}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                    <Calendar size={10} className="text-gray-300" />
                                    {new Date(r.createdAt).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex gap-1.5 justify-end">
                                    <motion.button
                                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                      onClick={() => openNegotiate(r)}
                                      className={`inline-flex items-center gap-1 py-1.5 px-3 text-[11px] font-semibold rounded-lg transition-colors ${
                                        hasYourPrice
                                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200/60'
                                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                                      }`}
                                    >
                                      <Pencil size={11} /> {hasYourPrice ? 'Edit' : 'Negotiate'}
                                    </motion.button>
                                    {hasYourPrice && (
                                      <motion.button
                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => handleDirectSubmit(r)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-60"
                                      >
                                        <SendHorizonal size={11} /> {isSubmitting ? 'Submitting…' : 'Submit'}
                                      </motion.button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ══ TAB: ALL REFERRALS ══ */}
          {tab === 'all' && (
            <motion.div key="all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

              {/* Mobile */}
              <div className="space-y-2 lg:hidden">
                {allReferrals.length === 0 ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                      <Users size={20} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-medium text-gray-400">No referrals yet</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Share your referral code to start earning</p>
                  </div>
                ) : allReferrals.map((r, i) => (
                  <AllMobileCard key={r._id} r={r} index={i} />
                ))}
              </div>

              {/* Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.06 }}
                className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
              >
                {allReferrals.length === 0 ? (
                  <div className="flex flex-col items-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <Users size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No referrals yet</p>
                    <p className="text-xs text-gray-300 mt-1">Share your referral code to start earning commissions</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 border-b border-gray-200/60">
                        <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-semibold">Admin</th>
                          <th className="px-5 py-3 font-semibold">Business</th>
                          <th className="px-5 py-3 font-semibold">Plan</th>
                          <th className="px-5 py-3 font-semibold">Customer Request</th>
                          <th className="px-5 py-3 font-semibold">Your Price</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Submitted</th>
                          <th className="px-5 py-3 font-semibold">Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {allReferrals.map((r, i) => (
                            <motion.tr
                              key={r._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                              whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                              className="border-b border-gray-100 transition-colors"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                                    {r.name?.[0]?.toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{r.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                  <Building2 size={11} className="text-gray-300 shrink-0" />
                                  <span className="truncate">{r.businessName || '—'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                {r.planType ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                                      {r.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
                                      {r.planType}
                                    </span>
                                    <p className="text-[11px] text-gray-400 mt-0.5">PKR {r.planPrice?.toLocaleString()}</p>
                                  </div>
                                ) : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                              <td className="px-5 py-3.5">
                                {r.negotiationPrice ? (
                                  <span className="text-xs font-medium text-amber-600">PKR {r.negotiationPrice?.toLocaleString()}</span>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                {r.negotiatedPrice != null && r.negotiatedPrice > 0 ? (
                                  <span className="text-xs font-medium text-emerald-600">PKR {r.negotiatedPrice?.toLocaleString()}</span>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <StatusBadge status={r.status} />
                              </td>
                              <td className="px-5 py-3.5">
                                {r.submittedToSuperAdminAt ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-violet-500">
                                    <SendHorizonal size={10} className="text-violet-400" />
                                    {new Date(r.submittedToSuperAdminAt).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                  <Calendar size={10} className="text-gray-300" />
                                  {new Date(r.createdAt).toLocaleDateString()}
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
            </motion.div>
          )}

        </AnimatePresence>
      )}
    </div>
  );
}