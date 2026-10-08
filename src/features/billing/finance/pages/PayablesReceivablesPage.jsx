 import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Phone, FileText, DollarSign, ArrowUp, ArrowDown,
  Eye, EyeOff, Edit2, Trash2, Star, Search, Printer, Inbox,
  Landmark, Wallet, Ban, Layers, AlertTriangle,
} from 'lucide-react';
import { Card, Button, Modal, Alert, Spinner } from '../../../../shared/components/ui.jsx';
import { personApi, banksLedgerApi, pocketCashLedgerApi } from '../../../../shared/api/staff.js';
import { useAuth } from '../../../../shared/utils/AuthContext.jsx';

const PAYMENT_METHODS = [
  { key: 'none',   label: 'No Payment',    icon: Ban },
  { key: 'bank',   label: 'Bank Account',  icon: Landmark },
  { key: 'pocket', label: 'Pocket Cash',   icon: Wallet },
  { key: 'split',  label: 'Split Payment', icon: Layers },
];

const emptyPerson = { name: '', number: '', reference: '' };
const emptyCredit = { personId: '', amount: '', description: '', paymentMethod: 'none', bankAccountUsed: '', accountCash: '', pocketCash: '' };

function money(n) {
  return `PKR ${Number(n || 0).toLocaleString()}`;
}

function getStatus(person) {
  const taking = Number(person?.takingCredit || 0);
  const giving = Number(person?.givingCredit || 0);
  if (taking > giving) return 'Payable';
  if (giving > taking) return 'Receivable';
  return 'Settled';
}

const STATUS_COLORS = {
  Payable:    { text: '#ef4444', bg: '#fef2f2' },
  Receivable: { text: '#22c55e', bg: '#f0fdf4' },
  Settled:    { text: '#6b7280', bg: '#f9fafb' },
};

