  import { useState, useEffect } from 'react';
import { adminApi } from '../../../shared/api/admin.js';
import { useAuth } from '../../../shared/utils/AuthContext.jsx';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion } from 'framer-motion';
import { User, Building2, Mail, Crown, ShieldCheck, Link2, Sparkles } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 20, delay: i * 0.07 },
  }),
};

const cardData = [
  {
    key: 'name',
    label: 'Name',
    icon: User,
    gradient: 'from-teal-400 to-cyan-500',
    shadow: 'shadow-teal-500/20',
    textColor: 'text-gray-900',
  },
  {
    key: 'business',
    label: 'Business',
    icon: Building2,
    gradient: 'from-violet-400 to-purple-500',
    shadow: 'shadow-violet-500/20',
    textColor: 'text-gray-900',
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    gradient: 'from-sky-400 to-blue-500',
    shadow: 'shadow-sky-500/20',
    textColor: 'text-gray-900',
  },
  {
    key: 'plan',
    label: 'Plan',
    icon: Crown,
    gradient: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-500/20',
    textColor: 'text-teal-600',
  },
  {
    key: 'status',
    label: 'Status',
    icon: ShieldCheck,
    gradient: 'from-emerald-400 to-green-500',
    shadow: 'shadow-emerald-500/20',
    textColor: null,
  },
  {
    key: 'referral',
    label: 'Referred By',
    icon: Link2,
    gradient: 'from-rose-400 to-pink-500',
    shadow: 'shadow-rose-500/20',
    textColor: 'text-orange-600',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const data = profile || user;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-teal-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
        </div>
        <p className="text-sm text-gray-500 ml-7">Welcome back, here's your account overview</p>
      </motion.div>

      {loading ? <Spinner /> : error ? <Alert message={error} /> : data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {cardData.map((card, i) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.key}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 sm:p-6 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-300/60"
              >
                {/* Subtle corner glow on hover */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />

                {/* Label + Icon row */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{card.label}</p>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon size={16} className="text-white" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Value */}
                {card.key === 'name' && (
                  <p className="text-xl font-bold text-gray-900 truncate">{data.name}</p>
                )}

                {card.key === 'business' && (
                  <p className="text-xl font-bold text-gray-900 truncate">{data.businessName || '—'}</p>
                )}

                {card.key === 'email' && (
                  <p className="text-base sm:text-lg font-bold text-gray-900 truncate">{data.email}</p>
                )}

                {card.key === 'plan' && (
                  <div>
                    <p className="text-xl font-bold text-teal-600">{data.planType || '—'}</p>
                    {data.finalPrice && (
                      <p className="text-sm text-gray-400 mt-1.5 font-medium">PKR {data.finalPrice?.toLocaleString()}</p>
                    )}
                  </div>
                )}

                {card.key === 'status' && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mt-0.5 ${
                    data.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60' :
                    data.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/60' :
                    'bg-amber-50 text-amber-600 ring-1 ring-amber-200/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      data.status === 'ACTIVE' ? 'bg-emerald-500' :
                      data.status === 'APPROVED' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`} />
                    {data.status}
                  </span>
                )}

                {card.key === 'referral' && (
                  <p className="text-xl font-bold text-orange-600 truncate">{data.referralCodeUsed || 'Direct'}</p>
                )}
              </motion.div>
            );
          })}

        </div>
      )}
    </div>
  );
}