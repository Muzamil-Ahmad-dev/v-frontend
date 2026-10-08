import React, { useEffect, useState } from 'react';
import { expenseAPI } from '@/shared/api/expense';
import { toast } from 'react-toastify';

const PocketCashPage = () => {
  const [pocketCash, setPocketCash] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [balance, setBalance] = useState(0);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: '',
  });

  const [formData, setFormData] = useState({
    amount: '',
    type: 'add', // add, deduct
    date: '',
    description: '',
    reference: '',
  });

  useEffect(() => {
    fetchPocketCash();
  }, [filters.startDate, filters.endDate]);

  const fetchPocketCash = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getAll();
      const filtered = response?.data?.filter(item => item.type === 'pocketCash') || [];
      setPocketCash(filtered);
      
      const total = filtered.reduce((sum, item) => {
        return sum + (item.type === 'add' ? item.amount : -item.amount);
      }, 0);
      setBalance(total);
    } catch (error) {
      toast.error('Failed to fetch pocket cash records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPocketCash = async (e) => {
    e.preventDefault();

    if (!formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        type: 'pocketCash',
      };

      await expenseAPI.create(payload);
      toast.success('Pocket cash record created successfully');
      resetForm();
      fetchPocketCash();
    } catch (error) {
      toast.error('Failed to create pocket cash record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'add',
      date: '',
      description: '',
      reference: '',
    });
    setFormVisible(false);
  };

  const filteredCash = pocketCash.filter(item => {
    let matches = true;
    
    if (filters.searchTerm) {
      matches = matches && (
        item.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.reference?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    return matches;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pocket Cash</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Transaction
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-600 text-lg">Current Balance</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            Rs. {balance?.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm mt-2">Total Transactions: {filteredCash.length}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-3 gap-4">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              placeholder="Search..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Add Pocket Cash Transaction</h2>
            <form onSubmit={handleAddPocketCash} className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="add">Add</option>
                <option value="deduct">Deduct</option>
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Reference"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              />
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Reference</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredCash.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredCash.map((item, idx) => (
                    <tr key={item._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.type === 'add' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {item.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rs. {item.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.reference}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocketCashPage;