export default function PayablesReceivablesPage() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const [persons, setPersons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pageError, setPageError] = useState('');
  const [banks, setBanks]       = useState([]);
  const [pocketBalance, setPocketBalance] = useState(0);

  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreate, setShowCreate]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showGive, setShowGive]       = useState(false);
  const [showTake, setShowTake]       = useState(false);
  const [showVerify, setShowVerify]   = useState(false);

  const [createForm, setCreateForm] = useState(emptyPerson);
  const [editForm, setEditForm]     = useState({ id: '', ...emptyPerson });
  const [creditForm, setCreditForm] = useState(emptyCredit);
  const [deleteId, setDeleteId]     = useState('');
  const [password, setPassword]     = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [toast, setToast]           = useState(null); // { type, message }

  const [showReceivables, setShowReceivables] = useState(false);
  const [showPayables, setShowPayables]       = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const res = await personApi.getAll();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setPersons(list);
    } catch (err) {
      setPageError(err.message || 'Failed to load persons.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await banksLedgerApi.getAll();
      setBanks(Array.isArray(res?.banks) ? res.banks : []);
    } catch {
      setBanks([]);
    }
  };

  const fetchPocketBalance = async () => {
    try {
      const res = await pocketCashLedgerApi.getTotal();
      setPocketBalance(res?.total || 0);
    } catch {
      setPocketBalance(0);
    }
  };

  useEffect(() => {
    fetchPersons();
    fetchBanks();
    fetchPocketBalance();
  }, []);

  const safePersons = Array.isArray(persons) ? persons : [];

  const totalReceivables = safePersons.reduce(
    (sum, p) => sum + Math.max((p.givingCredit || 0) - (p.takingCredit || 0), 0), 0
  );
  const totalPayables = safePersons.reduce(
    (sum, p) => sum + Math.max((p.takingCredit || 0) - (p.givingCredit || 0), 0), 0
  );

  const filteredPersons = useMemo(() => {
    let list = safePersons;
    if (statusFilter !== 'all') {
      list = list.filter((p) => getStatus(p) === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.number?.toString().includes(q) ||
          p.reference?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [safePersons, statusFilter, searchTerm]);

  // ── Create ──────────────────────────────────────────────
  const handleCreatePerson = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.number || !createForm.reference) {
      setFormError('Please fill all fields.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      await personApi.create(createForm);
      setShowCreate(false);
      setCreateForm(emptyPerson);
      fetchPersons();
      showToast('success', 'Person created successfully!');
    } catch (err) {
      setFormError(err.message || 'Error creating person.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────
  const openEdit = (person) => {
    setEditForm({ id: person._id, name: person.name, number: person.number, reference: person.reference || '' });
    setFormError('');
    setShowEdit(true);
  };

  const handleEditPerson = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.number || !editForm.reference) {
      setFormError('Please fill all fields.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      await personApi.update(editForm.id, {
        name: editForm.name,
        number: editForm.number,
        reference: editForm.reference,
      });
      setShowEdit(false);
      fetchPersons();
      showToast('success', 'Person updated successfully!');
    } catch (err) {
      setFormError(err.message || 'Error updating person.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Favourite ───────────────────────────────────────────
  const toggleFavourite = async (id) => {
    try {
      await personApi.toggleFavourite(id);
      fetchPersons();
    } catch (err) {
      showToast('error', err.message || 'Error updating favourite.');
    }
  };

  // ── Delete (password-protected) ────────────────────────
  const confirmDelete = (id) => {
    setDeleteId(id);
    setPassword('');
    setFormError('');
    setShowVerify(true);
  };

  const handleVerifyAndDelete = async () => {
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      const res = await personApi.verifyPassword(password);
      const ok = res === true || res?.success === true || res?.valid === true;
      if (!ok) {
        setFormError('Invalid password.');
        return;
      }
      await personApi.remove(deleteId);
      setShowVerify(false);
      setPassword('');
      fetchPersons();
      showToast('success', 'Person deleted successfully!');
    } catch (err) {
      setFormError(err.message || 'Error deleting person.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Give / Take credit ─────────────────────────────────
  const openCreditModal = (which) => {
    setCreditForm(emptyCredit);
    setFormError('');
    which === 'give' ? setShowGive(true) : setShowTake(true);
  };

  const setPaymentMethod = (method) => {
    setCreditForm((f) => ({ ...f, paymentMethod: method, bankAccountUsed: '', accountCash: '', pocketCash: '' }));
  };

  const selectedBank = banks.find((b) => b._id === creditForm.bankAccountUsed) || null;
  const paymentTotal = (Number(creditForm.accountCash) || 0) + (Number(creditForm.pocketCash) || 0);
  const paymentExceeds = creditForm.amount && paymentTotal > Number(creditForm.amount);

  const buildCreditPayload = () => {
    const payload = {
      personId: creditForm.personId,
      amount: Number(creditForm.amount),
      description: creditForm.description || '',
    };
    if (creditForm.paymentMethod !== 'none') {
      if (creditForm.bankAccountUsed) {
        payload.bankAccountUsed = creditForm.bankAccountUsed;
        payload.accountCash = Number(creditForm.accountCash) || 0;
      }
      if (Number(creditForm.pocketCash) > 0) {
        payload.pocketCash = Number(creditForm.pocketCash);
      }
    }
    return payload;
  };

  const validateCreditForm = () => {
    if (!creditForm.personId || !creditForm.amount) {
      setFormError('Please select a person and enter an amount.');
      return false;
    }
    if (paymentExceeds) {
      setFormError('Total payment (bank + pocket cash) cannot exceed the amount.');
      return false;
    }
    if (creditForm.paymentMethod === 'bank' && !creditForm.bankAccountUsed) {
      setFormError('Please select a bank account.');
      return false;
    }
    if (creditForm.paymentMethod === 'split' && (!creditForm.bankAccountUsed || !creditForm.accountCash || !creditForm.pocketCash)) {
      setFormError('Please fill all payment fields for a split payment.');
      return false;
    }
    return true;
  };

  const handleGiveCredit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateCreditForm()) return;
    try {
      setSubmitting(true);
      await personApi.giveCredit(buildCreditPayload());
      setShowGive(false);
      fetchPersons();
      fetchBanks();
      fetchPocketBalance();
      showToast('success', 'Credit given successfully!');
    } catch (err) {
      setFormError(err.message || 'Error giving credit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakeCredit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateCreditForm()) return;
    try {
      setSubmitting(true);
      await personApi.takeCredit(buildCreditPayload());
      setShowTake(false);
      fetchPersons();
      fetchBanks();
      fetchPocketBalance();
      showToast('success', 'Credit taken successfully!');
    } catch (err) {
      setFormError(err.message || 'Error taking credit.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Print ───────────────────────────────────────────────
  const handlePrint = () => {
    const escapeHtml = (s) =>
      String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const payables = safePersons.filter((p) => (p.takingCredit || 0) > (p.givingCredit || 0));
    const receivables = safePersons.filter((p) => (p.givingCredit || 0) > (p.takingCredit || 0));

    const allRows = safePersons.map((p, i) => `
      <tr>
        <td style='border:1px solid #ccc;padding:6px;'>${i + 1}</td>
        <td style='border:1px solid #ccc;padding:6px;'>${escapeHtml(p.name)}</td>
        <td style='border:1px solid #ccc;padding:6px;'>${escapeHtml(p.number)}</td>
        <td style='border:1px solid #ccc;padding:6px;'>${escapeHtml(p.reference || '')}</td>
        <td style='border:1px solid #ccc;padding:6px;text-align:right;'>${money(p.takingCredit)}</td>
        <td style='border:1px solid #ccc;padding:6px;text-align:right;'>${money(p.givingCredit)}</td>
        <td style='border:1px solid #ccc;padding:6px;text-align:right;'>${money(Math.abs((p.takingCredit || 0) - (p.givingCredit || 0)))}</td>
      </tr>`).join('');

    const payablesRows = payables.map((p, i) => `
      <tr><td style='border:1px solid #ccc;padding:6px;'>${i + 1}</td><td style='border:1px solid #ccc;padding:6px;'>${escapeHtml(p.name)}</td><td style='border:1px solid #ccc;padding:6px;text-align:right;'>${money(p.takingCredit - p.givingCredit)}</td></tr>`).join('');

    const receivablesRows = receivables.map((p, i) => `
      <tr><td style='border:1px solid #ccc;padding:6px;'>${i + 1}</td><td style='border:1px solid #ccc;padding:6px;'>${escapeHtml(p.name)}</td><td style='border:1px solid #ccc;padding:6px;text-align:right;'>${money(p.givingCredit - p.takingCredit)}</td></tr>`).join('');

    const shopLine = escapeHtml(user?.businessName || user?.name || '—');

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) {
      showToast('error', 'Popup blocked! Please allow popups for this site to print.');
      return;
    }
    printWindow.document.write(`
      <html><head><title>Payables & Receivables Print</title>
      <style>
        @media print { @page { size: A4 portrait; margin: 20mm; } body { font-size: 18px !important; } }
        body { font-family: sans-serif; margin: 24px; font-size: 18px; }
        h2 { margin-bottom: 12px; font-size: 28px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
        th, td { border: 1px solid #ccc; padding: 10px 7px; text-align: left; font-size: 18px; }
        th { background: #f3f4f6; }
        .section-title { margin: 18px 0 8px 0; font-size: 17px; color: #1d4ed8; }
        .shop-line { font-size: 20px; margin-bottom: 20px; }
        .totals-footer { margin-top: 28px; padding-top: 16px; border-top: 2px solid #000; font-size: 20px; line-height: 1.6; }
      </style></head><body>
      <h2>Payables & Receivables</h2>
      <div class='shop-line'><strong>Shop:</strong> ${shopLine}</div>
      <div class='section-title'>All accounts</div>
      <table><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Reference</th><th style="text-align:right">Taking</th><th style="text-align:right">Giving</th><th style="text-align:right">Net</th></tr></thead>
      <tbody>${allRows || `<tr><td colspan='7'>No records</td></tr>`}</tbody></table>
      <div class='section-title'>Payables (you owe)</div>
      <table><thead><tr><th>#</th><th>Person Name</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${payablesRows || `<tr><td colspan='3'>No payables</td></tr>`}</tbody></table>
      <div class='section-title'>Receivables (owed to you)</div>
      <table><thead><tr><th>#</th><th>Person Name</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${receivablesRows || `<tr><td colspan='3'>No receivables</td></tr>`}</tbody></table>
      <div class='totals-footer'>
        <strong>Amount to pay:</strong> ${money(totalPayables)}<br/>
        <strong>Amount to receive:</strong> ${money(totalReceivables)}
      </div>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  // ── Shared payment sub-form (used in both Give & Take modals) ──────────
  const PaymentSection = () => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Source (optional)</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => setPaymentMethod(key)}
            className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-[11px] font-medium transition-colors ${
              creditForm.paymentMethod === key
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {(creditForm.paymentMethod === 'bank' || creditForm.paymentMethod === 'split') && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200/70 rounded-xl">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bank Account</label>
          <select
            value={creditForm.bankAccountUsed}
            onChange={(e) => setCreditForm({ ...creditForm, bankAccountUsed: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">Select bank account</option>
            {banks.map((b) => (
              <option key={b._id} value={b._id}>{b.bankName} — {b.accountType}</option>
            ))}
          </select>
          {selectedBank && (
            <div className="text-xs text-gray-500 mb-2">Available Balance: {money(selectedBank.accountCash)}</div>
          )}
          <input
            type="number" min="0" step="0.01"
            value={creditForm.accountCash}
            onChange={(e) => setCreditForm({ ...creditForm, accountCash: e.target.value })}
            placeholder="Amount from bank"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      )}

      {(creditForm.paymentMethod === 'pocket' || creditForm.paymentMethod === 'split') && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200/70 rounded-xl">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pocket Cash</label>
          <div className="text-xs text-gray-500 mb-2">Available Balance: {money(pocketBalance)}</div>
          <input
            type="number" min="0" step="0.01"
            value={creditForm.pocketCash}
            onChange={(e) => setCreditForm({ ...creditForm, pocketCash: e.target.value })}
            placeholder="Amount from pocket cash"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      )}

      {creditForm.paymentMethod !== 'none' && creditForm.amount && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 space-y-1">
          <div><strong>Amount:</strong> {money(creditForm.amount)}</div>
          <div><strong>Total Payment:</strong> {money(paymentTotal)}</div>
          {paymentExceeds && (
            <div className="flex items-center gap-1.5 text-red-600 font-semibold">
              <AlertTriangle size={13} /> Total payment exceeds amount!
            </div>
          )}
        </div>
      )}
    </div>
  );

  const sortedPersonOptions = [...safePersons].sort((a, b) => (b.favourite === true) - (a.favourite === true));

  return (
    <div className="p-3 sm:p-5 lg:p-8 max-w-[1400px] mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 right-4 z-[60] max-w-xs"
          >
            <Alert type={toast.type === 'error' ? 'error' : 'success'} message={toast.message} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Card className="p-5 sm:p-7 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payables & Receivables</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your credit transactions and track outstanding amounts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => { setCreateForm(emptyPerson); setFormError(''); setShowCreate(true); }}>
              <Plus size={16} /> Create Entity
            </Button>
            <Button variant="success" onClick={() => openCreditModal('give')}>
              <ArrowUp size={16} /> Give Credit
            </Button>
            <Button variant="danger" onClick={() => openCreditModal('take')}>
              <ArrowDown size={16} /> Take Credit
            </Button>
          </div>
        </div>
      </Card>

      <Alert message={pageError} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4
              className="text-2xl font-bold text-emerald-500 cursor-pointer transition-all"
              style={{ filter: showReceivables ? 'none' : 'blur(5px)' }}
              onClick={() => setShowReceivables((s) => !s)}
            >
              {money(totalReceivables)}
            </h4>
            <small className="text-gray-500 text-sm">Receivables (owed to you)</small>
          </div>
          <button onClick={() => setShowReceivables((s) => !s)} className="text-emerald-500">
            {showReceivables ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4
              className="text-2xl font-bold text-red-500 cursor-pointer transition-all"
              style={{ filter: showPayables ? 'none' : 'blur(5px)' }}
              onClick={() => setShowPayables((s) => !s)}
            >
              {money(totalPayables)}
            </h4>
            <small className="text-gray-500 text-sm">Payables (you owe)</small>
          </div>
          <button onClick={() => setShowPayables((s) => !s)} className="text-red-500">
            {showPayables ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </Card>
      </div>

      {/* Search / Filter / Print */}
      <Card className="p-5 mb-5">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search persons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Show All
            </button>
            <button
              onClick={() => setStatusFilter('Receivable')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusFilter === 'Receivable' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}
            >
              Receivable
            </button>
            <button
              onClick={() => setStatusFilter('Payable')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusFilter === 'Payable' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}
            >
              Payable
            </button>
          </div>
          <Button variant="primary" className="self-center" onClick={handlePrint}>
            <Printer size={15} /> Print
          </Button>
        </div>
      </Card>

      {/* Persons Grid */}
      <Card className="p-5 sm:p-7">
        <h2 className="text-lg font-bold text-gray-900 mb-5">All Persons ({safePersons.length})</h2>

        {loading ? (
          <Spinner />
        ) : safePersons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Inbox size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No persons found</p>
            <p className="text-xs text-gray-400 mt-1">Create your first person to start tracking credits</p>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            <AnimatePresence>
              {filteredPersons.map((person, idx) => {
                const status = getStatus(person);
                const colors = STATUS_COLORS[status];
                const net = Math.abs((person.takingCredit || 0) - (person.givingCredit || 0));
                return (
                  <motion.div
                    key={person._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl p-5 flex flex-col justify-between min-h-[210px]"
                    style={{ backgroundColor: colors.bg, border: `2px solid ${colors.text}20` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="text-white text-[11px] font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: colors.text }}
                      >
                        {status}
                      </span>
                      <div className="flex items-center gap-3">
                        <Star
                          size={16}
                          onClick={() => toggleFavourite(person._id)}
                          className="cursor-pointer"
                          style={{ color: person.favourite ? '#e53935' : '#9ca3af' }}
                          fill={person.favourite ? '#e53935' : 'none'}
                        />
                        <Trash2 size={15} onClick={() => confirmDelete(person._id)} className="cursor-pointer text-red-500" />
                        <Edit2 size={15} onClick={() => openEdit(person)} className="cursor-pointer text-indigo-500" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 text-base mb-1.5">{person.name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Phone size={12} /> {person.number}
                      </div>
                      {person.reference && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <FileText size={12} /> {person.reference}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center mb-3">
                      <div className="rounded-lg px-4 py-2 text-center" style={{ backgroundColor: `${colors.text}1a` }}>
                        <p className="font-bold text-sm" style={{ color: colors.text }}>{money(net)}</p>
                      </div>
                    </div>

                    <div
                      onClick={() => navigate(`/billing/finance/payables-receivables/${person._id}`)}
                      className="flex items-center justify-center gap-1.5 pt-3 border-t border-black/10 text-xs font-medium cursor-pointer"
                      style={{ color: colors.text }}
                    >
                      <Eye size={13} /> View Details
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Create Person Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Person">
        <form onSubmit={handleCreatePerson} className="space-y-4">
          <Alert message={formError} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name *</label>
            <input
              type="text" required value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Enter person name"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
            <input
              type="tel" required value={createForm.number}
              onChange={(e) => setCreateForm({ ...createForm, number: e.target.value })}
              placeholder="Enter phone number"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reference *</label>
            <input
              type="text" required value={createForm.reference}
              onChange={(e) => setCreateForm({ ...createForm, reference: e.target.value })}
              placeholder="Enter reference"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Person'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Person Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Person">
        <form onSubmit={handleEditPerson} className="space-y-4">
          <Alert message={formError} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name *</label>
            <input
              type="text" required value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
            <input
              type="tel" required value={editForm.number}
              onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reference *</label>
            <input
              type="text" required value={editForm.reference}
              onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Updating...' : 'Update Person'}</Button>
          </div>
        </form>
      </Modal>

      {/* Give Credit Modal */}
      <Modal open={showGive} onClose={() => setShowGive(false)} title="Give Credit">
        <form onSubmit={handleGiveCredit} className="space-y-4">
          <Alert message={formError} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Person *</label>
            <select
              required value={creditForm.personId}
              onChange={(e) => setCreditForm({ ...creditForm, personId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">Select a person</option>
              {sortedPersonOptions.map((p) => (
                <option key={p._id} value={p._id}>{p.name} — {p.number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount (PKR) *</label>
            <div className="relative">
              <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" min="0" step="0.01" required value={creditForm.amount}
                onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <input
              type="text" value={creditForm.description}
              onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
              placeholder="Enter description"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <PaymentSection />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowGive(false)}>Cancel</Button>
            <Button type="submit" variant="success" disabled={submitting}>{submitting ? 'Processing...' : 'Give Credit'}</Button>
          </div>
        </form>
      </Modal>

      {/* Take Credit Modal */}
      <Modal open={showTake} onClose={() => setShowTake(false)} title="Take Credit">
        <form onSubmit={handleTakeCredit} className="space-y-4">
          <Alert message={formError} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Person *</label>
            <select
              required value={creditForm.personId}
              onChange={(e) => setCreditForm({ ...creditForm, personId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">Select a person</option>
              {sortedPersonOptions.map((p) => (
                <option key={p._id} value={p._id}>{p.name} — {p.number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount (PKR) *</label>
            <div className="relative">
              <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" min="0" step="0.01" required value={creditForm.amount}
                onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <input
              type="text" value={creditForm.description}
              onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
              placeholder="Enter description"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <PaymentSection />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowTake(false)}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={submitting}>{submitting ? 'Processing...' : 'Take Credit'}</Button>
          </div>
        </form>
      </Modal>

      {/* Verify Password (before delete) Modal */}
      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Verify Password">
        <p className="text-sm text-gray-500 mb-4">Enter your account password to delete this person.</p>
        <Alert message={formError} />
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
          <input
            type="password" autoFocus value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowVerify(false)} disabled={submitting}>Cancel</Button>
          <Button variant="danger" onClick={handleVerifyAndDelete} disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify & Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}