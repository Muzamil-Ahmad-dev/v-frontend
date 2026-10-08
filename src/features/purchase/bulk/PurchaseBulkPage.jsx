 import { useState, useEffect } from 'react';
import { purchaseBulkApi, banksLedgerApi } from '../../../shared/api/staff.js';
import { Spinner, Alert, Badge, Pagination } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Plus, X, Search, Trash2, Send, ChevronDown, ChevronUp, Banknote } from 'lucide-react';

const emptyImei = () => ({ imei1: '', imei2: '', color: '', batteryHealth: '' });
const emptyGroup = () => ({ ramMemory: '', simOption: '', priceOfOne: '', imeiNumbers: [emptyImei()] });

const EMPTY_FORM = {
  partyName: '', companyName: '', modelName: '', date: '',
  purchasePaymentType: 'full-payment', payableAmountNow: '', payableAmountLater: '',
  bankAccountUsed: '', accountCash: '', pocketCash: '',
  ramSimDetails: [emptyGroup()],
};

const STATUS_COLOR = { Available: 'green', 'Partially Sold': 'yellow', Sold: 'indigo' };

function totalPhones(ramSimDetails) {
  return ramSimDetails.reduce((sum, g) => sum + (g.imeiNumbers?.length || 0), 0);
}
function totalPrice(ramSimDetails) {
  return ramSimDetails.reduce((sum, g) => sum + Number(g.priceOfOne || 0) * (g.imeiNumbers?.length || 0), 0);
}

