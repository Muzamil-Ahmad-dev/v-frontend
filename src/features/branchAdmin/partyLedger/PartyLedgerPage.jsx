import React, { useEffect, useState } from 'react';
import { invoice } from '@/shared/api/invoice';
import { toast } from 'react-toastify';

const PartyLedgerPage = () => {
  const [ledgers, setLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    partyName: '',
    type: 'all', // all, supplier, customer
    searchTerm: '',
  });

  const [formData, setFormData] = useState({
    partyName: '',
    partyType: 'customer', // customer, supplier
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    balance: '',
    notes: '',
  });

  useEffect(() => {
    fetchPartyLedgers();
  }, []);

  const fetchPartyLedgers = async () => {
    setLoading(true);
    try {
      const response = await invoice.getAll();
      const parties = response?.data || [];
      setLedgers(parties);
      applyFilters(parties);
    } catch (error) {
      toast.error('Failed to fetch party ledger');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;

    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.partyType === filters.type);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.partyName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.contactPerson?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredLedgers(filtered);
  };

  const handleSaveParty = async (e) => {
    e.preventDefault();

    if (!formData.partyName) {
      toast.error('Party name is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
      };

      if (editingId) {
        await invoice.update(editingId, payload);
        toast.success('Party updated successfully');
        setEditingId(null);
      } else {
        await invoice.create(payload);
        toast.success('Party added successfully');
      }

      resetForm();
      fetchPartyLedgers();
    } catch (error) {
      toast.error('Failed to save party');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      partyName: item.partyName,
      partyType: item.partyType,
      contactPerson: item.contactPerson,
      phone: item.phone,
      email: item.email,
      address: item.address,
      balance: item.balance,
      notes: item.notes,
    });
    setEditingId(item._id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      try {
        await invoice.delete(id);
        toast.success('Party deleted successfully');
        fetchPartyLedgers();
      } catch (error) {
        toast.error('Failed to delete party');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      partyName: '',
      partyType: 'customer',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      balance: '',
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
          <h1 className="text-3xl font-bold text-gray-900">Party Ledger</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Party
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); applyFilters(ledgers); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
            </select>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => { setFilters({ ...filters, searchTerm: e.target.value }); applyFilters(ledgers); }}
              placeholder="Search party..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form */}
        {formVisible && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Party</h2>
            <form onSubmit={handleSaveParty} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                placeholder="Party Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.partyType}
                onChange={(e) => setFormData({ ...formData, partyType: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Contact Person"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="Balance"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
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
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Party Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Balance</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                      No parties found
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((item, idx) => (
                    <tr key={item._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">{item.partyName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.partyType === 'customer' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}>
                          {item.partyType?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.contactPerson}</td>
                      <td className="px-4 py-3 text-gray-600">{item.phone}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        Rs. {item.balance?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
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

export default PartyLedgerPage;
