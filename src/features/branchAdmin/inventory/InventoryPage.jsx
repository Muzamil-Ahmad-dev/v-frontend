import { useState, useEffect, useCallback } from 'react';
import {
  branchAdminPhonesApi, branchAdminAccessoriesApi, branchAdminDispatchApi,
} from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Button, Modal, Badge } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Sparkles, Inbox, Edit3, Trash2, Smartphone,
  Boxes, Truck, Search,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 } }),
};

const TABS = [
  { key: 'phones', label: 'Phones', icon: Smartphone },
  { key: 'accessories', label: 'Accessories', icon: Boxes },
  { key: 'dispatch', label: 'Dispatch', icon: Truck },
];

const STATUS_COLOR = { Available: 'green', Sold: 'indigo', Dispatched: 'yellow', Returned: 'gray' };

function Header({ search, setSearch }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={16} className="text-indigo-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Inventory</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage your branch's phones, accessories & dispatch</p>
      </div>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-8 pr-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-48"
        />
      </div>
    </motion.div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 mb-4 bg-indigo-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-500/25"
    >
      <Plus size={13} />{label}
    </motion.button>
  );
}

function Tabs({ active, setActive }) {
  return (
    <div className="flex items-center gap-1.5 mb-5 bg-gray-100/70 p-1 rounded-xl w-fit">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActive(key)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            active === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon size={13} />{label}
        </button>
      ))}
    </div>
  );
}

function DataTable({ columns, rows, loading, emptyLabel, renderActions }) {
  if (loading) return <Spinner />;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-200/60">
            <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
              {columns.map((c) => <th key={c.key} className="px-5 py-3 font-semibold whitespace-nowrap">{c.label}</th>)}
              {renderActions && <th className="px-5 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-6 py-14">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <Inbox size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">{emptyLabel}</p>
                  </div>
                </td>
              </tr>
            )}
            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.tr key={row._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
                  className="border-b border-gray-100 transition-colors"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-3.5 text-xs text-gray-700 whitespace-nowrap">
                      {c.render ? c.render(row) : row[c.key] ?? '—'}
                    </td>
                  ))}
                  {renderActions && <td className="px-5 py-3.5">{renderActions(row)}</td>}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Phones tab ────────────────────────────────────────────────────────────────
const EMPTY_PHONE = {
  companyName: '', modelName: '', specs: '', imei: '', imei2: '', color: '',
  ramMemory: '', phoneCondition: 'New', warranty: '12 month', purchasePrice: '',
  demandPrice: '', finalPrice: '',
};

