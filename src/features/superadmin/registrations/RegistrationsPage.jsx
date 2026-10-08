   import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../../../shared/api/superadmin.js';
import { Spinner, Alert, Button, Modal, Input } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Clock, XCircle, CheckCircle2,
  User, Building2, Tag, MessageSquare, Link2,
  Sparkles, FileCheck, Ban, CalendarDays, Infinity,
  ArrowRight, Inbox, ChevronDown, Phone,
  GitPullRequest, SendHorizonal, Info, AlertTriangle,
  RefreshCw, DollarSign,
} from 'lucide-react';

const PLANS = {
  YEARLY: { label: 'Yearly', price: 24000 },
  LIFETIME: { label: 'Lifetime', price: 65000 },
};

function StatusBadge({ status }) {
  const config = {
    ACTIVE:                 { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500',  ring: 'ring-emerald-200/50'  },
    APPROVED:               { bg: 'bg-blue-50',     text: 'text-blue-600',    dot: 'bg-blue-500',     ring: 'ring-blue-200/50'     },
    PENDING_APPROVAL:       { bg: 'bg-amber-50',    text: 'text-amber-600',   dot: 'bg-amber-500',    ring: 'ring-amber-200/50'    },
    PENDING_NEGOTIATION:    { bg: 'bg-violet-50',   text: 'text-violet-600',  dot: 'bg-violet-500',   ring: 'ring-violet-200/50'   },
    NEGOTIATION_SUBMITTED:  { bg: 'bg-sky-50',      text: 'text-sky-600',     dot: 'bg-sky-500',      ring: 'ring-sky-200/50'      },
    PRICE_REJECTED:         { bg: 'bg-orange-50',   text: 'text-orange-600',  dot: 'bg-orange-500',   ring: 'ring-orange-200/50'   },
    COUNTER_OFFER:          { bg: 'bg-cyan-50',     text: 'text-cyan-600',    dot: 'bg-cyan-500',     ring: 'ring-cyan-200/50'     },
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

// ── Mobile Card ────────────────────────────────────────────────────────────────
function MobileCard({ reg, index, onApprove, onReject, onRejectPrice }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = reg.status === 'PENDING_APPROVAL' || reg.status === 'NEGOTIATION_SUBMITTED';
  const isReferral = reg.registrationSource === 'REFERRAL';
  const isPriceRejected = reg.status === 'PRICE_REJECTED';
  const hasExtraDetails = reg.phone || reg.negotiationPrice || reg.negotiatedPrice || reg.priceRejectionReason;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
    >
      {/* Main card body */}
      <div className="p-3 space-y-2">
        {/* Row 1: Name + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
              {reg.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{reg.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{reg.email}</p>
            </div>
          </div>
          <StatusBadge status={reg.status} />
        </div>

        {/* Row 2: Quick info chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
            {reg.planType === 'YEARLY' ? <CalendarDays size={8} /> : <Infinity size={8} />}
            {reg.planType} · PKR {reg.planPrice?.toLocaleString()}
          </span>
          {reg.businessName && (
            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{reg.businessName}</span>
          )}
          {isReferral && reg.salesAgentId ? (
            <span className="font-mono text-[9px] font-bold text-orange-600 bg-orange-50 px-1 py-0.5 rounded">
              {reg.salesAgentId.referralCode || reg.salesAgentId.name}
            </span>
          ) : (
            <span className="text-[10px] text-gray-300">Direct</span>
          )}
          {isReferral && (
            <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 border border-violet-200/50 px-1 py-0.5 rounded">Referral</span>
          )}
          {reg.negotiationRound > 0 && (
            <span className="text-[9px] font-semibold text-orange-600 bg-orange-50 border border-orange-200/50 px-1 py-0.5 rounded">
              Round {reg.negotiationRound}
            </span>
          )}
        </div>

        {/* Row 3: Actions */}
        {isPending && (
          <div className="flex gap-2 pt-0.5">
            <Button
              variant="success"
              size="sm"
              onClick={() => onApprove(reg)}
              className="!py-2 !px-3 !text-[11px] flex-1 !rounded-lg"
            >
              <FileCheck size={12} className="mr-1" />
              Approve
            </Button>
            {isReferral && reg.status === 'NEGOTIATION_SUBMITTED' && (
              <Button
                size="sm"
                onClick={() => onRejectPrice(reg)}
                className="!py-2 !px-3 !text-[11px] flex-1 !rounded-lg !bg-orange-500 hover:!bg-orange-600 !text-white !border-orange-500"
              >
                <RefreshCw size={12} className="mr-1" />
                Reject Price
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(reg)}
              className="!py-2 !px-3 !text-[11px] flex-1 !rounded-lg"
            >
              <Ban size={12} className="mr-1" />
              Reject
            </Button>
          </div>
        )}
        {/* Hard-reject for PRICE_REJECTED status */}
        {isPriceRejected && (
          <div className="flex gap-2 pt-0.5">
            <div className="flex-1 flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1.5">
              <AlertTriangle size={10} className="shrink-0" />
              <span>Price rejected — awaiting re-negotiation</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(reg)}
              className="!py-2 !px-3 !text-[11px] !rounded-lg"
            >
              <Ban size={12} />
            </Button>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {hasExtraDetails && (
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

      {/* Expanded details */}
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
              {reg.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Phone size={10} /> {reg.phone}
                </div>
              )}
              {/* Negotiated price (set by sales agent) */}
              {reg.negotiatedPrice && (
                <div className="bg-sky-50/60 border border-sky-100/40 rounded-lg p-2">
                  <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider">Agent Negotiated Price</p>
                  <p className="text-xs font-bold text-sky-700">PKR {reg.negotiatedPrice?.toLocaleString()}</p>
                  <p className="text-[10px] text-sky-500/70 italic">Set by {reg.negotiatedBy?.name || 'agent'}</p>
                </div>
              )}
              {/* Customer requested price */}
              {reg.negotiationPrice && !reg.negotiatedPrice && (
                <div className="bg-purple-50/60 border border-purple-100/40 rounded-lg p-2">
                  <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Requested Price</p>
                  <p className="text-xs font-bold text-purple-700">PKR {reg.negotiationPrice?.toLocaleString()}</p>
                  <p className="text-[10px] text-purple-500/70 italic truncate">"{reg.negotiationReason}"</p>
                </div>
              )}
              {/* Price rejection details */}
              {reg.priceRejectionReason && (
                <div className="bg-orange-50/60 border border-orange-100/40 rounded-lg p-2">
                  <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">Rejection Reason</p>
                  <p className="text-xs text-orange-700 italic">"{reg.priceRejectionReason}"</p>
                  {reg.superadminDesiredPrice && (
                    <p className="text-[10px] font-semibold text-orange-600 mt-1">
                      Desired: PKR {reg.superadminDesiredPrice?.toLocaleString()}
                    </p>
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

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [approveModal, setApproveModal] = useState(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Reject price modal state
  const [rejectPriceModal, setRejectPriceModal] = useState(null);
  const [priceRejectionReason, setPriceRejectionReason] = useState('');
  const [superadminDesiredPrice, setSuperadminDesiredPrice] = useState('');

  // Counter-offer modal state
  const [counterOfferModal, setCounterOfferModal] = useState(null);
  const [counterOfferPrice, setCounterOfferPrice] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');

  const fetchRegistrations = useCallback(() => {
    setLoading(true);
    superadminApi.listRegistrations(statusFilter)
      .then((res) => setRegistrations(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await superadminApi.approveRegistration(approveModal._id, finalPrice ? parseFloat(finalPrice) : undefined);
      setApproveModal(null);
      setFinalPrice('');
      fetchRegistrations();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await superadminApi.rejectRegistration(rejectModal._id, rejectionReason);
      setRejectModal(null);
      setRejectionReason('');
      fetchRegistrations();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPrice = async () => {
    if (!priceRejectionReason.trim()) {
      setActionError('Rejection reason is required.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await superadminApi.rejectPrice(rejectPriceModal._id, {
        priceRejectionReason: priceRejectionReason.trim(),
        superadminDesiredPrice: superadminDesiredPrice ? parseFloat(superadminDesiredPrice) : undefined,
      });
      setRejectPriceModal(null);
      setPriceRejectionReason('');
      setSuperadminDesiredPrice('');
      fetchRegistrations();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!counterOfferPrice || isNaN(parseFloat(counterOfferPrice))) {
      setActionError('A valid counter-offer price is required.');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await superadminApi.sendCounterOffer(counterOfferModal._id, {
        counterOfferPrice: parseFloat(counterOfferPrice),
        counterOfferMessage: counterOfferMessage.trim() || undefined,
      });
      setCounterOfferModal(null);
      setCounterOfferPrice('');
      setCounterOfferMessage('');
      fetchRegistrations();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openApprove     = (reg) => { setApproveModal(reg);     setActionError(''); setFinalPrice(''); };
  const openReject      = (reg) => { setRejectModal(reg);      setActionError(''); };
  const openRejectPrice = (reg) => { setRejectPriceModal(reg); setActionError(''); setPriceRejectionReason(''); setSuperadminDesiredPrice(''); };
  const openCounterOffer = (reg) => { setCounterOfferModal(reg); setActionError(''); setCounterOfferPrice(''); setCounterOfferMessage(''); };

  const filters = [
    ['',                       'Action Required', Clock],
    ['PENDING_APPROVAL',       'Direct Pending',  Clock],
    ['NEGOTIATION_SUBMITTED',  'Negotiated',      SendHorizonal],
    ['PRICE_REJECTED',         'Price Rejected',  AlertTriangle],
    ['COUNTER_OFFER',          'Counter Offer',   DollarSign],
    ['PENDING_NEGOTIATION',    'With Agent',      GitPullRequest],
    ['APPROVED',               'Approved',        CheckCircle2],
    ['ACTIVE',                 'Active',          ShieldCheck],
    ['REJECTED',               'Rejected',        XCircle],
  ];

  const isReferral = approveModal?.registrationSource === 'REFERRAL';
  const effectivePrice = isReferral
    ? (approveModal?.negotiatedPrice || approveModal?.negotiationPrice || approveModal?.planPrice)
    : (approveModal?.negotiatedPrice || approveModal?.negotiationPrice || approveModal?.planPrice);

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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Registrations</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Review and approve requests</p>
      </motion.div>

      {/* Status filter */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
        className="flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none sm:overflow-visible sm:flex-wrap"
      >
        {filters.map(([val, label, Icon], i) => (
          <motion.button
            key={val || 'action'}
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

      {/* ── Approve Modal ── */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => { setApproveModal(null); setFinalPrice(''); setActionError(''); }}
        title="Approve Registration"
      >
        {approveModal && (
          <>
            <Alert message={actionError} />
            <div className="space-y-3 mt-4">
              <div className="bg-purple-50/50 border border-purple-100/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-md shadow-purple-500/20 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{approveModal.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{approveModal.email}</p>
                  </div>
                  {isReferral && (
                    <span className="ml-auto text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200/50 px-1.5 py-0.5 rounded shrink-0">
                      Referral
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-purple-100/60">
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Business</p>
                    <p className="text-xs text-gray-700">{approveModal.businessName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Plan</p>
                    <p className="text-xs text-gray-700 flex items-center gap-1">
                      {approveModal.planType === 'YEARLY' ? <CalendarDays size={10} className="text-purple-400" /> : <Infinity size={10} className="text-purple-400" />}
                      PKR {PLANS[approveModal.planType]?.price?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {approveModal.negotiatedPrice && (
                  <div className="bg-sky-50/60 border border-sky-200/50 rounded-lg p-2.5">
                    <p className="text-[9px] font-semibold text-sky-600 uppercase tracking-wider mb-0.5">Agent Negotiated Price</p>
                    <p className="text-xs font-bold text-sky-700">PKR {approveModal.negotiatedPrice?.toLocaleString()}</p>
                    <p className="text-[10px] text-sky-600/70">Set by {approveModal.negotiatedBy?.name || 'sales agent'}</p>
                  </div>
                )}

                {approveModal.negotiationPrice && !approveModal.negotiatedPrice && (
                  <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg p-2.5">
                    <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider mb-0.5">Requested Price</p>
                    <p className="text-xs font-bold text-amber-700">PKR {approveModal.negotiationPrice?.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-600/70 italic mt-0.5">"{approveModal.negotiationReason}"</p>
                  </div>
                )}
              </div>

              {isReferral ? (
                <div className="flex items-start gap-2 p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl">
                  <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700">
                    This is a referral registration. The final price will be set to the agent's negotiated price
                    <strong> (PKR {effectivePrice?.toLocaleString()})</strong>. You cannot override this.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    <Tag size={11} className="text-purple-400" />Final Price (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder={`Default: ${approveModal.negotiationPrice || approveModal.planPrice}`}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Leave blank to use negotiation or standard price.</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" onClick={() => setApproveModal(null)}>Cancel</Button>
              <Button onClick={handleApprove} loading={actionLoading}>Approve</Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectionReason(''); setActionError(''); }}
        title="Reject Registration"
      >
        {rejectModal && (
          <>
            <Alert message={actionError} />
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2 bg-red-50/50 border border-red-100/60 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 shadow-md shadow-red-500/20 flex items-center justify-center shrink-0">
                  <Ban size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700">Permanently rejecting <strong>{rejectModal.name}</strong></p>
                  <p className="text-[10px] text-gray-400 truncate">{rejectModal.email}</p>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <MessageSquare size={11} className="text-red-400" />Reason (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Reason for rejection..."
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-300 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Reject Price Modal ── */}
      <Modal
        isOpen={!!rejectPriceModal}
        onClose={() => { setRejectPriceModal(null); setPriceRejectionReason(''); setSuperadminDesiredPrice(''); setActionError(''); }}
        title="Reject Price — Request Re-Negotiation"
      >
        {rejectPriceModal && (
          <>
            <Alert message={actionError} />
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-2 p-3 bg-orange-50/50 border border-orange-100/60 rounded-xl">
                <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-orange-700">
                  This is a <strong>soft rejection</strong> — the sales agent will be notified to re-negotiate the price.
                  This is <em>not</em> a permanent rejection.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-100/60 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700">Rejecting price for <strong>{rejectPriceModal.name}</strong></p>
                  {rejectPriceModal.negotiatedPrice && (
                    <p className="text-[10px] text-sky-600 font-medium">
                      Submitted price: PKR {rejectPriceModal.negotiatedPrice?.toLocaleString()}
                    </p>
                  )}
                  {rejectPriceModal.negotiationRound > 0 && (
                    <p className="text-[10px] text-orange-500">Round {rejectPriceModal.negotiationRound}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <MessageSquare size={11} className="text-orange-400" />Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={priceRejectionReason}
                  onChange={(e) => setPriceRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Why is the submitted price not acceptable?"
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 transition-all resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <Tag size={11} className="text-orange-400" />Your Desired Price (PKR) — optional
                </label>
                <input
                  type="number"
                  min="0"
                  value={superadminDesiredPrice}
                  onChange={(e) => setSuperadminDesiredPrice(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Leave blank if you want the sales agent to propose a new price without a target.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" onClick={() => setRejectPriceModal(null)}>Cancel</Button>
              <Button
                onClick={handleRejectPrice}
                loading={actionLoading}
                className="!bg-orange-500 hover:!bg-orange-600 !border-orange-500"
              >
                <RefreshCw size={13} className="mr-1.5" />
                Reject Price
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Counter-Offer Modal ── */}
      <Modal
        isOpen={!!counterOfferModal}
        onClose={() => { setCounterOfferModal(null); setCounterOfferPrice(''); setCounterOfferMessage(''); setActionError(''); }}
        title="Send Counter-Offer to Admin"
      >
        {counterOfferModal && (
          <>
            <Alert message={actionError} />
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-2 p-3 bg-cyan-50/50 border border-cyan-100/60 rounded-xl">
                <Info size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-cyan-700">
                  The admin will see this counter-offer on their next login attempt and must contact their
                  sales agent to proceed. This is <strong>not</strong> a rejection — the account remains open.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-100/60 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 shadow-md shadow-cyan-500/20 flex items-center justify-center shrink-0">
                  <DollarSign size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700">Sending counter-offer to <strong>{counterOfferModal.name}</strong></p>
                  {counterOfferModal.negotiatedPrice && (
                    <p className="text-[10px] text-sky-600 font-medium">
                      Their submitted price: PKR {counterOfferModal.negotiatedPrice?.toLocaleString()}
                    </p>
                  )}
                  {counterOfferModal.salesAgentId && (
                    <p className="text-[10px] text-violet-600">
                      Agent: {counterOfferModal.salesAgentId.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <DollarSign size={11} className="text-cyan-400" />Final Approved Price (PKR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={counterOfferPrice}
                  onChange={(e) => setCounterOfferPrice(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-300 transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">This is the minimum price at which the account can be activated.</p>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                  <MessageSquare size={11} className="text-cyan-400" />Message to Admin (optional)
                </label>
                <textarea
                  value={counterOfferMessage}
                  onChange={(e) => setCounterOfferMessage(e.target.value)}
                  rows={3}
                  placeholder='e.g. "The requested price cannot be approved. The minimum available price for your account is PKR 20,000/month."'
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-300 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" onClick={() => setCounterOfferModal(null)}>Cancel</Button>
              <Button
                onClick={handleCounterOffer}
                loading={actionLoading}
                className="!bg-cyan-500 hover:!bg-cyan-600 !border-cyan-500"
              >
                <DollarSign size={13} className="mr-1.5" />
                Send Counter-Offer
              </Button>
            </div>
          </>
        )}
      </Modal>

      {loading ? <Spinner /> : (
        <>
          {/* ── Mobile: Card layout ── */}
          <div className="space-y-2 lg:hidden">
            {registrations.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                  <Inbox size={20} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">No registrations found</p>
              </div>
            )}
            {registrations.map((reg, i) => (
              <MobileCard
                key={reg._id}
                reg={reg}
                index={i}
                onApprove={openApprove}
                onReject={openReject}
                onRejectPrice={openRejectPrice}
              />
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
                    <th className="px-5 py-3 font-semibold">Applicant</th>
                    <th className="px-5 py-3 font-semibold">Business</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Price Info</th>
                    <th className="px-5 py-3 font-semibold">Source</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <Inbox size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-400">No registrations found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  <AnimatePresence>
                    {registrations.map((reg, i) => {
                      const isRef = reg.registrationSource === 'REFERRAL';
                      const canActOn = reg.status === 'PENDING_APPROVAL' || reg.status === 'NEGOTIATION_SUBMITTED';
                      const isPriceRejected = reg.status === 'PRICE_REJECTED';
                      return (
                        <motion.tr
                          key={reg._id}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                          className="border-b border-gray-100 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                                {reg.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{reg.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{reg.email}</p>
                                {reg.phone && <p className="text-[11px] text-gray-400 truncate">{reg.phone}</p>}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                              <Building2 size={11} className="text-gray-300 shrink-0" />
                              <span className="truncate">{reg.businessName || '—'}</span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                              {reg.planType === 'YEARLY' ? <CalendarDays size={9} /> : <Infinity size={9} />}
                              {reg.planType}
                            </span>
                            <p className="text-[11px] text-gray-400 mt-0.5">PKR {reg.planPrice?.toLocaleString()}</p>
                          </td>

                          {/* Consolidated price info column */}
                          <td className="px-5 py-3.5">
                            {reg.negotiatedPrice ? (
                              <div className="bg-sky-50/60 border border-sky-100/50 rounded-lg p-2">
                                <p className="text-[9px] font-semibold text-sky-600 uppercase tracking-wider">Agent Price</p>
                                <p className="text-xs font-semibold text-sky-700">PKR {reg.negotiatedPrice?.toLocaleString()}</p>
                                {reg.negotiationRound > 0 && (
                                  <p className="text-[9px] text-orange-500 mt-0.5">Round {reg.negotiationRound}</p>
                                )}
                              </div>
                            ) : reg.negotiationPrice ? (
                              <div className="bg-purple-50/60 border border-purple-100/50 rounded-lg p-2">
                                <p className="text-[9px] font-semibold text-purple-600 uppercase tracking-wider">Requested</p>
                                <p className="text-xs font-semibold text-purple-700">PKR {reg.negotiationPrice?.toLocaleString()}</p>
                                <p className="text-[10px] text-purple-500/70 italic mt-0.5 truncate max-w-[140px]">{reg.negotiationReason}</p>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                            {/* Counter-offer info */}
                            {reg.counterOfferPrice && (
                              <div className="mt-1 bg-cyan-50/50 border border-cyan-100/50 rounded-lg p-1.5">
                                <p className="text-[9px] font-semibold text-cyan-600 uppercase tracking-wider">Counter-Offer Sent</p>
                                <p className="text-[10px] font-semibold text-cyan-700">PKR {reg.counterOfferPrice?.toLocaleString()}</p>
                                {reg.counterOfferMessage && (
                                  <p className="text-[9px] text-cyan-600 italic truncate max-w-[140px]">"{reg.counterOfferMessage}"</p>
                                )}
                              </div>
                            )}
                            {/* Rejection reason sub-info */}
                            {reg.priceRejectionReason && (
                              <div className="mt-1 bg-orange-50/50 border border-orange-100/50 rounded-lg p-1.5">
                                <p className="text-[9px] font-semibold text-orange-600 uppercase tracking-wider">Rejected Reason</p>
                                <p className="text-[10px] text-orange-700 italic truncate max-w-[140px]">"{reg.priceRejectionReason}"</p>
                                {reg.superadminDesiredPrice && (
                                  <p className="text-[9px] text-orange-600 font-semibold">Want: PKR {reg.superadminDesiredPrice?.toLocaleString()}</p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Source column */}
                          <td className="px-5 py-3.5">
                            {isRef ? (
                              <div>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200/40 px-1.5 py-0.5 rounded mb-1">
                                  Referral
                                </span>
                                {reg.salesAgentId && (
                                  <p className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/40 px-1.5 py-0.5 rounded block w-fit">
                                    {reg.salesAgentId.referralCode || reg.salesAgentId.name}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                                <Link2 size={9} />Direct
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5"><StatusBadge status={reg.status} /></td>

                          <td className="px-5 py-3.5 text-right">
                            {canActOn && (
                              <div className="flex gap-1.5 justify-end flex-wrap">
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                  <Button variant="success" size="sm" onClick={() => openApprove(reg)} className="!py-1 !px-2.5 !text-[11px]">
                                    <FileCheck size={11} className="mr-0.5" />Approve
                                  </Button>
                                </motion.div>
                                {/* Reject Price & Counter-Offer — only for referral NEGOTIATION_SUBMITTED */}
                                {isRef && reg.status === 'NEGOTIATION_SUBMITTED' && (
                                  <>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                      <Button
                                        size="sm"
                                        onClick={() => openRejectPrice(reg)}
                                        className="!py-1 !px-2.5 !text-[11px] !bg-orange-500 hover:!bg-orange-600 !text-white !border-orange-500"
                                      >
                                        <RefreshCw size={11} className="mr-0.5" />Reject Price
                                      </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                      <Button
                                        size="sm"
                                        onClick={() => openCounterOffer(reg)}
                                        className="!py-1 !px-2.5 !text-[11px] !bg-cyan-500 hover:!bg-cyan-600 !text-white !border-cyan-500"
                                      >
                                        <DollarSign size={11} className="mr-0.5" />Counter
                                      </Button>
                                    </motion.div>
                                  </>
                                )}
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                  <Button variant="danger" size="sm" onClick={() => openReject(reg)} className="!py-1 !px-2.5 !text-[11px]">
                                    <Ban size={11} className="mr-0.5" />Reject
                                  </Button>
                                </motion.div>
                              </div>
                            )}
                            {isPriceRejected && (
                              <div className="flex gap-1.5 justify-end">
                                <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1">
                                  Awaiting re-negotiation
                                </span>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                  <Button variant="danger" size="sm" onClick={() => openReject(reg)} className="!py-1 !px-2.5 !text-[11px]">
                                    <Ban size={11} />
                                  </Button>
                                </motion.div>
                              </div>
                            )}
                            {reg.status === 'COUNTER_OFFER' && (
                              <div className="flex gap-1.5 justify-end">
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                  <Button
                                    size="sm"
                                    onClick={() => openCounterOffer(reg)}
                                    className="!py-1 !px-2.5 !text-[11px] !bg-cyan-500 hover:!bg-cyan-600 !text-white !border-cyan-500"
                                  >
                                    <DollarSign size={11} className="mr-0.5" />Revise Offer
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                  <Button variant="danger" size="sm" onClick={() => openReject(reg)} className="!py-1 !px-2.5 !text-[11px]">
                                    <Ban size={11} />
                                  </Button>
                                </motion.div>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
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
