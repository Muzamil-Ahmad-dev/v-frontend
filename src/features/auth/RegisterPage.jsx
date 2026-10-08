    import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/api/auth.js';
import { motion, AnimatePresence } from 'framer-motion';
 import {
  User, Building2, Mail, Phone, Lock, ArrowRight, ArrowLeft,
  Sparkles, CalendarDays, Infinity, Check, X,
  CircleDot, ShieldCheck, CheckCircle2,
  Zap, Headphones, ChevronRight, KeyRound, RefreshCw,
  Cloud, Wallet, Info, Receipt, Server,
} from 'lucide-react';

 const SERVER_FEE_MONTHLY = 3000;
const CLOUD_FEE_ADVANCE  = 15000;

const PLANS = [
  { key: 'YEARLY',   label: 'Yearly',   price: 'PKR 35,000/year',     priceType: 'yearly', priceNum: 35000, cloudFee: '+ PKR 15,000 cloud fee', icon: CalendarDays, badge: 'Popular',    minNegotiation: 34000 },
  { key: 'LIFETIME', label: 'Lifetime', price: 'PKR 70,000 one-time', priceType: 'once',   priceNum: 70000, cloudFee: '+ PKR 15,000 cloud fee', icon: Infinity,     badge: 'Best Value', minNegotiation: 69000 },
];


 const SUPPORT_NUMBER = '+92 305 7903867';

const features = [
  { icon: Zap,          text: 'Instant setup after approval'  },
  { icon: ShieldCheck,  text: 'Secure & reliable platform'    },
  { icon: CheckCircle2, text: 'Dedicated customer support'    },
];

/* ── Animation variants ── */
const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 110, damping: 20 } },
};
const leftVariants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { type: 'spring', stiffness: 90, damping: 20, delay: 0.05 } },
};
const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 22 } },
};

