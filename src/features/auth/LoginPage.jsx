   import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../shared/utils/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, ArrowLeft,
  Zap, ShieldCheck, CheckCircle2, ChevronRight, X,
  Clock, AlertTriangle, Info, Hourglass,
} from 'lucide-react';

const cardVariants = {
  hidden:  { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 100, damping: 18 } },
};

const leftVariants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0,  transition: { type: 'spring', stiffness: 80, damping: 18, delay: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 22 } },
};

const features = [
  { icon: Zap,          text: 'Instant access to your dashboard'  },
  { icon: ShieldCheck,  text: 'Secure & reliable platform'        },
  { icon: CheckCircle2, text: 'Dedicated customer support'        },
];

/* ── Account status banner config ─────────────────────────── */
const STATUS_BANNERS = {
  PENDING_APPROVAL: {
    variant: 'green',
    icon: Clock,
    title: 'Application Under Review',
    message: 'Your registration is currently being reviewed by our team. You will be notified once a decision has been made.',
  },
  PENDING_NEGOTIATION: {
    variant: 'green',
    icon: Hourglass,
    title: 'Pricing Negotiation in Progress',
    // message is dynamically built from meta.salesAgent
  },
  NEGOTIATION_SUBMITTED: {
    variant: 'green',
    icon: CheckCircle2,
    title: 'Awaiting Final Approval',
    message: 'Your negotiated pricing has been forwarded to the Super Admin for final approval. No further action is required from you at this time.',
  },
  APPROVED: {
    variant: 'green',
    icon: Mail,
    title: 'Approved — Check Your Email',
    message: 'Your account has been approved! Please check your inbox and click the verification link to activate your account.',
  },
  PRICE_REJECTED: {
    variant: 'warning',
    icon: AlertTriangle,
    title: 'Price Under Re-Negotiation',
    // message is dynamically built from meta
  },
  COUNTER_OFFER: {
    variant: 'warning',
    icon: Info,
    title: 'Pricing Update',
    // message is dynamically built from meta.counterOfferPrice / counterOfferMessage / salesAgent
  },
  REJECTED: {
    variant: 'error',
    icon: X,
    title: 'Account Approval Declined',
    // message is dynamically built from meta.rejectionReason / salesAgent
  },
  DEACTIVATED: {
    variant: 'error',
    icon: AlertTriangle,
    title: 'Account Deactivated',
    message: 'Your account has been deactivated. Please contact support for assistance.',
  },
};

const bannerStyles = {
  green: {
    wrap:  'bg-emerald-50 border-emerald-200',
    icon:  'bg-emerald-100 text-emerald-600',
    title: 'text-emerald-800',
    body:  'text-emerald-700',
    dot:   'bg-emerald-500',
  },
  error: {
    wrap:  'bg-red-50 border-red-200',
    icon:  'bg-red-100 text-red-500',
    title: 'text-red-700',
    body:  'text-red-600',
    dot:   null,
  },
  warning: {
    wrap:  'bg-orange-50 border-orange-200',
    icon:  'bg-orange-100 text-orange-600',
    title: 'text-orange-800',
    body:  'text-orange-700',
    dot:   'bg-orange-500',
  },
};

