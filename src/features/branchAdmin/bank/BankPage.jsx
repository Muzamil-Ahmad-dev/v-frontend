import React, { useEffect, useState } from 'react';
import { bankAPI } from '@/shared/api/bank';
import { toast } from 'react-toastify';

const BankPage = () => {
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [transactionForm, setTransactionForm] = useState(false);

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    balance: '',
    accountType: 'checking', // checking, savings, business
  });

  const [transactionData, setTransactionData] = useState({
    amount: '',
    type: 'deposit', // deposit, withdrawal
    date: '',
    description: '',
    referenceNumber: '',
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const response = await bankAPI.getAll();
      setBanks(response?.data || []);
    } catch (error) {
      toast.error('Failed to fetch banks');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankTransactions = async (bankId) => {
    try {
      const response = await bankAPI.getTransactions(bankId);
      setTransactions(response?.data || []);
      setSelectedBank(bankId);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountNumber) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
      };
      await bankAPI.create(payload);
      toast.success('Bank account added successfully');
      resetForm();
      fetchBanks();
    } catch (error) {
      toast.error('Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedBank || !transactionData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        bankId: selectedBank,
        ...transactionData,
        amount: parseFloat(transactionData.amount),
      };
      await bankAPI.create(payload);
      toast.success('Transaction added successfully');
      setTransactionData({
        amount: '',
        type: 'deposit',
        date: '',
        description: '',
        referenceNumber: '',
      });
      setTransactionForm(false);
      fetchBankTransactions(selectedBank);
    } catch (error) {
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async (id) => {
    if (window.confirm('Are you sure? This will remove the bank account.')) {
      try {
        await bankAPI.delete(id);
        toast.success('Bank account deleted successfully');
        fetchBanks();
      } catch (error) {
        toast.error('Failed to delete bank account');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      balance: '',
      accountType: 'checking',
    });
    setFormVisible(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Bank
          </button>
        </div>

        {/* Add Bank Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Add Bank Account</h2>
            <form onSubmit={handleCreateBank} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Bank Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Account Number"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Account Holder"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="Initial Balance"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="business">Business</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Bank'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="col-span-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Banks Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {banks.map((bank) => (
            <div
              key={bank._id}
              className={`p-4 rounded-lg shadow cursor-pointer transition ${
                selectedBank === bank._id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'
              }`}
              onClick={() => fetchBankTransactions(bank._id)}
            >
              <h3 className="font-bold text-lg text-gray-900">{bank.bankName}</h3>
              <p className="text-sm text-gray-600">Account: {bank.accountNumber}</p>
              <p className="text-sm text-gray-600">{bank.accountHolder}</p>
              <p className="text-xl font-bold text-green-600 mt-2">
                Rs. {bank.balance?.toLocaleString()}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBank(bank._id);
                }}
                className="mt-2 w-full px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Transactions */}
        {selectedBank && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Transactions</h2>
              <button
                onClick={() => setTransactionForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Add Transaction
              </button>
            </div>

            {/* Transaction Form */}
            {transactionForm && (
              <form onSubmit={handleAddTransaction} className="mb-6 p-4 border border-gray-300 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                    placeholder="Amount"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={transactionData.type}
                    onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                  <input
                    type="date"
                    value={transactionData.date}
                    onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={transactionData.referenceNumber}
                    onChange={(e) => setTransactionData({ ...transactionData, referenceNumber: e.target.value })}
                    placeholder="Reference Number"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={transactionData.description}
                    onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                    placeholder="Description"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                  <button
                    type="submit"
                    className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Add Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionForm(false)}
                    className="col-span-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((trans, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2">{new Date(trans.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-white text-xs ${
                            trans.type === 'deposit' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {trans.type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-semibold">Rs. {trans.amount?.toLocaleString()}</td>
                        <td className="px-4 py-2">{trans.referenceNumber}</td>
                        <td className="px-4 py-2">{trans.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankPage;
