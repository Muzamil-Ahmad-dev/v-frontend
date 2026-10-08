 import { useState, useEffect, useCallback } from 'react';
import { purchaseStockApi } from '../../../shared/api/staff.js';
import { Spinner, Alert, Badge } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Warehouse, Search, Smartphone, Boxes, LayoutList, ScanLine, X } from 'lucide-react';

const TABS = [
  { key: 'stock', label: 'Available Stock', icon: LayoutList },
  { key: 'summary', label: 'Summary', icon: Boxes },
  { key: 'imei', label: 'IMEI Lookup', icon: ScanLine },
];

function StatusBadge({ status }) {
  const color = status === 'Available' ? 'green' : status === 'Dispatched' ? 'yellow' : status === 'Sold' ? 'indigo' : 'gray';
  return <Badge color={color}>{status}</Badge>;
}

function PhoneRow({ phone, source }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
        <Smartphone size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {phone.companyName} {phone.modelName}
        </p>
        <p className="text-xs text-gray-400 truncate">
          IMEI: {phone.imei1}{phone.imei2 ? ` / ${phone.imei2}` : ''}
          {phone.ramMemory ? ` · ${phone.ramMemory}` : ''}
          {phone.color ? ` · ${phone.color}` : ''}
        </p>
      </div>
      {source === 'bulk' && phone.simOption && (
        <span className="hidden sm:inline text-xs text-gray-400 shrink-0">{phone.simOption}</span>
      )}
      {(phone.priceOfOne ?? phone.purchasePrice) !== undefined && (
        <span className="text-xs font-semibold text-amber-600 shrink-0">
          Rs {phone.priceOfOne ?? phone.purchasePrice}
        </span>
      )}
      <Badge color={source === 'bulk' ? 'indigo' : 'amber'}>{source === 'bulk' ? 'Bulk' : 'Single'}</Badge>
    </motion.div>
  );
}

export default function PurchaseStockPage() {
  const [tab, setTab] = useState('stock');

  // Available stock tab
  const [companyName, setCompanyName] = useState('');
  const [modelName, setModelName] = useState('');
  const [stock, setStock] = useState({ singlePhones: [], bulkPhones: [], totalAvailable: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summary tab
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // IMEI lookup tab
  const [imei, setImei] = useState('');
  const [imeiResult, setImeiResult] = useState(null);
  const [imeiLoading, setImeiLoading] = useState(false);
  const [imeiError, setImeiError] = useState('');

  const fetchStock = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (companyName) params.companyName = companyName;
    if (modelName) params.modelName = modelName;
    purchaseStockApi.getAvailable(params)
      .then((res) => setStock(res.data || { singlePhones: [], bulkPhones: [], totalAvailable: 0 }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [companyName, modelName]);

  useEffect(() => {
    if (tab !== 'stock') return;
    const t = setTimeout(fetchStock, 300); // debounce search
    return () => clearTimeout(t);
  }, [tab, fetchStock]);

  useEffect(() => {
    if (tab !== 'summary') return;
    setSummaryLoading(true);
    setSummaryError('');
    purchaseStockApi.getSummary()
      .then((res) => setSummary(res.data || []))
      .catch((err) => setSummaryError(err.message))
      .finally(() => setSummaryLoading(false));
  }, [tab]);

  const handleImeiSearch = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return;
    setImeiLoading(true);
    setImeiError('');
    setImeiResult(null);
    try {
      const res = await purchaseStockApi.getByImei(imei.trim());
      setImeiResult(res.data);
    } catch (err) {
      setImeiError(err.message);
    } finally {
      setImeiLoading(false);
    }
  };

  const combinedRows = [
    ...stock.singlePhones.map((p) => ({ ...p, __source: 'single' })),
    ...stock.bulkPhones.map((p) => ({ ...p, __source: 'bulk' })),
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Warehouse size={20} className="text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Purchase Stock</h2>
          {tab === 'stock' && (
            <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {stock.totalAvailable}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-white/70 border border-gray-200/60 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === key ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === key && (
              <motion.div
                layoutId="stockTab"
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              />
            )}
            <Icon size={13} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Available Stock */}
      {tab === 'stock' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Filter by company (e.g. Samsung)"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white/80"
              />
            </div>
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={modelName} onChange={(e) => setModelName(e.target.value)}
                placeholder="Filter by model (e.g. Galaxy S23)"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white/80"
              />
            </div>
          </div>

          {error && <Alert message={error} />}

          {loading ? <Spinner /> : (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden">
              {combinedRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Warehouse size={36} className="mb-3 opacity-30" />
                  <p className="text-sm">No available stock found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {combinedRows.map((p) => (
                    <PhoneRow key={`${p.__source}-${p._id || p.imei1}`} phone={p} source={p.__source} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Summary */}
      {tab === 'summary' && (
        summaryLoading ? <Spinner /> : summaryError ? <Alert message={summaryError} /> : (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden">
            {summary.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Boxes size={36} className="mb-3 opacity-30" />
                <p className="text-sm">No stock summary available.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {summary.map((row, i) => (
                  <motion.div
                    key={`${row.companyName}-${row.modelName}`}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {(row.companyName?.[0] || '#').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{row.companyName} {row.modelName}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                      {row.availableCount} available
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* IMEI Lookup */}
      {tab === 'imei' && (
        <div>
          <form onSubmit={handleImeiSearch} className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <ScanLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={imei} onChange={(e) => setImei(e.target.value)}
                placeholder="Enter IMEI number"
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white/80"
              />
              {imei && (
                <button type="button" onClick={() => { setImei(''); setImeiResult(null); setImeiError(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit" disabled={imeiLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60"
            >
              {imeiLoading ? 'Searching…' : 'Search'}
            </motion.button>
          </form>

          {imeiError && <Alert message={imeiError} />}

          <AnimatePresence>
            {imeiResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {imeiResult.singlePhone && (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge color="amber">Single Purchase</Badge>
                      <StatusBadge status={imeiResult.singlePhone.status} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {imeiResult.singlePhone.companyName} {imeiResult.singlePhone.modelName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      IMEI1: {imeiResult.singlePhone.imei1} {imeiResult.singlePhone.imei2 && `· IMEI2: ${imeiResult.singlePhone.imei2}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {imeiResult.singlePhone.ramMemory} · {imeiResult.singlePhone.color} · Rs {imeiResult.singlePhone.purchasePrice}
                    </p>
                  </div>
                )}
                {imeiResult.bulkPhone && (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge color="indigo">Bulk Purchase</Badge>
                      <StatusBadge status={imeiResult.bulkPhone.status} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {imeiResult.bulkPhone.companyName} {imeiResult.bulkPhone.modelName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      IMEI1: {imeiResult.bulkPhone.imei1} {imeiResult.bulkPhone.imei2 && `· IMEI2: ${imeiResult.bulkPhone.imei2}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {imeiResult.bulkPhone.ramMemory} · {imeiResult.bulkPhone.simOption} · {imeiResult.bulkPhone.color} · Rs {imeiResult.bulkPhone.priceOfOne}
                    </p>
                  </div>
                )}
                {!imeiResult.singlePhone && !imeiResult.bulkPhone && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <ScanLine size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No phone found with that IMEI.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
