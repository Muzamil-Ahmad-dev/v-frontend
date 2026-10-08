import React, { useEffect, useState } from 'react';
import { ledgerAPI } from '@/shared/api/ledger';
import { toast } from 'react-toastify';

const LedgerPage = () => {
  const [ledgers, setLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ count: 0, totalAmount: 0 });
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: '',
    type: 'all',
  });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'debit', // debit, credit
    reference: '',
    notes: '',
  });

  useEffect(() => {
    fetchLedgers();
  }, [filters.startDate, filters.endDate]);

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await ledgerAPI.getAll(params);
      if (response?.data) {
        setLedgers(response.data);
        applyFilters(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch ledger records');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.reference?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    setFilteredLedgers(filtered);
    
    const totalAmount = filtered.reduce((sum, item) => {
      return sum + (item.type === 'credit' ? item.amount : -item.amount);
    }, 0);
    
    setSummary({
      count: filtered.length,
      totalAmount: totalAmount,
    });
  };

  const handleCreateLedger = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingId) {
        await ledgerAPI.update(editingId, payload);
        toast.success('Ledger entry updated successfully');
        setEditingId(null);
      } else {
        await ledgerAPI.create(payload);
        toast.success('Ledger entry created successfully');
      }

      resetForm();
      fetchLedgers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save ledger entry');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      description: item.description,
      amount: item.amount,
      date: item.date?.split('T')[0],
      type: item.type,
      reference: item.reference,
      notes: item.notes,
    });
    setEditingId(item._id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await ledgerAPI.delete(id);
        toast.success('Ledger entry deleted successfully');
        fetchLedgers();
      } catch (error) {
        toast.error('Failed to delete ledger entry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: '',
      type: 'debit',
      reference: '',
      notes: '',
    });
    setEditingId(null);
    setFormVisible(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ledger Records</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Entry
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Entries</p>
            <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">Rs. {summary.totalAmount?.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">This Period</p>
            <p className="text-2xl font-bold text-blue-600">{ledgers.length}</p>
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
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => { setFilters({ ...filters, searchTerm: e.target.value }); applyFilters(ledgers); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
            />
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); applyFilters(ledgers); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>

        {/* Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Ledger Entry</h2>
            <form onSubmit={handleCreateLedger} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
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
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Reference"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes"
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Reference</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No ledger entries found
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((item, idx) => (
                    <tr key={item._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.type === 'credit' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {item.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rs. {item.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.reference}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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

export default LedgerPage;