function PhonesTab({ search }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PHONE);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    branchAdminPhonesApi.list()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_PHONE); setFormError(''); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      companyName: p.companyName || '', modelName: p.modelName || '', specs: p.specs || '',
      imei: p.imei || '', imei2: p.imei2 || '', color: p.color || '', ramMemory: p.ramMemory || '',
      phoneCondition: p.phoneCondition || 'New', warranty: p.warranty || '12 month',
      purchasePrice: p.purchasePrice ?? '', demandPrice: p.demandPrice ?? '', finalPrice: p.finalPrice ?? '',
    });
    setFormError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.modelName.trim() || !form.imei.trim() || form.purchasePrice === '') {
      setFormError('Company, model, IMEI and purchase price are required.'); return;
    }
    setSaving(true); setFormError('');
    try {
      if (editing) await branchAdminPhonesApi.update(editing._id, form);
      else await branchAdminPhonesApi.create(form);
      setModalOpen(false); fetchItems();
    } catch (err) { setFormError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete phone with IMEI "${p.imei}"?`)) return;
    try { await branchAdminPhonesApi.remove(p._id); fetchItems(); }
    catch (err) { setError(err.message); }
  };

  const filtered = items.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [p.companyName, p.modelName, p.imei, p.color].some((v) => v?.toLowerCase().includes(s));
  });

  return (
    <>
      <Alert type="error" message={error} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Phone' : 'Add Phone'}>
        <div className="space-y-3">
          <Alert type="error" message={formError} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" value={form.companyName} onChange={set('companyName')} />
            <Field label="Model *" value={form.modelName} onChange={set('modelName')} />
            <Field label="IMEI *" value={form.imei} onChange={set('imei')} />
            <Field label="IMEI 2" value={form.imei2} onChange={set('imei2')} />
            <Field label="Color" value={form.color} onChange={set('color')} />
            <Field label="RAM/Memory" value={form.ramMemory} onChange={set('ramMemory')} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
              <select value={form.phoneCondition} onChange={set('phoneCondition')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
            <Field label="Warranty" value={form.warranty} onChange={set('warranty')} />
            <Field label="Purchase Price *" type="number" value={form.purchasePrice} onChange={set('purchasePrice')} />
            <Field label="Demand Price" type="number" value={form.demandPrice} onChange={set('demandPrice')} />
            <Field label="Final Price" type="number" value={form.finalPrice} onChange={set('finalPrice')} />
          </div>
          <Field label="Specs" value={form.specs} onChange={set('specs')} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Phone'}</Button>
          </div>
        </div>
      </Modal>

      <AddButton label="Add Phone" onClick={openCreate} />
      <DataTable
        loading={loading}
        emptyLabel="No phones in inventory yet"
        columns={[
          { key: 'companyName', label: 'Company' },
          { key: 'modelName', label: 'Model' },
          { key: 'imei', label: 'IMEI' },
          { key: 'color', label: 'Color' },
          { key: 'phoneCondition', label: 'Condition' },
          { key: 'purchasePrice', label: 'Purchase Price', render: (r) => `Rs. ${r.purchasePrice}` },
          { key: 'status', label: 'Status', render: (r) => <Badge color={STATUS_COLOR[r.status] || 'gray'}>{r.status}</Badge> },
        ]}
        rows={filtered}
        renderActions={(p) => (
          <div className="flex items-center gap-1.5">
            <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100">
              <Edit3 size={10} />Edit
            </button>
            <button onClick={() => handleDelete(p)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
              <Trash2 size={10} />
            </button>
          </div>
        )}
      />
    </>
  );
}

// ── Accessories tab ───────────────────────────────────────────────────────────
const EMPTY_ACCESSORY = { accessoryName: '', quantity: '', perPiecePrice: '' };

function AccessoriesTab({ search }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_ACCESSORY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    branchAdminAccessoriesApi.list()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_ACCESSORY); setFormError(''); setModalOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({ accessoryName: a.accessoryName || '', quantity: '', perPiecePrice: a.perPiecePrice ?? '' });
    setFormError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.accessoryName.trim()) { setFormError('Accessory name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      if (editing) {
        // Rename/re-picture only — quantity is never edited directly.
        await branchAdminAccessoriesApi.update(editing._id, { accessoryName: form.accessoryName });
      } else {
        if (!form.quantity || !form.perPiecePrice) { setFormError('Quantity and per-piece price are required.'); setSaving(false); return; }
        await branchAdminAccessoriesApi.purchase({
          accessories: [{ accessoryName: form.accessoryName, quantity: Number(form.quantity), perPiecePrice: Number(form.perPiecePrice) }],
          paymentType: 'full-payment',
          accountCash: Number(form.quantity) * Number(form.perPiecePrice),
        });
      }
      setModalOpen(false); fetchItems();
    } catch (err) { setFormError(err.message); } finally { setSaving(false); }
  };

  const handleRestock = async (a) => {
    const qty = window.prompt(`Restock quantity for "${a.accessoryName}":`);
    if (!qty || Number(qty) <= 0) return;
    try {
      await branchAdminAccessoriesApi.restock(a._id, { quantity: Number(qty), perPiecePrice: a.perPiecePrice, accountCash: Number(qty) * a.perPiecePrice });
      fetchItems();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.accessoryName}"?`)) return;
    try { await branchAdminAccessoriesApi.remove(a._id); fetchItems(); }
    catch (err) { setError(err.message); }
  };

  const filtered = items.filter((a) => !search || a.accessoryName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Alert type="error" message={error} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Rename Accessory' : 'Purchase Accessory'}>
        <div className="space-y-3">
          <Alert type="error" message={formError} />
          <Field label="Accessory name *" value={form.accessoryName} onChange={set('accessoryName')} />
          {!editing && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity *" type="number" value={form.quantity} onChange={set('quantity')} />
              <Field label="Per-piece price *" type="number" value={form.perPiecePrice} onChange={set('perPiecePrice')} />
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Purchase'}</Button>
          </div>
        </div>
      </Modal>

      <AddButton label="Purchase Accessory" onClick={openCreate} />
      <DataTable
        loading={loading}
        emptyLabel="No accessories yet"
        columns={[
          { key: 'accessoryName', label: 'Name' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'stock', label: 'In Stock' },
          { key: 'perPiecePrice', label: 'Per Piece', render: (r) => `Rs. ${r.perPiecePrice}` },
          { key: 'totalPrice', label: 'Total', render: (r) => `Rs. ${r.totalPrice}` },
        ]}
        rows={filtered}
        renderActions={(a) => (
          <div className="flex items-center gap-1.5">
            <button onClick={() => handleRestock(a)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-100">
              <Plus size={10} />Restock
            </button>
            <button onClick={() => openEdit(a)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100">
              <Edit3 size={10} />Edit
            </button>
            <button onClick={() => handleDelete(a)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
              <Trash2 size={10} />
            </button>
          </div>
        )}
      />
    </>
  );
}

// ── Dispatch tab ──────────────────────────────────────────────────────────────
const EMPTY_DISPATCH = { receiverName: '' };

function DispatchTab({ search }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_DISPATCH);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    branchAdminDispatchApi.list()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => { setForm(EMPTY_DISPATCH); setFormError(''); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.receiverName.trim()) { setFormError('Receiver name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      await branchAdminDispatchApi.create({ receiverName: form.receiverName, items: [] });
      setModalOpen(false); fetchItems();
    } catch (err) { setFormError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete dispatch to "${d.receiverName}"?`)) return;
    try { await branchAdminDispatchApi.remove(d._id); fetchItems(); }
    catch (err) { setError(err.message); }
  };

  const filtered = items.filter((d) => !search || d.receiverName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Alert type="error" message={error} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Dispatch">
        <div className="space-y-3">
          <Alert type="error" message={formError} />
          <Field label="Receiver name *" value={form.receiverName} onChange={set('receiverName')} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Create Dispatch'}</Button>
          </div>
        </div>
      </Modal>

      <AddButton label="New Dispatch" onClick={openCreate} />
      <DataTable
        loading={loading}
        emptyLabel="No dispatch records yet"
        columns={[
          { key: 'receiverName', label: 'Receiver' },
          { key: 'dispatchDate', label: 'Date', render: (r) => new Date(r.dispatchDate).toLocaleDateString() },
          { key: 'itemsCount', label: 'Items', render: (r) => r.items?.length || 0 },
          { key: 'status', label: 'Status', render: (r) => <Badge color={STATUS_COLOR[r.status] || 'gray'}>{r.status}</Badge> },
        ]}
        rows={filtered}
        renderActions={(d) => (
          <button onClick={() => handleDelete(d)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={10} />
          </button>
        )}
      />
    </>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
      />
    </div>
  );
}

export default function InventoryPage() {
  const [tab, setTab] = useState('phones');
  const [search, setSearch] = useState('');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <Header search={search} setSearch={setSearch} />
      <Tabs active={tab} setActive={(t) => { setTab(t); setSearch(''); }} />
      {tab === 'phones' && <PhonesTab search={search} />}
      {tab === 'accessories' && <AccessoriesTab search={search} />}
      {tab === 'dispatch' && <DispatchTab search={search} />}
    </div>
  );
}
