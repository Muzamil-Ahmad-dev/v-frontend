import React, { useEffect, useState } from 'react';
import { expenseAPI } from '@/shared/api/expense';
import { toast } from 'react-toastify';

const CommitteePage = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [totalFund, setTotalFund] = useState(0);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    memberName: '',
  });

  const [formData, setFormData] = useState({
    memberName: '',
    amount: '',
    type: 'contribution', // contribution, withdrawal, dividend
    date: '',
    description: '',
    reference: '',
  });

  useEffect(() => {
    fetchCommitteeRecords();
  }, [filters.startDate, filters.endDate]);

  const fetchCommitteeRecords = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getAll();
      const committee = response?.data?.filter(item => item.type === 'committee') || [];
      setEntries(committee);
      applyFilters(committee);
      
      const total = committee.reduce((sum, item) => {
        return sum + (item.type === 'contribution' ? item.amount : -item.amount);
      }, 0);
      setTotalFund(total);
    } catch (error) {
      toast.error('Failed to fetch committee records');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;

    if (filters.memberName) {
      filtered = filtered.filter(item =>
        item.memberName?.toLowerCase().includes(filters.memberName.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();

    if (!formData.memberName || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        type: 'committee',
      };

      await expenseAPI.create(payload);
      toast.success('Committee record added successfully');
      resetForm();
      fetchCommitteeRecords();
    } catch (error) {
      toast.error('Failed to add committee record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await expenseAPI.delete(id);
        toast.success('Record deleted successfully');
        fetchCommitteeRecords();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      memberName: '',
      amount: '',
      type: 'contribution',
      date: '',
      description: '',
      reference: '',
    });
    setFormVisible(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Committee Ledger</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Entry
          </button>
        </div>

        {/* Fund Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-lg">Total Fund</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              Rs. {totalFund?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-lg">Total Entries</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{filteredEntries.length}</p>
          </div>
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
              value={filters.memberName}
              onChange={(e) => { setFilters({ ...filters, memberName: e.target.value }); applyFilters(entries); }}
              placeholder="Search member..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Add Committee Entry</h2>
            <form onSubmit={handleSaveRecord} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                placeholder="Member Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                <option value="contribution">Contribution</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="dividend">Dividend</option>
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Member Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Reference</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((item, idx) => (
                    <tr key={item._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">{item.memberName}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.type === 'contribution' ? 'bg-green-600' : item.type === 'dividend' ? 'bg-blue-600' : 'bg-red-600'
                        }`}>
                          {item.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        Rs. {item.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{item.reference}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleDeleteRecord(item._id)}
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

export default CommitteePage;