/* ── Step Indicator ── */
function StepIndicator({ step }) {
  const steps = ['Verify Email', 'Enter OTP', 'Complete'];
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mb-6">
      {steps.map((label, i) => {
        const idx     = i + 1;
        const done    = step > idx;
        const current = step === idx;
        return (
          <div key={label} className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
              done    ? 'bg-teal-500 text-white shadow-sm shadow-teal-300/50' :
              current ? 'bg-teal-50 border-2 border-teal-500 text-teal-600' :
                        'bg-stone-100 border-2 border-stone-200 text-stone-400'
            }`}>
              {done ? <Check size={12} strokeWidth={3} /> : idx}
            </div>
            <span className={`text-[11px] font-medium hidden sm:block transition-colors duration-300 ${
              current ? 'text-teal-600' : done ? 'text-stone-400' : 'text-stone-300'
            }`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-10 h-px mx-1 rounded-full transition-colors duration-500 ${
                done ? 'bg-teal-400' : 'bg-stone-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Section divider ── */
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-stone-100" />
      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.12em] whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  );
}

/* ── Form field wrapper ── */
function FormField({ icon: Icon, label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
        {Icon && <Icon size={11} className="text-teal-500" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[11px] text-red-500 flex items-center gap-1"
          >
            <X size={9} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Input class ── */
const inputClass =
  'w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 ' +
  'placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 ' +
  'hover:border-stone-300 transition-all duration-200 shadow-sm';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep]                       = useState(1);
  const [verifiedEmail, setVerifiedEmail]     = useState('');
  const [emailInput, setEmailInput]           = useState('');
  const [otpLoading, setOtpLoading]           = useState(false);
  const [otp, setOtp]                         = useState('');
  const [verifyLoading, setVerifyLoading]     = useState(false);
  const [resendCooldown, setResendCooldown]   = useState(0);
  const [loading, setLoading]                 = useState(false);
  const [form, setForm] = useState({
    name: '', businessName: '', phone: '',
    password: '', confirmPassword: '',
    selectedPlan: '', negotiationPrice: '', negotiationReason: '',
    referralCode: '',
  });
  const [referralLookup, setReferralLookup]     = useState(null);
  const [referralChecking, setReferralChecking] = useState(false);
  const debounceRef = useRef(null);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);
    try {
      await authApi.sendRegistrationOtp(emailInput.trim());
      setVerifiedEmail(emailInput.trim());
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      if (err?.message?.toLowerCase().includes('already verified')) {
        setVerifiedEmail(emailInput.trim());
        setStep(3);
      } else {
        setError(err?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setOtpLoading(true);
    try {
      await authApi.sendRegistrationOtp(verifiedEmail);
      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      if (err?.message?.toLowerCase().includes('already verified')) {
        setStep(3);
      } else {
        setError(err?.message || 'Failed to resend OTP.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyLoading(true);
    try {
      await authApi.verifyRegistrationOtp(verifiedEmail, otp.trim());
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Invalid or expired OTP.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'referralCode') {
      setReferralLookup(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const trimmed = value.trim();
      if (trimmed.length >= 3) {
        setReferralChecking(true);
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await authApi.validateReferralCode(trimmed);
            setReferralLookup(res.success && res.salesAgent
              ? { valid: true, salesAgent: res.salesAgent }
              : { valid: false }
            );
          } catch {
            setReferralLookup({ valid: false });
          } finally {
            setReferralChecking(false);
          }
        }, 500);
      } else {
        setReferralChecking(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const body = {
        name:              form.name.trim(),
        businessName:      form.businessName.trim() || undefined,
        email:             verifiedEmail,
        phone:             form.phone.trim(),
        password:          form.password,
        confirmPassword:   form.confirmPassword,
        selectedPlan:      form.selectedPlan,
        negotiationPrice:  form.negotiationPrice ? parseFloat(form.negotiationPrice) : undefined,
        negotiationReason: form.negotiationReason.trim() || undefined,
        referralCode:      (referralLookup?.valid && form.referralCode)
                             ? form.referralCode.trim().toUpperCase() : undefined,
      };
      const res = await authApi.register(body);
      setSuccess(res.message || 'Registration submitted! Awaiting approval.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = (() => {
    const selectedPlan = PLANS.find((p) => p.key === form.selectedPlan);
    const minPrice     = selectedPlan?.minNegotiation ?? 0;
    const entered      = parseFloat(form.negotiationPrice);
    const isTooLow     = form.negotiationPrice !== '' && !isNaN(entered) && entered < minPrice;
    return loading || !form.selectedPlan || !form.name.trim() ||
      !form.phone.trim() || !form.password ||
      (form.confirmPassword && form.password !== form.confirmPassword) ||
      isTooLow;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-teal-50/50 relative overflow-x-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full bg-teal-400/[0.06] blur-[90px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-teal-300/[0.05] blur-[110px]" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400/[0.15]"
            style={{
              width: `${3 + (i % 3)}px`, height: `${3 + (i % 3)}px`,
              top: `${10 + i * 16}%`, left: `${5 + (i * 19) % 90}%`,
              animation: `pulse ${2.5 + i * 0.6}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* ── Layout Shell ── */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ══════════════════════════
            LEFT PANEL — sticky sidebar
        ══════════════════════════ */}
        <motion.aside
          variants={leftVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex flex-col justify-between lg:w-[38%] xl:w-[36%] 2xl:w-[32%] shrink-0 px-10 xl:px-14 2xl:px-20 py-14 lg:sticky lg:top-0 lg:h-screen border-r border-stone-100/80"
        >
          {/* Top content */}
          <div>
            {/* Logo */}
            <motion.div
              animate={{ boxShadow: ['0 0 12px rgba(20,184,166,0.18)', '0 0 32px rgba(20,184,166,0.32)', '0 0 12px rgba(20,184,166,0.18)'] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center mb-10"
            >
              <img src="/image.png" alt="Logo" className="h-8 xl:h-10 w-8 xl:w-10 object-contain" />
            </motion.div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-stone-800 tracking-tight leading-[1.15] mb-4">
              Grow your<br />
              <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">business</span>{' '}with Okiiee
            </h1>
            <p className="text-sm xl:text-base text-stone-500 leading-relaxed mb-10 max-w-xs">
              Register your business and manage everything from one powerful dashboard.
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, type: 'spring', stiffness: 130, damping: 18 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-teal-600" />
                  </div>
                  <span className="text-sm text-stone-600">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom sign-in link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-teal-600 transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Already have an account?
              <ChevronRight size={12} className="text-teal-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.aside>

        {/* ══════════════════════════════════════
            RIGHT PANEL — scrollable form
        ══════════════════════════════════════ */}
        <motion.main
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex items-start justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-10 xl:px-16 2xl:px-24 pb-32"
        >
          <div className="w-full max-w-lg lg:max-w-2xl xl:max-w-3xl">

            {/* ── Mobile header ── */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between mb-5">
                <motion.div
                  animate={{ boxShadow: ['0 0 8px rgba(20,184,166,0.18)', '0 0 22px rgba(20,184,166,0.28)', '0 0 8px rgba(20,184,166,0.18)'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-11 h-11 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center"
                >
                  <img src="/image.png" alt="Logo" className="h-6 w-6 object-contain" />
                </motion.div>
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-600 transition-colors bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <ArrowLeft size={11} /> Sign in
                </Link>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">Create your account</h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">Register your business — pending admin approval</p>
            </div>

            {/* ── Card ── */}
            <div className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 xl:p-10 shadow-xl shadow-stone-200/40 ring-1 ring-stone-100">

              {/* Desktop heading */}
              <div className="hidden lg:block mb-7">
                <h1 className="text-2xl xl:text-3xl font-bold text-stone-800 tracking-tight">Create your account</h1>
                <p className="text-sm text-stone-400 mt-1.5">Fill in the details below to get started</p>
              </div>

              <StepIndicator step={step} />

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div key="error" initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                    <div className="p-3 bg-red-50 border border-red-200/70 rounded-xl text-red-600 text-xs sm:text-sm flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={10} className="text-red-500" />
                      </div>
                      {error}
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div key="success" initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                    <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-xl text-emerald-600 text-xs sm:text-sm flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-emerald-500" />
                      </div>
                      {success}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">

                {/* ── STEP 1: Email ── */}
                {step === 1 && (
                  <motion.form key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} onSubmit={handleSendOtp} className="space-y-5">
                    <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl">
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        Enter your email address and we'll send a one-time verification code to confirm it.
                      </p>
                    </div>
                    <FormField icon={Mail} label="Email Address" required>
                      <input
                        type="email" value={emailInput}
                        onChange={(e) => { setEmailInput(e.target.value); setError(''); }}
                        required placeholder="you@example.com" className={inputClass}
                      />
                    </FormField>
                    <motion.button type="submit" disabled={otpLoading || !emailInput.trim()} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {otpLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><span>Send Verification Code</span><ArrowRight size={15} /></>
                      }
                    </motion.button>
                  </motion.form>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === 2 && (
                  <motion.form key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl">
                      <p className="text-xs sm:text-sm text-stone-600">
                        We sent a 6-digit code to{' '}
                        <span className="font-semibold text-teal-600">{verifiedEmail}</span>
                      </p>
                    </div>
                    <FormField icon={KeyRound} label="Verification Code" required>
                      <input
                        type="text" inputMode="numeric" value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                        required placeholder="000000" autoFocus
                        className={`${inputClass} tracking-[0.4em] text-center text-xl font-bold`}
                      />
                    </FormField>
                    <div className="flex items-center justify-between text-xs">
                      <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }}
                        className="text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1">
                        <ArrowLeft size={11} /> Change email
                      </button>
                      <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || otpLoading}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-500 disabled:text-stone-300 disabled:cursor-not-allowed transition-colors">
                        <RefreshCw size={10} className={otpLoading ? 'animate-spin' : ''} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </button>
                    </div>
                    <motion.button type="submit" disabled={verifyLoading || otp.length < 6} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {verifyLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><span>Verify Email</span><ArrowRight size={15} /></>
                      }
                    </motion.button>
                  </motion.form>
                )}

                {/* ── STEP 3: Full form ── */}
                {step === 3 && (
                  <motion.form key="step3" initial="hidden" animate="visible" variants={staggerContainer} exit={{ opacity: 0, x: -16 }} onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                    {/* Verified email badge */}
                    <motion.div variants={fadeUp} className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm text-emerald-700 font-medium truncate flex-1">{verifiedEmail}</span>
                      <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">Verified</span>
                    </motion.div>

                    {/* Personal info — responsive grid */}
                    <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      <FormField icon={User} label="Full Name" required>
                        <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className={inputClass} />
                      </FormField>
                      <FormField icon={Building2} label="Business Name">
                        <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="My Business" className={inputClass} />
                      </FormField>
                      <FormField icon={Phone} label="Phone Number" required>
                        <input name="phone" value={form.phone} onChange={handleChange} required placeholder="03XX-XXXXXXX" className={inputClass} />
                      </FormField>
                    </motion.div>

                    {/* Security */}
                    <SectionDivider label="Security" />
                    <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField icon={Lock} label="Password" required>
                        <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 8 characters" className={inputClass} />
                      </FormField>
                      <FormField
                        icon={ShieldCheck} label="Confirm Password" required
                        error={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : null}
                      >
                        <input
                          name="confirmPassword" type="password" value={form.confirmPassword}
                          onChange={handleChange} required placeholder="Re-enter password"
                          className={`${inputClass} ${
                            form.confirmPassword && form.password !== form.confirmPassword ? '!border-red-300 !ring-red-200/50' :
                            form.confirmPassword && form.password === form.confirmPassword ? '!border-emerald-300 !ring-emerald-200/50' : ''
                          }`}
                        />
                      </FormField>
                    </motion.div>

                        {/* Plan selection */}
                    <SectionDivider label="Choose Plan" />
                    <motion.div variants={fadeUp}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {PLANS.map((plan) => {
                          const Icon   = plan.icon;
                          const active = form.selectedPlan === plan.key;
                          const isYearly = plan.priceType === 'yearly';
                          const isOnce   = plan.priceType === 'once';

                          // First payment = plan price + first month server + cloud setup
                          const firstPayment = plan.priceNum + SERVER_FEE_MONTHLY + CLOUD_FEE_ADVANCE;
                          // After first payment, only server is recurring
                          const recurringAfter = SERVER_FEE_MONTHLY;

                          const billingLabel = isYearly
                            ? 'Billed yearly'
                            : isOnce
                            ? 'One-time purchase'
                            : 'Billed monthly';

                          return (
                            <motion.button
                              key={plan.key} type="button"
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setForm((p) => ({ ...p, selectedPlan: plan.key, negotiationPrice: '' }))}
                              className={`relative p-4 sm:p-5 rounded-xl text-left transition-all duration-200 border-2 ${
                                active
                                  ? 'bg-gradient-to-b from-teal-50 to-white border-teal-400 shadow-md shadow-teal-100/50'
                                  : 'bg-white border-stone-150 hover:border-teal-200 hover:bg-teal-50/20'
                              }`}
                            >
                              {plan.badge && (
                                <span className={`absolute -top-2.5 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  active ? 'bg-teal-500 text-white shadow-sm' : 'bg-stone-100 text-stone-400'
                                }`}>
                                  {plan.badge}
                                </span>
                              )}

                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
                                active ? 'bg-teal-500 text-white shadow-sm shadow-teal-300/40' : 'bg-stone-100 text-stone-400'
                              }`}>
                                <Icon size={16} />
                              </div>

                              <p className={`font-bold text-sm sm:text-base ${active ? 'text-teal-700' : 'text-stone-700'}`}>{plan.label}</p>

                              {/* Plan price with tooltip */}
                              <div className="flex items-center gap-1.5 mt-1 group/price relative">
                                <p className={`text-[11px] sm:text-xs font-medium ${active ? 'text-teal-500' : 'text-stone-400'}`}>
                                  {plan.price}
                                </p>
                                <div className="relative cursor-help">
                                  <Info size={11} className={`transition-colors ${active ? 'text-teal-400' : 'text-stone-300'} group-hover/price:text-teal-500`} />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2.5 bg-stone-800 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover/price:opacity-100 group-hover/price:visible transition-all duration-200 z-30 shadow-xl pointer-events-none">
                                    <p className="font-bold text-[11px] mb-1.5 text-teal-300">First Payment Breakdown</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-stone-300">{plan.label} Plan</span>
                                        <span className="font-semibold">PKR {plan.priceNum.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-stone-300">Server Fee (1st month)</span>
                                        <span className="font-semibold">PKR {SERVER_FEE_MONTHLY.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-stone-300">Cloud Setup (one-time)</span>
                                        <span className="font-semibold">PKR {CLOUD_FEE_ADVANCE.toLocaleString()}</span>
                                      </div>
                                      <div className="border-t border-stone-600 pt-1 mt-1 flex justify-between font-bold text-white">
                                        <span>First Payment</span>
                                        <span>PKR {firstPayment.toLocaleString()}</span>
                                      </div>
                                      <p className="text-[9px] text-stone-400 mt-1.5 pt-1 border-t border-stone-700">
                                        After that: PKR {recurringAfter.toLocaleString()}/month (server only)
                                      </p>
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                                  </div>
                                </div>
                              </div>

                              {/* Cloud fee badge with tooltip */}
                              <div className="flex items-center gap-1 mt-1.5 group/cloud relative">
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  active ? 'bg-sky-100 text-sky-600' : 'bg-stone-100 text-stone-400'
                                }`}>
                                  <Cloud size={9} />
                                  {plan.cloudFee}
                                </div>
                                <div className="relative cursor-help">
                                  <Info size={10} className={`transition-colors ${active ? 'text-sky-400' : 'text-stone-300'} group-hover/cloud:text-sky-500`} />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-stone-800 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover/cloud:opacity-100 group-hover/cloud:visible transition-all duration-200 z-30 shadow-xl pointer-events-none">
                                    <p className="font-bold text-[11px] mb-1 text-sky-300">One-time Cloud Setup</p>
                                    <p className="text-stone-300">PKR {CLOUD_FEE_ADVANCE.toLocaleString()} — charged only once at signup for cloud hosting setup, DNS & SSL.</p>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                                  </div>
                                </div>
                              </div>

                              {/* First payment summary — only when active */}
                              {active && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-3 pt-3 border-t border-teal-200/60"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">First Payment</span>
                                    <span className="text-sm font-extrabold text-teal-700">
                                      PKR {firstPayment.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-stone-400 mt-0.5">
                                    (Plan PKR {plan.priceNum.toLocaleString()} + Server PKR {SERVER_FEE_MONTHLY.toLocaleString()} + Cloud PKR {CLOUD_FEE_ADVANCE.toLocaleString()})
                                  </p>
                                  <p className="text-[9px] text-teal-500 font-medium mt-1">
                                    Then PKR {recurringAfter.toLocaleString()}/month — server only
                                  </p>
                                </motion.div>
                              )}

                              {active && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
                                >
                                  <Check size={10} className="text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Detailed price breakdown card */}
                      <AnimatePresence>
                        {form.selectedPlan && (() => {
                          const sp = PLANS.find(p => p.key === form.selectedPlan);
                          const firstPayment = sp.priceNum + SERVER_FEE_MONTHLY + CLOUD_FEE_ADVANCE;
                          const recurringAfter = SERVER_FEE_MONTHLY;

                          const planBillingSub = sp.priceType === 'yearly'
                            ? 'Billed yearly'
                            : sp.priceType === 'once'
                            ? 'One-time purchase'
                            : 'Billed monthly';

                          return (
                            <motion.div
                              initial={{ opacity: 0, y: -8, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden mt-4"
                            >
                              <div className="relative p-4 sm:p-5 bg-gradient-to-br from-stone-50 via-sky-50/40 to-cyan-50/30 border border-stone-200/80 rounded-xl overflow-hidden">
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-teal-200/20 blur-2xl pointer-events-none" />
                                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-sky-200/20 blur-2xl pointer-events-none" />

                                <div className="relative">
                                  {/* Header */}
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm shadow-teal-200/50">
                                      <Receipt size={15} className="text-white" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-stone-700">Complete Price Breakdown</p>
                                      <p className="text-[10px] text-stone-400">For {sp.label} Plan</p>
                                    </div>
                                  </div>

                                  {/* Price rows */}
                                  <div className="space-y-2.5">
                                    {/* Selected Plan */}
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-100">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                                          <sp.icon size={13} className="text-teal-500" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-stone-700">{sp.label} Plan</p>
                                          <p className="text-[10px] text-stone-400">{planBillingSub}</p>
                                        </div>
                                      </div>
                                      <p className="text-sm font-bold text-stone-800">PKR {sp.priceNum.toLocaleString()}</p>
                                    </div>

                                    {/* Server Fee */}
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-100">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-violet-50 flex items-center justify-center">
                                          <Server size={13} className="text-violet-500" />
                                        </div>
                                        <div className="group/servertip relative">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-semibold text-stone-700">Server Fee</p>
                                            <Info size={10} className="text-stone-300 group-hover/servertip:text-violet-500 transition-colors cursor-help" />
                                          </div>
                                          <p className="text-[10px] text-stone-400">Monthly — Always included</p>
                                          <div className="absolute bottom-full left-0 mb-2 w-44 px-3 py-2 bg-stone-800 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover/servertip:opacity-100 group-hover/servertip:visible transition-all duration-200 z-30 shadow-xl pointer-events-none">
                                            <p className="font-bold text-violet-300 text-[11px] mb-1">Server Fee</p>
                                            <p className="text-stone-300">PKR 3,000/month covers dedicated server resources, uptime monitoring & maintenance.</p>
                                            <div className="absolute bottom-0 left-4 -translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                                          </div>
                                        </div>
                                      </div>
                                      <p className="text-sm font-bold text-stone-800">PKR {SERVER_FEE_MONTHLY.toLocaleString()}</p>
                                    </div>

                                    {/* Cloud Setup Fee */}
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-100">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-sky-50 flex items-center justify-center">
                                          <Cloud size={13} className="text-sky-500" />
                                        </div>
                                        <div className="group/cloudtip relative">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-semibold text-stone-700">Cloud Setup Fee</p>
                                            <Info size={10} className="text-stone-300 group-hover/cloudtip:text-sky-500 transition-colors cursor-help" />
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-[10px] text-stone-400">One-time advance</p>
                                            <span className="text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-px rounded-full">ONE-TIME</span>
                                          </div>
                                          <div className="absolute bottom-full left-0 mb-2 w-48 px-3 py-2 bg-stone-800 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover/cloudtip:opacity-100 group-hover/cloudtip:visible transition-all duration-200 z-30 shadow-xl pointer-events-none">
                                            <p className="font-bold text-sky-300 text-[11px] mb-1">Cloud Setup Fee</p>
                                            <p className="text-stone-300">PKR 15,000 charged <strong className="text-white">only once</strong> at signup. Covers cloud infrastructure setup, DNS configuration & SSL provisioning.</p>
                                            <div className="absolute bottom-0 left-4 -translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                                          </div>
                                        </div>
                                      </div>
                                      <p className="text-sm font-bold text-stone-800">PKR {CLOUD_FEE_ADVANCE.toLocaleString()}</p>
                                    </div>
                                  </div>

                                  {/* Divider */}
                                  <div className="border-t border-dashed border-stone-200 my-3" />

                                  {/* Totals */}
                                  <div className="space-y-2">
                                    {/* Recurring after first payment */}
                                    <div className="flex items-center justify-between px-1">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-[11px] font-semibold text-stone-500">
                                          {sp.priceType === 'once'
                                            ? 'After First Payment (Recurring)'
                                            : sp.priceType === 'yearly'
                                            ? 'After First Year (Recurring)'
                                            : 'Monthly Total (Recurring)'}
                                        </p>
                                        <div className="relative group/monthtip cursor-help">
                                          <Info size={10} className="text-stone-300 group-hover/monthtip:text-teal-500 transition-colors" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 px-3 py-2 bg-stone-800 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover/monthtip:opacity-100 group-hover/monthtip:visible transition-all duration-200 z-30 shadow-xl pointer-events-none">
                                            <p className="text-stone-300">
                                              {sp.priceType === 'once' || sp.priceType === 'yearly'
                                                ? `Only server fee PKR ${SERVER_FEE_MONTHLY.toLocaleString()}/month — plan already paid.`
                                                : `Plan PKR ${sp.priceNum.toLocaleString()} + Server PKR ${SERVER_FEE_MONTHLY.toLocaleString()} = PKR ${(sp.priceNum + SERVER_FEE_MONTHLY).toLocaleString()}/month`}
                                            </p>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                                          </div>
                                        </div>
                                      </div>
                                      <p className="text-base font-extrabold text-teal-600">
                                        PKR {recurringAfter.toLocaleString()}<span className="text-[10px] font-medium text-stone-400">/mo</span>
                                      </p>
                                    </div>

                                    {/* First payment total */}
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Wallet size={14} className="text-white/80" />
                                        <div>
                                          <p className="text-[11px] font-bold text-white/90">
                                            {sp.priceType === 'yearly' ? 'First Year Payment' : 'First Payment'}
                                          </p>
                                          <p className="text-[9px] text-white/60">
                                            {sp.priceType === 'yearly'
                                              ? 'Yearly plan + Server + Cloud setup'
                                              : 'Plan + Server + Cloud setup'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-lg font-extrabold text-white">PKR {firstPayment.toLocaleString()}</p>
                                        <p className="text-[9px] text-white/50">Then PKR {recurringAfter.toLocaleString()}/mo</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </motion.div>

                    {/* Optional / Negotiation */}
                    <SectionDivider label="Optional" />
                    <motion.div variants={fadeUp}>
                      {(() => {
                        const selectedPlan = PLANS.find((p) => p.key === form.selectedPlan);
                        const minPrice     = selectedPlan?.minNegotiation ?? 0;
                        const entered      = parseFloat(form.negotiationPrice);
                        const isTooLow     = form.negotiationPrice !== '' && !isNaN(entered) && entered < minPrice;
                        return (
                          <FormField icon={Sparkles} label="Negotiation Price (PKR)">
                            <input
                              name="negotiationPrice" type="number" min="0"
                              value={form.negotiationPrice} onChange={handleChange}
                              placeholder={selectedPlan ? ` enter your offer` : 'Select a plan first'}
                              disabled={!form.selectedPlan}
                              className={`${inputClass} ${
                                isTooLow
                                  ? '!border-red-300 !ring-red-200/50'
                                  : form.negotiationPrice && !isTooLow
                                  ? '!border-emerald-300 !ring-emerald-200/50'
                                  : ''
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            <AnimatePresence>
                              {isTooLow && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6, height: 0 }}
                                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden mt-2"
                                >
                                  {/* <div className="p-3 bg-red-50 border border-red-200/70 rounded-xl"> */}
                                    {/* <p className="text-[11px] sm:text-xs text-red-600 font-medium flex items-center gap-1.5 mb-1">
                                      <X size={11} className="text-red-500 shrink-0" />
                                      This amount is below our minimum — your request will be rejected automatically.
                                    </p>
                                    <p className="text-[11px] text-stone-500 leading-relaxed">
                                      To negotiate a price below{' '}
                                      <span className="font-semibold text-stone-700">PKR {minPrice.toLocaleString()}</span>,
                                      contact us directly and we'll discuss the final price:
                                    </p>
                                    <a
                                      href="https://wa.me/923057903867"
                                      target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-teal-600 hover:text-teal-500 transition-colors"
                                    >
                                      <Headphones size={11} />
                                      {SUPPORT_NUMBER}
                                    </a>
                                  </div> */}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FormField>
                        );
                      })()}
                    </motion.div>

                    {/* Referral */}
                    <motion.div variants={fadeUp}>
                      <FormField icon={CircleDot} label="Referral Code">
                        <div className="relative">
                          <input
                            name="referralCode" value={form.referralCode} onChange={handleChange}
                            placeholder="e.g. REF-SA001"
                            className={`${inputClass} pr-10 uppercase ${
                              referralLookup?.valid === true  ? '!border-emerald-300 !ring-emerald-200/50' :
                              referralLookup?.valid === false ? '!border-red-300 !ring-red-200/50' : ''
                            }`}
                          />
                          {referralChecking && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
                            </span>
                          )}
                          {!referralChecking && referralLookup?.valid === true  && <Check size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />}
                          {!referralChecking && referralLookup?.valid === false && <X    size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400" />}
                        </div>
                      </FormField>

                      <AnimatePresence>
                        {referralLookup?.valid === true && referralLookup.salesAgent && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {referralLookup.salesAgent.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-semibold text-emerald-700">{referralLookup.salesAgent.name}</p>
                                <p className="text-[10px] text-stone-500 mt-0.5">
                                  <span className="font-mono font-bold text-orange-500">{referralLookup.salesAgent.referralCode}</span>
                                  {' · '}
                                  <span className={referralLookup.salesAgent.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}>
                                    {referralLookup.salesAgent.status}
                                  </span>
                                  {referralLookup.salesAgent.phone && (
                                    <>{' · '}<span className="text-stone-400">{referralLookup.salesAgent.phone}</span></>
                                  )}
                                </p>
                                <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                                  Contact your agent for pricing & plan details.
                                </p>
                              </div>
                              <Check size={13} className="text-emerald-500 shrink-0" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                       {referralLookup?.valid === false && (
                        <div className="mt-2 p-2.5 bg-red-50 border border-red-200/60 rounded-xl flex items-start gap-2">
                          <X size={11} className="text-red-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-red-600 leading-relaxed">
                            Code not found — registration will proceed without referral.
                            For help, contact us at{' '}
                            <a href="https://wa.me/923057903867" target="_blank" rel="noopener noreferrer"
                              className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
                              {SUPPORT_NUMBER}
                            </a>
                          </p>
                        </div>
                      )}
                    </motion.div>

                    {/* Support card */}
                    <motion.div variants={fadeUp}>
                      <div className="p-3.5 bg-teal-50/60 border border-teal-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                            <Headphones size={15} className="text-teal-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Need Help?</p>
                            <p className="text-xs sm:text-sm font-bold text-teal-700">{SUPPORT_NUMBER}</p>
                          </div>
                          <a
                            href={`https://wa.me/${SUPPORT_NUMBER.replace(/\s/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 rounded-lg text-[10px] sm:text-xs font-semibold text-white transition-colors shrink-0 shadow-sm shadow-teal-200"
                          >
                            Chat
                          </a>
                        </div>
                      </div>
                    </motion.div>

                  </motion.form>
                )}
              </AnimatePresence>

              {/* Mobile sign-in link */}
              <div className="lg:hidden text-center mt-6 pt-5 border-t border-stone-100">
                <p className="text-xs text-stone-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-500 transition-colors inline-flex items-center gap-0.5">
                    Sign in <ArrowRight size={11} />
                  </Link>
                </p>
              </div>
            </div>

            {/* Desktop sign-in link */}
            <div className="hidden lg:block text-center mt-5">
              <p className="text-sm text-stone-400">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-500 transition-colors inline-flex items-center gap-1">
                  Sign in <ArrowRight size={13} />
                </Link>
              </p>
            </div>
          </div>
        </motion.main>
      </div>

      {/* ══════════════════════════════════════
          Floating submit bar — Step 3 only
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {step === 3 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 130, damping: 22 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:py-4"
          >
            <div className="max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto">
              <div className="bg-white/92 backdrop-blur-xl border border-white/80 shadow-2xl shadow-stone-200/50 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 ring-1 ring-stone-100/60">
                <div className="hidden sm:block flex-1">
                  <p className="text-sm font-semibold text-stone-700">Ready to submit?</p>
                  <p className="text-xs text-stone-400 mt-0.5">Review your details then submit for admin approval.</p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => {
                    const f = document.querySelector('form');
                    if (f) f.requestSubmit();
                  }}
                  disabled={submitDisabled}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto sm:min-w-[220px] py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Submit Registration</span><ArrowRight size={15} /></>
                  }
                </motion.button>
              </div>
              <p className="text-center text-[10px] text-stone-400 mt-2 hidden sm:block">
                By registering, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}