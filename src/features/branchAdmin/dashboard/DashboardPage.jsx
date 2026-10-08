 'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Store, MapPin, Phone, Search, DollarSign, Users, KeyRound,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, ChevronDown, MoreHorizontal,
  Package, RefreshCw, FileWarning, MessageCircle, ArrowUpRight, ArrowDownRight,
  Bell, Wallet,
} from 'lucide-react';

// ---- Dummy / placeholder data purely to match the reference dashboard's
// visual layout. Swap for real endpoints whenever they exist. ----
const HERO_STATS = [
  { icon: DollarSign, label: 'Total Sales', value: '$88,888', delta: '+24%', up: true, primary: true },
  { icon: Store, label: 'Total Retailers', value: '722', delta: '+12%', up: true },
  { icon: Users, label: 'Prime Faculty', value: '563', delta: '-8%', up: false },
  { icon: KeyRound, label: 'Rented Customers', value: '4,363', delta: '+30%', up: true },
];

// New sales data shaped like the reference screenshot: wavy dips and
// climbs, ending on a rise toward the top-right where the "finger" points.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const SERIES_A = [900, 1450, 1000, 1700, 1250, 1500, 2350]; // darker teal (front)
const SERIES_B = [1150, 1000, 1500, 1150, 1850, 1300, 1950]; // lighter teal (back)
const Y_MAX = 2500;
const Y_TICKS = [0, 500, 1000, 1500, 2000, 2500];

const INVENTORY_LEVELS = [
  { label: 'Prod', value: 62 }, { label: 'Feb', value: 88 }, { label: 'Essay', value: 40 },
  { label: 'Rate', value: 70 }, { label: '', value: 55 },
];

const STORE_CATEGORIES = [
  { label: 'Electronics', value: 40, color: '#3B95A4' },
  { label: 'Fashion', value: 33, color: '#F0A94E' },
  { label: 'Grocery', value: 27, color: '#E5E9EA' },
];

const RECENT_ORDERS = [
  { label: 'Compliance', count: '1,283', pct: 62, color: 'bg-[#3B95A4]' },
  { label: 'Pending', count: '682', pct: 27, color: 'bg-amber-400' },
  { label: 'Available', count: '398', pct: 27, color: 'bg-rose-400' },
  { label: 'Assets', count: '215', pct: 11, color: 'bg-gray-300' },
];

const ACTIVITY_FEED = [
  { icon: Package, tone: 'teal', title: 'Bulk job', sub: 'Data upload wrapping up shortly' },
  { icon: RefreshCw, tone: 'rose', title: 'Cloud sync failed', sub: 'Review your last sync errors' },
  { icon: FileWarning, tone: 'amber', title: 'App update', sub: 'A new update is ready to install' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 20, delay: i * 0.06 },
  }),
};

function HeroCard({ icon: Icon, label, value, delta, up, primary }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-4 ${primary ? 'bg-[#3B95A4] text-white' : 'bg-white border border-gray-100 text-gray-900'}`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primary ? 'bg-white/15' : 'bg-[#E8F4F6] text-[#3B95A4]'}`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <MoreHorizontal size={16} className={primary ? 'text-white/60' : 'text-gray-300'} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${primary ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        <p className={`text-xs mt-0.5 ${primary ? 'text-white/75' : 'text-gray-400'}`}>{label}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${primary ? 'text-white/90' : up ? 'text-emerald-500' : 'text-rose-500'}`}>
        {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {delta} this month
      </div>
    </div>
  );
}

// ---- Updated chart: smooth wavy lines, visible dot markers at every
// point, and a highlighted last point (matching the reference image). ----
function buildPath(values, w, h, padX, padY) {
  const stepX = (w - padX * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = h - padY - (v / Y_MAX) * (h - padY * 2);
    return [x, y];
  });

  const d = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const p0 = arr[i - 2] || arr[i - 1];
    const p1 = arr[i - 1];
    const p2 = p;
    const p3 = arr[i + 1] || p;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    return `${acc} C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }, '');

  return { d, pts };
}

