 import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { purchaseApi } from '../../../shared/api/staff.js';
import { useAuth } from '../../../shared/utils/AuthContext.jsx';
import { Spinner, Alert, Badge } from '../../../shared/components/ui.jsx';
import { motion } from 'framer-motion';
import { Package, Boxes, Warehouse, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useModulePrefix } from '../../../shared/utils/useModulePrefix.js';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 20, delay: i * 0.07 },
  }),
};

const STATUS_COLOR = { Available: 'green', Dispatched: 'yellow', Sold: 'indigo' };

export default function DashboardPage() {
  const { user } = useAuth();
  const base = useModulePrefix();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    purchaseApi.getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const profile = data?.profile || user;
  const totalPurchases = data?.totalPurchases ?? 0;
  const totalBulkPurchases = data?.totalBulkPurchases ?? 0;
  const availableStockCount = data?.availableStockCount ?? 0;
  const recentPurchases = data?.recentPurchases || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Purchase Dashboard</h2>
        </div>
        <p className="text-sm text-gray-500 ml-7">Welcome, {profile?.name}</p>
      </motion.div>

      {loading ? <Spinner /> : error ? <Alert message={error} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                title: 'Single Phones', value: totalPurchases, to: `${base}/purchase/phones`,
                icon: Package, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20', index: 0,
              },
              {
                title: 'Bulk Purchases', value: totalBulkPurchases, to: `${base}/purchase/bulk`,
                icon: Boxes, gradient: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-500/20', index: 1,
              },
              {
                title: 'Available Stock', value: availableStockCount, to: `${base}/purchase/stock`,
                icon: Warehouse, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20', index: 2,
              },
            ].map(({ title, value, icon: Icon, gradient, shadow, index, to }) => (
              <motion.div
                key={title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-gray-200/50"
              >
                <Link to={to} className="block">
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} ${shadow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Icon size={16} className="text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mb-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package size={14} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-gray-700">Recent Phone Purchases</h3>
            </div>
            {recentPurchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package size={30} className="mb-2 opacity-30" />
                <p className="text-sm">No purchases yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentPurchases.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {(item.companyName?.[0] || '#').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.companyName} {item.modelName} <span className="text-gray-400 font-normal">· {item.imei1}</span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={9} />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    {item.purchasePrice !== undefined && (
                      <span className="text-xs font-semibold text-gray-600 shrink-0">Rs {item.purchasePrice}</span>
                    )}
                    <Badge color={STATUS_COLOR[item.status] || 'gray'}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
