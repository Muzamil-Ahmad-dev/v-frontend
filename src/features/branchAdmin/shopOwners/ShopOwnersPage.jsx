import { useState, useEffect, useCallback } from 'react';
import { branchAdminApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Badge, Pagination } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Users2, Sparkles, Inbox, Mail, Phone, Calendar, Search } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 } }),
};

const STATUS_COLOR = { ACTIVE: 'green', PENDING: 'yellow', DEACTIVATED: 'gray' };

export default function ShopOwnersPage() {
  const [shopOwners, setShopOwners] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchItems = useCallback((page = 1) => {
    setLoading(true);
    branchAdminApi.listShopOwners({ page, limit: 20 })
      .then((res) => {
        const list = res.data?.shopOwners || res.data || [];
        setShopOwners(list);
        setPagination({ page, pages: res.data?.pagination?.pages || 1 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchItems(1); }, [fetchItems]);

  const filtered = shopOwners.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [o.name, o.email, o.businessName].some((v) => v?.toLowerCase().includes(s));
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={16} className="text-indigo-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Shop Owners</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Shop owners registered under your branch(es)</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
            className="pl-8 pr-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-48"
          />
        </div>
      </motion.div>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Business</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-14">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                          <Inbox size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No shop owners yet</p>
                      </div>
                    </td>
                  </tr>
                )}
                <AnimatePresence>
                  {filtered.map((o, i) => (
                    <motion.tr key={o._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                      className="border-b border-gray-100 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                            {o.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{o.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{o.businessName || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Mail size={10} className="text-gray-300" />{o.email}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={10} className="text-gray-300" />{o.phone || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{o.planType || '—'}</td>
                      <td className="px-5 py-3.5"><Badge color={STATUS_COLOR[o.status] || 'gray'}>{o.status}</Badge></td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar size={10} className="text-gray-300" />{new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <div className="mt-4">
        <Pagination page={pagination.page} pages={pagination.pages} onChange={fetchItems} />
      </div>
    </div>
  );
}
