import { useState, useEffect, useCallback } from 'react';
import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Inbox, Edit3, Trash2, Calendar } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
  }),
};

function emptyFromFields(fields) {
  const obj = {};
  fields.forEach((f) => { obj[f.key] = f.type === 'number' ? '' : (f.default ?? ''); });
  return obj;
}

function formatValue(field, value) {
  if (value === undefined || value === null || value === '') return '—';
  if (field.type === 'number') return Number(value).toLocaleString();
  if (field.type === 'date') return new Date(value).toLocaleDateString();
  return String(value);
}

/**
 * Generic CRUD page used by every Finance sub-module (Ledger, Bank, Expense,
 * Party Ledger, Committee Ledger, Shop Ledger, Pocket Cash, Payables &
 * Receivables, Day Book, Balance Sheet).
 *
 * props:
 *  - title, subtitle, icon (lucide icon component), color (tailwind color name e.g. 'sky')
 *  - api: { list, create, update, remove } — each returns a promise resolving to { data }
 *  - fields: [{ key, label, type: 'text'|'number'|'textarea'|'select'|'date', options?, placeholder?, required? }]
 *  - columns: optional override list of field keys (defaults to all fields) shown in the table
 */
export default function FinanceCrudPage({ title, subtitle, icon: Icon = Sparkles, color = 'sky', api, fields, columns }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyFromFields(fields));
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const tableFields = (columns && columns.length ? columns.map((k) => fields.find((f) => f.key === k)).filter(Boolean) : fields).slice(0, 5);

  const fetchItems = useCallback(() => {
    setLoading(true);
    api.list()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyFromFields(fields));
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const next = {};
    fields.forEach((f) => {
      const v = item[f.key];
      next[f.key] = v === undefined || v === null ? '' : (f.type === 'date' ? String(v).slice(0, 10) : String(v));
    });
    setForm(next);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    const body = {};
    fields.forEach((f) => {
      const raw = form[f.key];
      body[f.key] = f.type === 'number' ? (raw === '' ? 0 : Number(raw)) : raw;
    });
    setFormLoading(true);
    try {
      if (editing) {
        await api.update(editing._id, body);
      } else {
        await api.create(body);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()} entry?`)) return;
    try {
      await api.remove(item._id);
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex items-start sm:items-center justify-between gap-3 mb-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Icon size={16} className={`text-${color}-500`} />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 ml-6">{subtitle}</p>}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 bg-${color}-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-${color}-500/25 shrink-0`}
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </motion.div>

      <Alert message={error} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${title}` : `New ${title}`}>
        <Alert message={formError} />
        <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}{f.required && ' *'}</label>
              {f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  rows={3}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all resize-none"
                />
              ) : f.type === 'select' ? (
                <select
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
                >
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={formLoading}>{formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.08 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200/60">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {tableFields.map((f) => (
                    <th key={f.key} className="px-5 py-3 font-semibold">{f.label}</th>
                  ))}
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={tableFields.length + 2} className="px-6 py-14">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                          <Inbox size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No entries yet</p>
                      </div>
                    </td>
                  </tr>
                )}
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.tr key={item._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                      className="border-b border-gray-100 transition-colors"
                    >
                      {tableFields.map((f, idx) => (
                        <td key={f.key} className="px-5 py-3.5">
                          {idx === 0 ? (
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}>
                                <Icon size={12} />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{formatValue(f, item[f.key])}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-700">{formatValue(f, item[f.key])}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar size={10} className="text-gray-300" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(item)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-${color}-50 text-${color}-600 border border-${color}-200/50 hover:bg-${color}-100`}>
                            <Edit3 size={10} />Edit
                          </button>
                          <button onClick={() => handleDelete(item)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