/* ── Floating label input ───────────────────────────────────── */
function FormField({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-500 mb-1.5 sm:mb-2 uppercase tracking-wide">
        {Icon && <Icon size={12} className="text-teal-500" />}
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Status Banner ──────────────────────────────────────────── */
function StatusBanner({ status, meta }) {
  const config = STATUS_BANNERS[status];
  if (!config) return null;

  const style      = bannerStyles[config.variant];
  const BannerIcon = config.icon;
  const agent      = meta?.salesAgent;
  const agentLine  = agent ? `${agent.name}${agent.phone ? ` (${agent.phone})` : ''}` : null;

  // Build dynamic body based on status
  let body = config.message || '';

  if (status === 'PENDING_NEGOTIATION') {
    body = agentLine
      ? `Your account is under pricing negotiation. Your referral Sales Agent, ${agentLine}, has submitted your pricing request to the Super Admin for final approval. You will be notified once the review is complete.`
      : 'Your account is currently under pricing negotiation. You will be notified once the review is complete.';
  }

  if (status === 'PRICE_REJECTED') {
    body = 'Your pricing submission was reviewed but the requested price could not be approved.';
    if (meta?.priceRejectionReason) body += ` Reason: "${meta.priceRejectionReason}".`;
    if (meta?.superadminDesiredPrice) body += ` Required price: $${meta.superadminDesiredPrice}.`;
    if (agentLine) body += ` Your Sales Agent, ${agentLine}, is working on a revised offer.`;
  }

  if (status === 'COUNTER_OFFER') {
    const requested = meta?.requestedPrice != null ? `$${meta.requestedPrice}` : 'N/A';
    const offered   = meta?.counterOfferPrice != null ? `$${meta.counterOfferPrice}` : 'N/A';
    body = `The Super Admin has reviewed your pricing request but was unable to approve the requested amount.`;
    body += ` Requested Price: ${requested} · Final Approved Price: ${offered}.`;
    if (meta?.counterOfferMessage) body += ` Super Admin's message: "${meta.counterOfferMessage}".`;
    if (agentLine) body += ` To proceed, please contact your Sales Agent, ${agentLine}.`;
  }

  if (status === 'REJECTED') {
    body = 'Your account approval request has been declined.';
    if (meta?.rejectionReason) body += ` Reason: ${meta.rejectionReason}.`;
    if (agentLine) body += ` For further assistance, contact your Sales Agent, ${agentLine}.`;
  }

  return (
    <motion.div
      key="status-banner"
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="mb-4 sm:mb-5 overflow-hidden"
    >
      <div className={`p-3.5 sm:p-4 border rounded-xl ${style.wrap}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.icon}`}>
            <BannerIcon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`text-xs sm:text-sm font-semibold ${style.title}`}>{config.title}</p>
              {style.dot && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                  Active
                </span>
              )}
            </div>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${style.body}`}>{body}</p>
            {/* Extra structured details for COUNTER_OFFER */}
            {status === 'COUNTER_OFFER' && meta?.counterOfferPrice != null && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="bg-white/60 rounded-lg px-2 py-1.5 border border-orange-100/60">
                  <p className="text-[9px] font-semibold text-orange-500 uppercase tracking-wider">Requested</p>
                  <p className="text-xs font-bold text-orange-700">{meta.requestedPrice != null ? `$${meta.requestedPrice}` : 'N/A'}</p>
                </div>
                <div className="bg-white/60 rounded-lg px-2 py-1.5 border border-orange-100/60">
                  <p className="text-[9px] font-semibold text-orange-500 uppercase tracking-wider">Final Offer</p>
                  <p className="text-xs font-bold text-orange-700">${meta.counterOfferPrice}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Generic error banner ───────────────────────────────────── */
function ErrorBanner({ message }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="mb-4 sm:mb-5 overflow-hidden"
    >
      <div className="p-3 sm:p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <X size={11} className="text-red-500" />
        </div>
        <p className="text-red-600 text-xs sm:text-sm">{message}</p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]           = useState({ email: '', password: '' });
  const [error, setError]         = useState('');
  const [accountStatus, setAccountStatus] = useState(null); // e.g. 'PENDING_NEGOTIATION'
  const [statusMeta, setStatusMeta] = useState(null);          // rich metadata from API error
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAccountStatus(null);
    setStatusMeta(null);
    setLoading(true);

    const ROLE_ROUTES = {
      SUPER_ADMIN:  '/superadmin/dashboard',
      ADMIN:        '/admin/dashboard',
      SALES_AGENT:  '/sales-agent/dashboard',
      BRANCH_ADMIN: '/branch-admin/dashboard',
      BILLING:      '/billing/dashboard',
      SALE:         '/sale/dashboard',
      PURCHASE:     '/purchase/dashboard',
    };

    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_ROUTES[user.role] || '/login');
    } catch (err) {
      // err.meta comes from the API response { data: { accountStatus, salesAgent, ... } }
      const meta   = err?.meta || err?.response?.data?.data || err?.response?.data?.meta;
      const status = meta?.accountStatus;

      if (status && STATUS_BANNERS[status]) {
        setAccountStatus(status);
        setStatusMeta(meta);
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm ' +
    'text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40 ' +
    'focus:border-teal-400 hover:border-stone-300 transition-all duration-200 shadow-sm';

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-teal-50/60 relative overflow-hidden">

      {/* ── Background Decorations ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-teal-400/[0.07] blur-[100px]" />
        <div className="absolute bottom-[-25%] left-[-15%] w-[900px] h-[900px] rounded-full bg-teal-300/[0.05] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border border-teal-300/[0.05]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-teal-200/[0.04] rotate-45" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400/20"
            style={{
              width:  `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              top:    `${15 + i * 14}%`,
              left:   `${8 + (i * 17) % 85}%`,
              animation: `pulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="min-h-screen flex flex-col lg:flex-row items-stretch relative z-10">

        {/* ── Left Panel ── */}
        <motion.div
          variants={leftVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex flex-col justify-center lg:w-[42%] xl:w-[40%] 2xl:w-[36%] shrink-0 px-8 xl:px-12 2xl:px-16 py-12 lg:sticky lg:top-0 lg:h-screen"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 12px rgba(20,184,166,0.2)', '0 0 35px rgba(20,184,166,0.35)', '0 0 12px rgba(20,184,166,0.2)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-xl shadow-teal-500/25 flex items-center justify-center mb-8"
          >
            <img src="/image.png" alt="Logo" className="h-10 w-10 object-contain drop-shadow" />
          </motion.div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-stone-800 tracking-tight leading-[1.15] mb-4">
            Welcome back to<br />
            <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">Okiiee</span>
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-stone-500 leading-relaxed mb-10 lg:mb-12 max-w-md">
            Sign in to your account and manage everything from one powerful dashboard.
          </p>

          <div className="space-y-4 lg:space-y-5 mb-12 lg:mb-16">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 120, damping: 18 }}
                className="flex items-center gap-3 lg:gap-4"
              >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  <f.icon size={18} className="text-teal-600" />
                </div>
                <span className="text-sm lg:text-base text-stone-600">{f.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link to="/register" className="inline-flex items-center gap-2 lg:gap-2.5 text-sm text-stone-400 hover:text-teal-600 transition-colors group">
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              Don't have an account? Register
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform text-teal-400/40" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Right Panel — form card ── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[58%] xl:w-[60%] 2xl:w-[64%] shrink-0 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12"
        >
          <div className="w-full max-w-[440px] lg:max-w-[480px] xl:max-w-[520px]">
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 xl:p-10 shadow-xl shadow-stone-200/50 ring-1 ring-stone-100">

              {/* Mobile header */}
              <div className="lg:hidden mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <motion.div
                    animate={{ boxShadow: ['0 0 10px rgba(20,184,166,0.2)', '0 0 25px rgba(20,184,166,0.3)', '0 0 10px rgba(20,184,166,0.2)'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center"
                  >
                    <img src="/image.png" alt="Logo" className="h-6 sm:h-7 w-6 sm:w-7 object-contain drop-shadow" />
                  </motion.div>
                  <Link to="/register" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-600 transition-colors bg-stone-50 border border-stone-200 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg">
                    <ArrowLeft size={12} />Register
                  </Link>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">Sign in to your account</h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 sm:mt-1.5">Enter your credentials to continue</p>
              </div>

              {/* Desktop heading */}
              <div className="hidden lg:block mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 tracking-tight">Sign in</h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-1.5 sm:mt-2">Welcome back! Please enter your details.</p>
              </div>

              {/* ── Status / Error Banners ── */}
              <AnimatePresence mode="wait">
                {accountStatus ? (
                  <StatusBanner
                    key="status"
                    status={accountStatus}
                    meta={statusMeta}
                  />
                ) : error ? (
                  <ErrorBanner key="error" message={error} />
                ) : null}
              </AnimatePresence>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                  <FormField icon={Mail} label="Email Address" required>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className={inputClass}
                    />
                  </FormField>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <FormField icon={Lock} label="Password" required>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className={inputClass}
                    />
                  </FormField>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Sign in <ArrowRight size={16} /></>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Mobile register link */}
              <div className="text-center mt-6 sm:mt-8 pt-5 border-t border-stone-100 lg:hidden">
                <p className="text-xs sm:text-sm text-stone-400">
                  New admin?{' '}
                  <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-500 transition-colors inline-flex items-center gap-0.5">
                    Register here <ArrowRight size={12} />
                  </Link>
                </p>
              </div>

            </div>

            {/* Desktop register link */}
            <div className="hidden lg:block text-center mt-6">
              <p className="text-sm text-stone-400">
                New admin?{' '}
                <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-500 transition-colors inline-flex items-center gap-1">
                  Register here <ArrowRight size={14} />
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}