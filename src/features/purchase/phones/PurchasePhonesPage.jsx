 import { useState, useEffect } from 'react';
import { purchasePhonesApi, banksLedgerApi } from '../../../shared/api/staff.js';
import { Spinner, Alert, Badge, Pagination } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, X, Search, Pencil, Trash2, Send, Undo2 } from 'lucide-react';

const EMPTY_FORM = {
  name: '', companyName: '', modelName: '', imei1: '', imei2: '',
  ramMemory: '', color: '', phoneCondition: 'New', warranty: '12 month',
  purchasePrice: '', demandPrice: '', finalPrice: '', date: '',
  paymentType: 'full-payment', partyName: '', payableAmountNow: '', payableAmountLater: '',
  bankAccountUsed: '', accountCash: '', pocketCash: '',
};

const STATUS_COLOR = { Available: 'green', Dispatched: 'yellow', Sold: 'indigo' };

export default function PurchasePhonesPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [banks, setBanks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [dispatchSaving, setDispatchSaving] = useState(false);

  const fetchItems = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    purchasePhonesApi.list(params)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setItems(list);
        setPagination({ page, pages: res.data?.pages || 1 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(1); }, [statusFilter]);
  useEffect(() => {
    banksLedgerApi.getAll().then((res) => setBanks(res.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...EMPTY_FORM,
      name: item.name || '', companyName: item.companyName || '', modelName: item.modelName || '',
      imei1: item.imei1 || '', imei2: item.imei2 || '', ramMemory: item.ramMemory || '', color: item.color || '',
      phoneCondition: item.phoneCondition || 'New', warranty: item.warranty || '12 month',
      purchasePrice: item.purchasePrice ?? '', demandPrice: item.demandPrice ?? '', finalPrice: item.finalPrice ?? '',
      date: item.date ? item.date.slice(0, 10) : '',
    });
    setFormError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM); setFormError(''); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.companyName.trim() || !form.modelName.trim() || !form.imei1.trim() || form.purchasePrice === '') {
      setFormError('Name, company, model, IMEI1 and purchase price are required.');
      return;
    }
    setSaving(true); setFormError('');
    try {
      if (editItem) {
        const { name, companyName, modelName, imei2, ramMemory, color, phoneCondition, warranty, purchasePrice, demandPrice, finalPrice, date } = form;
        await purchasePhonesApi.update(editItem._id, { name, companyName, modelName, imei2, ramMemory, color, phoneCondition, warranty, purchasePrice, demandPrice, finalPrice, date });
      } else {
        const payload = { ...form };
        if (payload.paymentType !== 'credit') {
          delete payload.partyName; delete payload.payableAmountNow; delete payload.payableAmountLater;
        }
        if (!payload.bankAccountUsed) { payload.accountCash = 0; }
        await purchasePhonesApi.create(payload);
      }
      closeModal();
      fetchItems(pagination.page);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase phone?')) return;
    try {
      await purchasePhonesApi.remove(id);
      fetchItems(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const openDispatch = (item) => { setDispatchTarget(item); setReceiverName(''); };
  const handleDispatch = async () => {
    if (!receiverName.trim()) return;
    setDispatchSaving(true);
    try {
      await purchasePhonesApi.dispatch(dispatchTarget._id, { receiverName });
      setDispatchTarget(null);
      fetchItems(pagination.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setDispatchSaving(false);
    }
  };

  const handleReturn = async (item) => {
    try {
      await purchasePhonesApi.returnDispatch(item._id);
      fetchItems(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = items.filter((it) =>
    `${it.companyName} ${it.modelName} ${it.imei1} ${it.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Purchase Phones</h2>
          <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={15} /> Add Phone
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, model or IMEI..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white/80"
          />
        </div>
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        >
          <option value="">All statuses</option>
          <option value="Available">Available</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      {error && <Alert message={error} />}

      {loading ? <Spinner /> : (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No purchase phones found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {(item.companyName?.[0] || '#').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.companyName} {item.modelName}</p>
                    <p className="text-xs text-gray-400 truncate">
                      IMEI: {item.imei1}{item.imei2 ? ` / ${item.imei2}` : ''} {item.ramMemory ? `· ${item.ramMemory}` : ''} {item.color ? `· ${item.color}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 shrink-0">Rs {item.purchasePrice}</span>
                  <Badge color={STATUS_COLOR[item.status] || 'gray'}>{item.status}</Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'Available' && (
                      <button onClick={() => openDispatch(item)} title="Dispatch" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Send size={13} />
                      </button>
                    )}
                    {item.status === 'Dispatched' && (
                      <button onClick={() => handleReturn(item)} title="Return to stock" className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors">
                        <Undo2 size={13} />
                      </button>
                    )}
                    {item.status !== 'Sold' && (
                      <button onClick={() => openEdit(item)} title="Edit" className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                    )}
                    {item.status !== 'Sold' && (
                      <button onClick={() => handleDelete(item._id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={fetchItems} />

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">{editItem ? 'Edit Phone' : 'Add Purchase Phone'}</h3>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
              </div>

              {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{formError}</p>}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Name *', key: 'name', type: 'text', span: 2 },
                  { label: 'Company *', key: 'companyName', type: 'text' },
                  { label: 'Model *', key: 'modelName', type: 'text' },
                  { label: 'IMEI1 *', key: 'imei1', type: 'text', disabled: !!editItem },
                  { label: 'IMEI2', key: 'imei2', type: 'text' },
                  { label: 'RAM/Memory', key: 'ramMemory', type: 'text' },
                  { label: 'Color', key: 'color', type: 'text' },
                  { label: 'Purchase Price *', key: 'purchasePrice', type: 'number' },
                  { label: 'Demand Price', key: 'demandPrice', type: 'number' },
                  { label: 'Final Price', key: 'finalPrice', type: 'number' },
                  { label: 'Date', key: 'date', type: 'date' },
                ].map(({ label, key, type, span, disabled }) => (
                  <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input
                      type={type} value={form[key]} disabled={disabled}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
                  <select value={form.phoneCondition} onChange={(e) => setForm((f) => ({ ...f, phoneCondition: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30">
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Warranty</label>
                  <input value={form.warranty} onChange={(e) => setForm((f) => ({ ...f, warranty: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
              </div>

              {!editItem && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Payment</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Type</label>
                      <select value={form.paymentType} onChange={(e) => setForm((f) => ({ ...f, paymentType: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30">
                        <option value="full-payment">Full payment</option>
                        <option value="credit">Credit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Account</label>
                      <select value={form.bankAccountUsed} onChange={(e) => setForm((f) => ({ ...f, bankAccountUsed: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30">
                        <option value="">None</option>
                        {banks.map((b) => (
                          <option key={b._id} value={b._id}>{b.bankName} ({b.accountType}) — Rs {b.accountCash}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Amount from Bank</label>
                      <input type="number" value={form.accountCash} onChange={(e) => setForm((f) => ({ ...f, accountCash: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Amount from Pocket Cash</label>
                      <input type="number" value={form.pocketCash} onChange={(e) => setForm((f) => ({ ...f, pocketCash: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                    </div>
                    {form.paymentType === 'credit' && (
                      <>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier / Party Name</label>
                          <input value={form.partyName} onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Payable Now</label>
                          <input type="number" value={form.payableAmountNow} onChange={(e) => setForm((f) => ({ ...f, payableAmountNow: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Payable Later</label>
                          <input type="number" value={form.payableAmountLater} onChange={(e) => setForm((f) => ({ ...f, payableAmountLater: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">For credit purchases, Payable Now + Payable Later must equal Purchase Price.</p>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editItem ? 'Update' : 'Add Phone'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {dispatchTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDispatchTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Dispatch Phone</h3>
                <button onClick={() => setDispatchTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-4">{dispatchTarget.companyName} {dispatchTarget.modelName} · {dispatchTarget.imei1}</p>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Receiver Name *</label>
              <input
                value={receiverName} onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />
              <div className="flex gap-2 mt-6">
                <button onClick={() => setDispatchTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.97 }} onClick={handleDispatch} disabled={dispatchSaving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60"
                >
                  {dispatchSaving ? 'Dispatching…' : 'Dispatch'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
