import React, { useEffect, useState } from 'react';
import { purchaseAPI } from '@/shared/api/purchase';
import { invoiceAPI } from '@/shared/api/invoice';
import { toast } from 'react-toastify';

const PurchasePage = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all', // all, pending, completed
    searchTerm: '',
  });

  const [formData, setFormData] = useState({
    vendorName: '',
    phone: '',
    amount: '',
    date: '',
    description: '',
    items: [],
    status: 'pending', // pending, completed
    reference: '',
  });

  useEffect(() => {
    fetchPurchases();
  }, [filters.startDate, filters.endDate]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await purchaseAPI.getAll(params);
      setPurchases(response?.data || []);
      applyFilters(response?.data || []);
    } catch (error) {
      toast.error('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.vendorName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.reference?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredPurchases(filtered);

    const total = filtered.reduce((sum, item) => sum + (item.amount || 0), 0);
    setTotalAmount(total);
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();

    if (!formData.vendorName || !formData.amount) {
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
        await purchaseAPI.update(editingId, payload);
        toast.success('Purchase updated successfully');
        setEditingId(null);
      } else {
        await purchaseAPI.create(payload);
        toast.success('Purchase created successfully');
      }

      resetForm();
      fetchPurchases();
    } catch (error) {
      toast.error('Failed to save purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      vendorName: item.vendorName,
      phone: item.phone,
      amount: item.amount,
      date: item.date?.split('T')[0],
      description: item.description,
      items: item.items || [],
      status: item.status,
      reference: item.reference,
    });
    setEditingId(item._id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await purchaseAPI.delete(id);
        toast.success('Purchase deleted successfully');
        fetchPurchases();
      } catch (error) {
        toast.error('Failed to delete purchase');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vendorName: '',
      phone: '',
      amount: '',
      date: '',
      description: '',
      items: [],
      status: 'pending',
      reference: '',
    });
    setEditingId(null);
    setFormVisible(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            New Purchase
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Purchases</p>
            <p className="text-2xl font-bold text-gray-900">{filteredPurchases.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-orange-600">Rs. {totalAmount?.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredPurchases.filter(p => p.status === 'pending').length}
            </p>
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
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); applyFilters(purchases); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => { setFilters({ ...filters, searchTerm: e.target.value }); applyFilters(purchases); }}
              placeholder="Search..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'New'} Purchase</h2>
            <form onSubmit={handleSavePurchase} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="Vendor Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                placeholder="Reference/PO Number"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description/Notes"
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
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Reference</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((item, idx) => (
                    <tr key={item._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{item.vendorName}</td>
                      <td className="px-4 py-3 text-gray-600">{item.phone}</td>
                      <td className="px-4 py-3 font-semibold">Rs. {item.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                        }`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.reference}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
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

export default PurchasePage;