function AreaChart() {
  const w = 760;
  const h = 220;
  const padX = 18;
  const padY = 16;

  const { d: lineA, pts: ptsA } = buildPath(SERIES_A, w, h, padX, padY);
  const { d: lineB, pts: ptsB } = buildPath(SERIES_B, w, h, padX, padY);

  const areaA = `${lineA} L${w - padX},${h - padY} L${padX},${h - padY} Z`;
  const areaB = `${lineB} L${w - padX},${h - padY} L${padX},${h - padY} Z`;

  const lastA = ptsA[ptsA.length - 1];

  return (
    <div className="flex gap-3">
      <div
        className="flex flex-col justify-between text-[11px] text-gray-400 py-2 shrink-0"
        style={{ height: h }}
      >
        {[...Y_TICKS].reverse().map((t) => (
          <span key={t}>{t.toLocaleString()}</span>
        ))}
      </div>

      <div className="flex-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
          <defs>
            <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B95A4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3B95A4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fillB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FCAD3" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8FCAD3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Y_TICKS.map((t) => {
            const y = h - padY - (t / Y_MAX) * (h - padY * 2);
            return (
              <line key={t} x1={padX} x2={w - padX} y1={y} y2={y} stroke="#EEF2F3" strokeWidth="1" />
            );
          })}

          <path d={areaB} fill="url(#fillB)" />
          <path d={lineB} fill="none" stroke="#8FCAD3" strokeWidth="2.5" strokeLinecap="round" />
          {ptsB.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="white" stroke="#8FCAD3" strokeWidth="2" />
          ))}

          <path d={areaA} fill="url(#fillA)" />
          <path d={lineA} fill="none" stroke="#2F7986" strokeWidth="3" strokeLinecap="round" />
          {ptsA.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={4.5} fill="white" stroke="#2F7986" strokeWidth="2.5" />
          ))}

          <circle cx={lastA[0]} cy={lastA[1]} r={7} fill="#2F7986" opacity="0.18" />
          <circle cx={lastA[0]} cy={lastA[1]} r={5} fill="#2F7986" stroke="white" strokeWidth="2" />
        </svg>

        <div className="flex justify-between px-1 mt-1">
          {MONTHS.map((m) => (
            <span key={m} className="text-[11px] text-gray-400">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Donut({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cumulative = 0;
  const stops = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-28 h-28 rounded-full grid place-items-center shrink-0"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="w-[72px] h-[72px] rounded-full bg-white grid place-items-center">
          <span className="text-base font-bold text-gray-800">{segments[0].value}%</span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="flex-1 truncate">{seg.label}</span>
            <span className="font-semibold text-gray-800">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, tone, title, sub }) {
  const tones = {
    teal: 'bg-[#E8F4F6] text-[#3B95A4]',
    amber: 'bg-amber-50 text-amber-500',
    rose: 'bg-rose-50 text-rose-500',
  };
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={14} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [chartRange, setChartRange] = useState('week');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
        </div>
<div className="flex items-center gap-2">
  <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm">
    <button className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
      <ChevronDown size={12} /> Collapse
    </button>
    <button className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-full bg-[#3B95A4] text-white shadow-sm">
      <ChevronRight size={12} /> Extend
    </button>
  </div>
</div>
       
       </motion.div>

      {/* Hero stat cards */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {HERO_STATS.map((s) => (
          <HeroCard key={s.label} {...s} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Reports */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Sales Reports</h3>
            <div className="flex items-center gap-1 bg-[#F4F8F9] rounded-full p-1">
              <button
                onClick={() => setChartRange('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${chartRange === 'week' ? 'bg-[#3B95A4] text-white' : 'text-gray-500'}`}
              >
                Mains
              </button>
              <button
                onClick={() => setChartRange('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${chartRange === 'month' ? 'bg-[#3B95A4] text-white' : 'text-gray-500'}`}
              >
                Snyg
              </button>
            </div>
          </div>
          <AreaChart />
          <p className="text-[11px] text-gray-300 mt-3">Sample data — connect a real sales endpoint to replace this.</p>
        </motion.div>

            {/* Inventory */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Inventory</h3>
                <button className="text-xs font-semibold text-white bg-[#3B95A4] px-3 py-1.5 rounded-full">Find now</button>
              </div>
              <div className="flex-1 flex items-end gap-2 h-32">
                {INVENTORY_LEVELS.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className={`w-full rounded-t-md ${i % 2 === 0 ? 'bg-[#3B95A4]' : 'bg-[#C3E1E6]'}`}
                      style={{ height: `${d.value}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-4">
                <div>
                  <p className="text-[11px] text-gray-400">Total Inventory</p>
                  <p className="text-sm font-bold text-gray-800">4,573.4K</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">Low Stock</p>
                  <p className="text-sm font-bold text-gray-800">98</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Store category donut */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Store category</h3>
              <Donut segments={STORE_CATEGORIES} />
            </motion.div>

            {/* Recent orders */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={5}
              className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Recent orders</h3>
                <button className="text-gray-300"><ChevronRight size={16} /></button>
              </div>
              <div className="space-y-4">
                {RECENT_ORDERS.map((o) => (
                  <div key={o.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 shrink-0 truncate">{o.label}</span>
                    <span className="text-xs text-gray-400 w-14 shrink-0">{o.count}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${o.color}`} style={{ width: `${o.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right shrink-0">{o.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Support / balance strip */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={6}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 mt-6"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">Current balance</p>
              <p className="text-xs text-gray-400">Reach out to your team for a payout</p>
            </div>
            <button className="text-xs font-semibold text-white bg-[#3B95A4] px-4 py-2 rounded-full shrink-0">View</button>
          </motion.div>

    </div>
  );
}