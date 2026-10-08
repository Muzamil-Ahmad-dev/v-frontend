import { useState, useEffect, useCallback } from 'react';
import { branchAdminNotificationsApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Sparkles, Inbox, Trash2, CheckCircle2, Info, AlertTriangle, XCircle,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 } }),
};

const TYPE_ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };
const TYPE_COLOR = {
  info: 'bg-sky-50 text-sky-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
};

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const fetchItems = useCallback(() => {
    setLoading(true);
    branchAdminNotificationsApi.list()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleMarkRead = async (n) => {
    setBusyId(n._id);
    try { await branchAdminNotificationsApi.markRead(n._id); fetchItems(); }
    catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  const handleDelete = async (n) => {
    if (!window.confirm('Delete this notification?')) return;
    try { await branchAdminNotificationsApi.remove(n._id); fetchItems(); }
    catch (err) { setError(err.message); }
  };

  const filtered = items.filter((n) => filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead);
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={16} className="text-indigo-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Alerts and updates for your branch</p>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100/70 p-1 rounded-xl w-fit">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Inbox size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              return (
                <motion.div
                  key={n._id} custom={i} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    n.isRead ? 'bg-white/60 border-gray-200/50' : 'bg-white border-indigo-200/60 shadow-sm'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLOR[n.type] || 'bg-gray-50 text-gray-500'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n)} disabled={busyId === n._id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <CheckCircle2 size={10} />Mark read
                      </button>
                    )}
                    <button onClick={() => handleDelete(n)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
