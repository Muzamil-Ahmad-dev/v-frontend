 import { useState, useEffect, useCallback } from 'react';
import { branchAdminApi } from '../../../shared/api/admin.js';
import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCog, Plus, Inbox, Power, PowerOff, Calendar } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

const emptyForm = { name: '', email: '', phone: '', password: '' };

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
      active ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/50' : 'bg-gray-100 text-gray-500 ring-gray-200/50'
    }`}>
      <span className={`w-1 h-1 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

export default function BranchAdminsPage() {
  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await branchAdminApi.list();
      setAdmins(res.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load branch admins.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = () => {
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await branchAdminApi.create(form);
      setShowModal(false);
      await load();
    } catch (e) {
      setFormError(e.message || 'Failed to create branch admin.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (admin) => {
    const action = admin.status === 'ACTIVE' ? 'deactivate' : 'activate';
    setTogglingId(admin._id);
    try {
      await branchAdminApi.toggleStatus(admin._id, action);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 ' +
    'placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all';

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <UserCog size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-800">Branch Admins</h1>
            <p className="text-xs text-stone-400">Manage your branch administrators</p>
          </div>
        </div>
        <Button onClick={openModal} size="sm">
          <Plus size={15} className="mr-1" /> Add Branch Admin
        </Button>
      </div>

      {/* Page-level error */}
      {error && <Alert type="error" message={error} />}

      {/* List */}
      {loading ? (
        <Spinner />
      ) : admins.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-stone-200 mt-4">
          <Inbox size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium text-sm">No branch admins yet</p>
          <p className="text-stone-400 text-xs mt-1">Create one to manage branches and staff</p>
        </motion.div>
      ) : (
        <div className="space-y-3 mt-4">
          {admins.map((admin, i) => (
            <motion.div key={admin._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {admin.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{admin.name}</p>
                  <p className="text-xs text-stone-400 truncate">{admin.email}</p>
                  {admin.branchId?.name && (
                    <p className="text-xs text-teal-600 truncate">Branch: {admin.branchId.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={admin.status} />
                <button
                  onClick={() => handleToggle(admin)}
                  disabled={togglingId === admin._id}
                  title={admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                    admin.status === 'ACTIVE'
                      ? 'text-red-400 hover:bg-red-50'
                      : 'text-emerald-500 hover:bg-emerald-50'
                  }`}
                >
                  {admin.status === 'ACTIVE' ? <PowerOff size={16} /> : <Power size={16} />}
                </button>
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Calendar size={11} />
                  {new Date(admin.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal — uses isOpen prop matching ui.jsx Modal signature */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Branch Admin">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          {[
            { key: 'name',     label: 'Full Name', placeholder: 'John Smith',         type: 'text',     required: true },
            { key: 'email',    label: 'Email',     placeholder: 'admin@branch.com',   type: 'email',    required: true },
            { key: 'phone',    label: 'Phone',     placeholder: '03001234567',         type: 'text',     required: false },
            { key: 'password', label: 'Password',  placeholder: '••••••••',           type: 'password', required: true },
          ].map(({ key, label, placeholder, type, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                {label}{required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className={inputClass}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
