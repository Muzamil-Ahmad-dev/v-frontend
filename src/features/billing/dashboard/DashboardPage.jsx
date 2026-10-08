import { useState, useEffect } from 'react';
import { billingApi } from '../../../shared/api/staff.js';
import { useAuth } from '../../../shared/utils/AuthContext.jsx';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion } from 'framer-motion';
import { FileText, Building2, Sparkles, Calendar } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 20, delay: i * 0.07 },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    billingApi.getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const profile = data?.profile || user;
  const totalInvoices = data?.totalInvoices ?? 0;
  const recentInvoices = data?.recentInvoices || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-sky-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Billing Dashboard</h2>
        </div>
        <p className="text-sm text-gray-500 ml-7">Welcome, {profile?.name}</p>
      </motion.div>

      {loading ? <Spinner /> : error ? <Alert message={error} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              {
                title: 'Total Invoices', value: totalInvoices,
                icon: FileText, gradient: 'from-sky-400 to-cyan-500', shadow: 'shadow-sky-500/20', index: 0,
              },
              {
                title: 'Branch ID', value: profile?.branchId || data?.branchId || '—',
                icon: Building2, gradient: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-500/20', index: 1,
              },
            ].map(({ title, value, icon: Icon, gradient, shadow, index }) => (
              <motion.div
                key={title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 cursor-default overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-gray-200/50"
              >
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} ${shadow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon size={16} className="text-white" strokeWidth={2.2} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Invoices */}
          {recentInvoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText size={14} className="text-sky-400" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Invoices</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {recentInvoices.map((inv) => (
                  <div key={inv._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      #
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{inv._id}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={9} />
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}