export default function PurchaseBulkPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [banks, setBanks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [selectedImeis, setSelectedImeis] = useState([]);
  const [receiverName, setReceiverName] = useState('');
  const [dispatchSaving, setDispatchSaving] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  const [payCreditTarget, setPayCreditTarget] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState('');

  const fetchItems = (page = 1) => {
    setLoading(true);
    purchaseBulkApi.list({ page, limit: 20 })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setItems(list);
        setPagination({ page, pages: res.data?.pages || 1 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(1); }, []);
  useEffect(() => { banksLedgerApi.getAll().then((res) => setBanks(res.data || [])).catch(() => {}); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setFormError(''); };

  const updateGroup = (gi, patch) => {
    setForm((f) => {
      const groups = [...f.ramSimDetails];
      groups[gi] = { ...groups[gi], ...patch };
      return { ...f, ramSimDetails: groups };
    });
  };
  const updateImei = (gi, ii, patch) => {
    setForm((f) => {
      const groups = [...f.ramSimDetails];
      const imeis = [...groups[gi].imeiNumbers];
      imeis[ii] = { ...imeis[ii], ...patch };
      groups[gi] = { ...groups[gi], imeiNumbers: imeis };
      return { ...f, ramSimDetails: groups };
    });
  };
  const addGroup = () => setForm((f) => ({ ...f, ramSimDetails: [...f.ramSimDetails, emptyGroup()] }));
  const removeGroup = (gi) => setForm((f) => ({ ...f, ramSimDetails: f.ramSimDetails.filter((_, i) => i !== gi) }));
  const addImei = (gi) => setForm((f) => {
    const groups = [...f.ramSimDetails];
    groups[gi] = { ...groups[gi], imeiNumbers: [...groups[gi].imeiNumbers, emptyImei()] };
    return { ...f, ramSimDetails: groups };
  });
  const removeImei = (gi, ii) => setForm((f) => {
    const groups = [...f.ramSimDetails];
    groups[gi] = { ...groups[gi], imeiNumbers: groups[gi].imeiNumbers.filter((_, i) => i !== ii) };
    return { ...f, ramSimDetails: groups };
  });

  const handleSubmit = async () => {
    if (!form.partyName.trim()) { setFormError('Supplier / party name is required.'); return; }
    for (const g of form.ramSimDetails) {
      if (!g.imeiNumbers.length) { setFormError('Every RAM/SIM group needs at least one IMEI.'); return; }
      for (const e of g.imeiNumbers) {
        if (!e.imei1.trim()) { setFormError('Every phone needs an IMEI1.'); return; }
      }
    }
    setSaving(true); setFormError('');
    try {
      const payload = {
        partyName: form.partyName,
        companyName: form.companyName,
        modelName: form.modelName,
        date: form.date,
        purchasePaymentType: form.purchasePaymentType,
        bankAccountUsed: form.bankAccountUsed || undefined,
        accountCash: form.accountCash || 0,
        pocketCash: form.pocketCash || 0,
        ramSimDetails: form.ramSimDetails,
      };
      if (form.purchasePaymentType === 'credit') {
        payload.creditPaymentData = {
          payableAmountNow: form.payableAmountNow || 0,
          payableAmountLater: form.payableAmountLater || 0,
        };
      }
      await purchaseBulkApi.create(payload);
      closeModal();
      fetchItems(1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bulk purchase? Only allowed if no phones have been dispatched/sold.')) return;
    try {
      await purchaseBulkApi.remove(id);
      fetchItems(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const openDispatch = (item) => { setDispatchTarget(item); setSelectedImeis([]); setReceiverName(''); setDispatchError(''); };
  const toggleImeiSelect = (imei1) => {
    setSelectedImeis((cur) => cur.includes(imei1) ? cur.filter((i) => i !== imei1) : [...cur, imei1]);
  };
  const handleDispatch = async () => {
    if (!receiverName.trim() || selectedImeis.length === 0) { setDispatchError('Pick at least one phone and a receiver name.'); return; }
    setDispatchSaving(true); setDispatchError('');
    try {
      await purchaseBulkApi.dispatch(dispatchTarget._id, { imeis: selectedImeis, receiverName });
      setDispatchTarget(null);
      fetchItems(pagination.page);
    } catch (err) {
      setDispatchError(err.message);
    } finally {
      setDispatchSaving(false);
    }
  };

  const openPayCredit = (item) => { setPayCreditTarget(item); setPayAmount(''); setPayError(''); };
  const handlePayCredit = async () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { setPayError('Enter a valid amount.'); return; }
    if (amount > (payCreditTarget.payableAmountLater || 0)) { setPayError('Amount exceeds the remaining payable balance.'); return; }
    setPaySaving(true); setPayError('');
    try {
      await purchaseBulkApi.payCredit(payCreditTarget._id, amount);
      setPayCreditTarget(null);
      fetchItems(pagination.page);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPaySaving(false);
    }
  };

  const filtered = items.filter((it) =>
    `${it.companyName} ${it.modelName} ${it.partyLedgerId?.partyName || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Boxes size={20} className="text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Bulk Purchases</h2>
          <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={15} /> New Bulk Purchase
        </motion.button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company, model or supplier..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white/80"
        />
      </div>

      {error && <Alert message={error} />}

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white/80 border border-gray-200/60 rounded-2xl flex flex-col items-center justify-center py-16 text-gray-400">
              <Boxes size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No bulk purchases found.</p>
            </div>
          ) : filtered.map((bulk) => {
            const isOpen = expanded === bulk._id;
            const phones = totalPhones(bulk.ramSimDetails || []);
            return (
              <motion.div key={bulk._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setExpanded(isOpen ? null : bulk._id)}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {(bulk.companyName?.[0] || '#').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{bulk.companyName} {bulk.modelName}</p>
                    <p className="text-xs text-gray-400 truncate">
                      Supplier: {bulk.partyLedgerId?.partyName || '—'} · {phones} phone{phones !== 1 ? 's' : ''} · Rs {bulk.buyingPrice}
                      {bulk.purchasePaymentStatus === 'pending' && bulk.payableAmountLater > 0 && (
                        <> · <span className="text-red-500 font-medium">Rs {bulk.payableAmountLater} owed</span></>
                      )}
                    </p>
                  </div>
                  <Badge color={STATUS_COLOR[bulk.status] || 'gray'}>{bulk.status}</Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    {bulk.purchasePaymentStatus === 'pending' && bulk.payableAmountLater > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); openPayCredit(bulk); }} title="Pay supplier credit" className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors">
                        <Banknote size={13} />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); openDispatch(bulk); }} title="Dispatch phones" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Send size={13} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(bulk._id); }} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                    {isOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100">
                      <div className="px-5 py-3 space-y-3">
                        {(bulk.ramSimDetails || []).map((g, gi) => (
                          <div key={g._id || gi} className="bg-gray-50/70 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              {g.ramMemory || '—'} · {g.simOption || '—'} · Rs {g.priceOfOne} each
                            </p>
                            <div className="space-y-1">
                              {g.imeiNumbers.map((e) => (
                                <div key={e._id} className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="flex-1 truncate">{e.imei1}{e.imei2 ? ` / ${e.imei2}` : ''} {e.color ? `· ${e.color}` : ''}</span>
                                  <Badge color={STATUS_COLOR[e.status] || 'gray'}>{e.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={fetchItems} />

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">New Bulk Purchase</h3>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
              </div>

              {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{formError}</p>}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier / Party Name *</label>
                  <input value={form.partyName} onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                  <input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Model</label>
                  <input value={form.modelName} onChange={(e) => setForm((f) => ({ ...f, modelName: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
              </div>

              {/* RAM/SIM groups */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">RAM / SIM Groups</p>
                  <button onClick={addGroup} className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    <Plus size={12} /> Add Group
                  </button>
                </div>
                {form.ramSimDetails.map((g, gi) => (
                  <div key={gi} className="bg-gray-50/70 border border-gray-200/60 rounded-xl p-3">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <input placeholder="RAM (e.g. 8GB)" value={g.ramMemory} onChange={(e) => updateGroup(gi, { ramMemory: e.target.value })} className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                      <input placeholder="SIM (e.g. Dual)" value={g.simOption} onChange={(e) => updateGroup(gi, { simOption: e.target.value })} className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                      <div className="flex items-center gap-1">
                        <input type="number" placeholder="Price/unit" value={g.priceOfOne} onChange={(e) => updateGroup(gi, { priceOfOne: e.target.value })} className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                        {form.ramSimDetails.length > 1 && (
                          <button onClick={() => removeGroup(gi)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"><Trash2 size={12} /></button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {g.imeiNumbers.map((e, ii) => (
                        <div key={ii} className="grid grid-cols-4 gap-1.5 items-center">
                          <input placeholder="IMEI1 *" value={e.imei1} onChange={(ev) => updateImei(gi, ii, { imei1: ev.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                          <input placeholder="IMEI2" value={e.imei2} onChange={(ev) => updateImei(gi, ii, { imei2: ev.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                          <input placeholder="Color" value={e.color} onChange={(ev) => updateImei(gi, ii, { color: ev.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                          <div className="flex items-center gap-1">
                            <input placeholder="Battery %" value={e.batteryHealth} onChange={(ev) => updateImei(gi, ii, { batteryHealth: ev.target.value })} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                            {g.imeiNumbers.length > 1 && (
                              <button onClick={() => removeImei(gi, ii)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"><X size={12} /></button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => addImei(gi)} className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-1">
                        <Plus size={11} /> Add IMEI
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  Total phones: <span className="font-semibold text-gray-700">{totalPhones(form.ramSimDetails)}</span> · Total price: <span className="font-semibold text-gray-700">Rs {totalPrice(form.ramSimDetails)}</span>
                </p>
              </div>

              {/* Payment */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2">Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Type</label>
                    <select value={form.purchasePaymentType} onChange={(e) => setForm((f) => ({ ...f, purchasePaymentType: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30">
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
                  {form.purchasePaymentType === 'credit' && (
                    <>
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
                <p className="text-[11px] text-gray-400 mt-2">For credit purchases, Payable Now + Payable Later must equal total price.</p>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Create Bulk Purchase'}
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Dispatch Phones</h3>
                <button onClick={() => setDispatchTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-3">{dispatchTarget.companyName} {dispatchTarget.modelName}</p>

              {dispatchError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{dispatchError}</p>}

              <div className="space-y-1 max-h-56 overflow-y-auto mb-4 border border-gray-100 rounded-xl p-2">
                {(dispatchTarget.ramSimDetails || []).flatMap((g) => g.imeiNumbers)
                  .filter((e) => e.status === 'Available')
                  .map((e) => (
                    <label key={e._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                      <input type="checkbox" checked={selectedImeis.includes(e.imei1)} onChange={() => toggleImeiSelect(e.imei1)} className="accent-amber-500" />
                      <span className="truncate">{e.imei1} {e.color ? `· ${e.color}` : ''}</span>
                    </label>
                  ))}
                {(dispatchTarget.ramSimDetails || []).flatMap((g) => g.imeiNumbers).filter((e) => e.status === 'Available').length === 0 && (
                  <p className="text-xs text-gray-400 px-2 py-3 text-center">No available phones to dispatch.</p>
                )}
              </div>

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
                  {dispatchSaving ? 'Dispatching…' : `Dispatch (${selectedImeis.length})`}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay Credit Modal */}
      <AnimatePresence>
        {payCreditTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setPayCreditTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Pay Supplier Credit</h3>
                <button onClick={() => setPayCreditTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-1">{payCreditTarget.companyName} {payCreditTarget.modelName} · {payCreditTarget.partyLedgerId?.partyName || '—'}</p>
              <p className="text-xs text-gray-500 mb-4">Remaining balance: <span className="font-semibold text-red-500">Rs {payCreditTarget.payableAmountLater}</span></p>

              {payError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{payError}</p>}

              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount to Pay *</label>
              <input
                type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                max={payCreditTarget.payableAmountLater}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />
              <div className="flex gap-2 mt-6">
                <button onClick={() => setPayCreditTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.97 }} onClick={handlePayCredit} disabled={paySaving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60"
                >
                  {paySaving ? 'Paying…' : 'Pay'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
