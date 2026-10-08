import React, { useEffect, useState } from 'react';
import { expenseAPI } from '@/shared/api/expense';
import { toast } from 'react-toastify';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [summary, setSummary] = useState({ count: 0, totalAmount: 0 });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    searchTerm: '',
  });

  const [formData, setFormData] = useState({
    expenseCategory: '',
    amount: '',
    date: '',
    description: '',
    paymentMethod: 'cash', // cash, bank, check
    bankAccount: '',
    reference: '',
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [filters.startDate, filters.endDate]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await expenseAPI.getAll(params);
      setExpenses(response?.data || []);
      applyFilters(response?.data || []);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expenseAPI.getAll();
      const uniqueCategories = [...new Set(response?.data?.map(e => e.expenseCategory) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.expenseCategory === filters.category);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.reference?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);

    const totalAmount = filtered.reduce((sum, item) => sum + (item.amount || 0), 0);
    setSummary({
      count: filtered.length,
      totalAmount: totalAmount,
    });
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    if (!formData.expenseCategory || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      await expenseAPI.create(payload);
      toast.success('Expense created successfully');
      resetForm();
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      expenseCategory: '',
      amount: '',
      date: '',
      description: '',
      paymentMethod: 'cash',
      bankAccount: '',
      reference: '',
    });
    setFormVisible(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-red-600">Rs. {summary.totalAmount?.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">This Period</p>
            <p className="text-2xl font-bold text-orange-600">{expenses.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-4 gap-4">
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
            <select
              value={filters.category}
              onChange={(e) => { setFilters({ ...filters, category: e.target.value }); applyFilters(expenses); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => { setFilters({ ...filters, searchTerm: e.target.value }); applyFilters(expenses); }}
              placeholder="Search..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleCreateExpense} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.expenseCategory}
                onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                placeholder="Category"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="check">Check</option>
              </select>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Reference Number"
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Payment</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item, idx) => (
                    <tr key={item._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.expenseCategory}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        Rs. {item.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{item.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteExpense(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </td>
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

export default ExpensePage;
