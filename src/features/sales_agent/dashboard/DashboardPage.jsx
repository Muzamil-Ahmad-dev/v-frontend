 import { useState, useEffect } from 'react';
import { salesAgentApi } from '../../../shared/api/salesagent.js';
import { useAuth } from '../../../shared/utils/AuthContext.jsx';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion } from 'framer-motion';
import {
  Users, Clock, CheckCircle2, XCircle,
  Wallet, Timer, Banknote, Sparkles,
  Copy, Check, Ticket, SendHorizonal,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 20, delay: i * 0.06 },
  }),
};

export default function SalesAgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [commissionData, setCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      salesAgentApi.getReferralStats(),
      salesAgentApi.getCommissions(),
    ])
      .then(([statsRes, commissionsRes]) => {
        setStats(statsRes.data);
        setCommissionData(commissionsRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(user?.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Spinner />;
  if (error) return <Alert message={error} />;

  // Keys match backend getReferralStats response:
  // { totalReferrals, pendingNegotiation, submitted, approvedAdmins, rejectedAdmins }
  const referralCards = [
    { title: 'Total Referrals',     value: stats?.totalReferrals     ?? 0, icon: Users,         gradient: 'from-indigo-400 to-indigo-600',   shadow: 'shadow-indigo-500/20',  text: 'text-indigo-600'  },
    { title: 'Pending Negotiation', value: stats?.pendingNegotiation ?? 0, icon: Clock,         gradient: 'from-amber-400 to-orange-500',    shadow: 'shadow-amber-500/20',   text: 'text-amber-600'  },
    { title: 'Submitted',           value: stats?.submitted          ?? 0, icon: SendHorizonal, gradient: 'from-violet-400 to-violet-600',   shadow: 'shadow-violet-500/20',  text: 'text-violet-600'  },
    { title: 'Approved / Active',   value: stats?.approvedAdmins     ?? 0, icon: CheckCircle2,  gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', text: 'text-emerald-600' },
    { title: 'Rejected',            value: stats?.rejectedAdmins     ?? 0, icon: XCircle,       gradient: 'from-red-400 to-rose-500',        shadow: 'shadow-red-500/20',     text: 'text-red-600'     },
  ];

  // Keys match backend getCommissions response:
  // { totalCommissionEarned, pendingCommission, paidCommission, commissionHistory }
  const commissionCards = [
    { title: 'Total Earned', value: `PKR ${(commissionData?.totalCommissionEarned ?? 0).toLocaleString()}`, icon: Wallet,   gradient: 'from-orange-400 to-orange-600',   shadow: 'shadow-orange-500/20',  text: 'text-orange-600'  },
    { title: 'Pending',      value: `PKR ${(commissionData?.pendingCommission     ?? 0).toLocaleString()}`, icon: Timer,    gradient: 'from-amber-400 to-orange-500',    shadow: 'shadow-amber-500/20',   text: 'text-amber-600'   },
    { title: 'Paid',         value: `PKR ${(commissionData?.paidCommission        ?? 0).toLocaleString()}`, icon: Banknote, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', text: 'text-emerald-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-orange-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome, {user?.name}</h2>
        </div>
        <p className="text-sm text-gray-500 ml-7">Your referral & commission overview</p>
      </motion.div>

      {/* Referral code banner */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6 sm:mb-8 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 opacity-[0.08]" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 opacity-[0.06]" />
        <div className="relative bg-gradient-to-br from-orange-50/80 to-amber-50/50 border border-orange-200/60 rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/25 flex items-center justify-center shrink-0">
            <Ticket size={24} className="text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl sm:text-3xl font-bold text-orange-600 tracking-[0.2em] font-mono">
                {user?.referralCode}
              </p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                  copied
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-white/80 text-orange-500 hover:bg-white hover:shadow-md border border-orange-200/50'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </motion.button>
            </div>
            <p className="text-xs text-orange-500/70 mt-1">Share this code when registering new admins</p>
          </div>
        </div>
      </motion.div>

      {/* Referral stats */}
      {stats && (
        <section className="mb-6 sm:mb-8">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Referrals</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
            {referralCards.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i + 1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 sm:p-5 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/60"
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
      )}

      {/* Commission stats */}
      {commissionData && (
        <section>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Commissions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {commissionCards.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i + 6}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 sm:p-5 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/60"
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
      )}
    </div>
  );
}