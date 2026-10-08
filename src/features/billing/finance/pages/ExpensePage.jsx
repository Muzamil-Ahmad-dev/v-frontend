 import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Plus, Search, Landmark, Wallet, Layers, Ban,
  Calendar, X, ListChecks, AlertTriangle, Inbox,
} from 'lucide-react';
import { Card, Alert, Spinner, Button, Badge } from '../../../../shared/components/ui.jsx';
import {
  expenseLedgerApi,
  banksLedgerApi,
  pocketCashLedgerApi,
} from '../../../../shared/api/staff.js';

const PAYMENT_METHODS = [
  { key: 'none',   label: 'No Payment',   icon: Ban },
  { key: 'bank',   label: 'Bank Account', icon: Landmark },
  { key: 'pocket', label: 'Pocket Cash',  icon: Wallet },
  { key: 'split',  label: 'Split Payment', icon: Layers },
];

const emptyExpenseForm = {
  expenseTypeId: '',
  price: '',
  note: '',
  date: '',
  paymentMethod: 'none',
  bankAccountUsed: '',
  accountCash: '',
  pocketCash: '',
};

function money(n) {
  return `PKR ${Number(n || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

export default function ExpensePage() {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalAmount: 0 });
  const [banks, setBanks] = useState([]);
  const [pocketCashBalance, setPocketCashBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [form, setForm] = useState(emptyExpenseForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });
  const [typeError, setTypeError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilters, setDateFilters] = useState({ startDate: '', endDate: '' });

  const selectedBank = useMemo(
    () => banks.find((b) => b._id === form.bankAccountUsed) || null,
    [banks, form.bankAccountUsed]
  );

  const fetchExpenseTypes = async () => {
    try {
      const res = await expenseLedgerApi.listTypes();
      setExpenseTypes(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setExpenseTypes([]);
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

  const fetchPocketCashBalance = async () => {
    try {
      const res = await pocketCashLedgerApi.getTotal();
      setPocketCashBalance(res?.total || 0);
    } catch {
      setPocketCashBalance(0);
    }
  };

  const fetchExpenses = async (params = {}) => {
    try {
      const queryParams = {};
      if (dateFilters.startDate) queryParams.startDate = dateFilters.startDate;
      if (dateFilters.endDate) queryParams.endDate = dateFilters.endDate;
      const res = await expenseLedgerApi.list({ ...queryParams, ...params });
      if (res?.success) {
        setSummary({ count: res.count || 0, totalAmount: res.totalAmount || 0 });
        setExpenses(res.data || []);
      }
    } catch (err) {
      setPageError(err.message || 'Failed to load expenses.');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchExpenseTypes(), fetchExpenses(), fetchBanks(), fetchPocketCashBalance()])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilters.startDate, dateFilters.endDate]);

  const handleCreateExpenseType = async () => {
    setTypeError('');
    if (!newType.name.trim()) {
      setTypeError('Expense type name is required.');
      return;
    }
    try {
      await expenseLedgerApi.createType({
        name: newType.name.trim(),
        description: newType.description.trim() || undefined,
      });
      setNewType({ name: '', description: '' });
      setIsCreatingType(false);
      fetchExpenseTypes();
    } catch (err) {
      setTypeError(err.message || 'Failed to create type.');
    }
  };

  const setPaymentMethod = (method) => {
    setForm((f) => ({
      ...f,
      paymentMethod: method,
      bankAccountUsed: '',
      accountCash: '',
      pocketCash: '',
    }));
  };

  const handleCreateExpense = async () => {
    setFormError('');
    setFormSuccess('');
    if (!form.expenseTypeId || !form.price) return;

    const price = Number(form.price);
    const accountCash = form.accountCash ? Number(form.accountCash) : 0;
    const pocketCash = form.pocketCash ? Number(form.pocketCash) : 0;
    const totalPayment = accountCash + pocketCash;

    if (form.paymentMethod !== 'none' && totalPayment > price) {
      setFormError('Total payment amount (bank + pocket cash) cannot exceed the expense price.');
      return;
    }
    if (form.paymentMethod === 'bank' && !form.bankAccountUsed) {
      setFormError('Please select a bank account.');
      return;
    }
    if (form.paymentMethod === 'bank' && !accountCash) {
      setFormError('Please enter the amount to pay from the bank.');
      return;
    }
    if (form.paymentMethod === 'pocket' && !pocketCash) {
      setFormError('Please enter the amount to pay from pocket cash.');
      return;
    }
    if (form.paymentMethod === 'split' && (!form.bankAccountUsed || !accountCash || !pocketCash)) {
      setFormError('Please fill all payment fields for a split payment.');
      return;
    }

    const payload = {
      expenseTypeId: form.expenseTypeId,
      price,
      note: form.note || undefined,
      date: form.date || undefined,
    };
    if (form.paymentMethod !== 'none') {
      if (form.bankAccountUsed) {
        payload.bankAccountUsed = form.bankAccountUsed;
        payload.accountCash = accountCash;
      }
      if (pocketCash > 0) payload.pocketCash = pocketCash;
    }

    setSaving(true);
    try {
      await expenseLedgerApi.create(payload);
      setFormSuccess('Expense added successfully.');
      setForm(emptyExpenseForm);
      fetchExpenses();
      fetchPocketCashBalance();
      fetchBanks();
    } catch (err) {
      setFormError(err.message || 'Failed to add expense.');
    } finally {
      setSaving(false);
    }
  };

  const setQuickDateFilter = (period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = '';
    let endDate = '';
    if (period === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = startDate;
    } else if (period === 'week') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    } else if (period === 'month') {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 1);
      startDate = d.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }
    setDateFilters({ startDate, endDate });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilters({ startDate: '', endDate: '' });
  };

  const filteredExpenses = expenses.filter((exp) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase().trim();
    const typeName = (exp.expenseType?.name || '').toLowerCase();
    const note = (exp.note || '').toLowerCase();
    const description = (exp.expenseType?.description || '').toLowerCase();
    return typeName.includes(s) || note.includes(s) || description.includes(s);
  });

  const paymentTotal = Number(form.accountCash || 0) + Number(form.pocketCash || 0);
  const paymentExceeds = form.paymentMethod !== 'none' && paymentTotal > Number(form.price || 0);
  const canSubmit = !!form.expenseTypeId && !!form.price && !saving;

  const filtersActive = !!(searchTerm || dateFilters.startDate || dateFilters.endDate);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <Card className="p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Receipt className="text-sky-500" size={26} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Expense Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track, manage, and analyze all your business expenses in one place
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-xl px-6 py-4 shadow-lg shadow-sky-500/20 min-w-[160px]">
              <div className="text-xs opacity-90">Total Records</div>
              <div className="text-2xl font-bold">{summary.count}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl px-6 py-4 shadow-lg shadow-emerald-500/20 min-w-[200px]">
              <div className="text-xs opacity-90">Total Amount</div>
              <div className="text-2xl font-bold">{money(summary.totalAmount)}</div>
            </div>
            <div className="bg-gradient-to-br from-violet-500 to-violet-700 text-white rounded-xl px-6 py-4 shadow-lg shadow-violet-500/20 min-w-[180px]">
              <div className="text-xs opacity-90">Pocket Cash Balance</div>
              <div className="text-2xl font-bold">{money(pocketCashBalance)}</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Alert message={pageError} />

      {/* Add Expense */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
      >
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-6">
            Add New Expense
          </h2>

          <Alert message={formError} />
          {formSuccess && <Alert type="success" message={formSuccess} />}

          <div className="grid gap-5 sm:grid-cols-2 mt-4">
            {/* Expense Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expense Type</label>
              <div className="flex gap-2">
                <select
                  value={form.expenseTypeId}
                  onChange={(e) => setForm({ ...form, expenseTypeId: e.target.value })}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
                >
                  <option value="">Select expense type...</option>
                  {expenseTypes.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCreatingType((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 text-white text-xs font-semibold rounded-xl shadow-sm shadow-violet-500/25 hover:bg-violet-700 whitespace-nowrap"
                >
                  <Plus size={13} /> New Type
                </button>
              </div>

              <AnimatePresence>
                {isCreatingType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-gray-50 border border-gray-200/70 rounded-xl">
                      <Alert message={typeError} />
                      <input
                        type="text"
                        placeholder="Type name (e.g. Rent, Salary, Utilities)"
                        value={newType.name}
                        onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newType.description}
                        onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                      <div className="flex justify-end">
                        <Button variant="success" size="sm" onClick={handleCreateExpenseType}>Save Type</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date (optional)</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
              />
            </div>

            {/* Note */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Note (optional)</label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Add a short description..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-300 transition-all"
              />
            </div>

            {/* Payment Method */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Method (optional)</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.paymentMethod === key
                        ? 'border-sky-400 bg-sky-50 text-sky-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={key}
                      checked={form.paymentMethod === key}
                      onChange={() => setPaymentMethod(key)}
                      className="hidden"
                    />
                    <Icon size={14} />
                    {label}
                  </label>
                ))}
              </div>

              {(form.paymentMethod === 'bank' || form.paymentMethod === 'split') && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200/70 rounded-xl">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bank Account</label>
                  <select
                    value={form.bankAccountUsed}
                    onChange={(e) => setForm({ ...form, bankAccountUsed: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  >
                    <option value="">-- Select Bank --</option>
                    {banks.map((bank) => (
                      <option key={bank._id} value={bank._id}>
                        {bank.bankName} - {bank.accountType}
                        {bank.currentBalance !== undefined
                          ? ` (Balance: ${money(bank.currentBalance)})`
                          : bank.accountCash !== undefined
                            ? ` (Balance: ${money(bank.accountCash)})`
                            : ''}
                      </option>
                    ))}
                  </select>
                  {selectedBank && (
                    <div className="text-xs text-gray-500 mb-2">
                      Available Balance: {money(selectedBank.currentBalance ?? selectedBank.accountCash)}
                    </div>
                  )}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.accountCash}
                    onChange={(e) => setForm({ ...form, accountCash: e.target.value })}
                    placeholder="Amount from bank"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
              )}

              {(form.paymentMethod === 'pocket' || form.paymentMethod === 'split') && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200/70 rounded-xl">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pocket Cash</label>
                  <div className="text-xs text-gray-500 mb-2">
                    Available Balance: {money(pocketCashBalance)}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pocketCash}
                    onChange={(e) => setForm({ ...form, pocketCash: e.target.value })}
                    placeholder="Amount from pocket cash"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
              )}

              {form.paymentMethod !== 'none' && form.price && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 space-y-1">
                  <div><strong>Expense Amount:</strong> {money(form.price)}</div>
                  <div><strong>Total Payment:</strong> {money(paymentTotal)}</div>
                  {paymentExceeds && (
                    <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                      <AlertTriangle size={14} /> Total payment exceeds expense amount!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <Button
              variant={canSubmit ? 'primary' : 'secondary'}
              size="lg"
              disabled={!canSubmit}
              onClick={handleCreateExpense}
              className="!bg-orange-500 hover:!bg-orange-600 disabled:!bg-gray-300"
            >
              {saving ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      >
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-6">
            All Expenses
          </h2>

          {/* Search + Filters */}
          <div className="mb-6 p-5 bg-gray-50 border border-gray-200/70 rounded-xl">
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div className="sm:col-span-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <Search size={13} /> Search Expenses
                </label>
                <input
                  type="text"
                  placeholder="Search by type name, note, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <Calendar size={13} /> From Date
                </label>
                <input
                  type="date"
                  value={dateFilters.startDate}
                  onChange={(e) => setDateFilters({ ...dateFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <Calendar size={13} /> To Date
                </label>
                <input
                  type="date"
                  value={dateFilters.endDate}
                  min={dateFilters.startDate || undefined}
                  onChange={(e) => setDateFilters({ ...dateFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 mr-1 inline-flex items-center gap-1">
                <ListChecks size={13} /> Quick Filters:
              </span>
              <button onClick={() => setQuickDateFilter('today')} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 shadow-sm">Today</button>
              <button onClick={() => setQuickDateFilter('week')} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-sm">This Week</button>
              <button onClick={() => setQuickDateFilter('month')} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-500 hover:bg-violet-600 shadow-sm">This Month</button>
              {filtersActive && (
                <button onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100">
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>

            {filtersActive && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700">
                <strong>Active Filters:</strong>{' '}
                {searchTerm && `Search: "${searchTerm}"`}
                {searchTerm && (dateFilters.startDate || dateFilters.endDate) && ' | '}
                {dateFilters.startDate && `From: ${formatDate(dateFilters.startDate)}`}
                {dateFilters.startDate && dateFilters.endDate && ' | '}
                {dateFilters.endDate && `To: ${formatDate(dateFilters.endDate)}`}{' '}
                <span className="text-gray-500">
                  ({filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Inbox size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                {expenses.length === 0
                  ? 'No expenses found. Add your first expense above.'
                  : 'No expenses match your search criteria. Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                    <th className="px-4 py-3 font-semibold rounded-l-lg">Date</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredExpenses.map((exp, idx) => (
                      <motion.tr
                        key={exp.id || exp._id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-4 py-3 text-gray-700">{formatDate(exp.date)}</td>
                        <td className="px-4 py-3">
                          <Badge color="green">{exp.expenseType?.name || '-'}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {exp.note || exp.expenseType?.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {Number(exp.price || 0).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}