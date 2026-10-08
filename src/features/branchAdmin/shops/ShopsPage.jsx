import { useState, useEffect, useCallback, useRef } from 'react';
import { branchAdminShopApi, branchAdminApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Button, Modal, Badge } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, Sparkles, Inbox, Edit3, Trash2, Image as ImageIcon, MapPin, Phone } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 } }),
};

const STATUS_COLOR = { ACTIVE: 'green', PENDING: 'yellow', DEACTIVATED: 'gray' };

const EMPTY_FORM = { shopOwnerId: '', name: '', description: '', category: '', address: '', phone: '' };

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogoFor, setUploadingLogoFor] = useState(null);
  const fileInputRef = useRef(null);
  const logoTargetRef = useRef(null);

  const fetchShops = useCallback(() => {
    setLoading(true);
    branchAdminShopApi.list()
      .then((res) => setShops(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchShops(); }, [fetchShops]);

  useEffect(() => {
    branchAdminApi.listShopOwners()
      .then((res) => setShopOwners(res.data?.shopOwners || res.data || []))
      .catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, shopOwnerId: shopOwners[0]?._id || '' }); setFormError(''); setModalOpen(true); };
  const openEdit = (shop) => {
    setEditing(shop);
    setForm({
      shopOwnerId: shop.shopOwnerId?._id || shop.shopOwnerId || '',
      name: shop.name || '', description: shop.description || '', category: shop.category || '',
      address: shop.address || '', phone: shop.phone || '',
    });
    setFormError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Shop name is required.'); return; }
    if (!editing && !form.shopOwnerId) { setFormError('Please select a shop owner.'); return; }
    setSaving(true); setFormError('');
    try {
      if (editing) {
        const { shopOwnerId, ...rest } = form;
        await branchAdminShopApi.update(editing._id, rest);
      } else {
        await branchAdminShopApi.create(form);
      }
      setModalOpen(false); fetchShops();
    } catch (err) { setFormError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (shop) => {
    if (!window.confirm(`Delete shop "${shop.name}"?`)) return;
    try { await branchAdminShopApi.remove(shop._id); fetchShops(); }
    catch (err) { setError(err.message); }
  };

  const triggerLogoUpload = (shop) => {
    logoTargetRef.current = shop;
    fileInputRef.current?.click();
  };

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    const shop = logoTargetRef.current;
    if (!file || !shop) return;
    setUploadingLogoFor(shop._id);
    try {
      await branchAdminShopApi.uploadLogo(shop._id, file);
      fetchShops();
    } catch (err) { setError(err.message); }
    finally { setUploadingLogoFor(null); e.target.value = ''; }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex items-start sm:items-center justify-between gap-3 mb-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={16} className="text-indigo-500" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Shops</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 ml-6">Shops registered under your branch</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-500/25 shrink-0"
        >
          <Plus size={13} />Add Shop
        </motion.button>
      </motion.div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />

      <Alert type="error" message={error} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Shop' : 'Add Shop'}>
        <div className="space-y-3">
          <Alert type="error" message={formError} />
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Shop owner *</label>
              <select
                value={form.shopOwnerId} onChange={set('shopOwnerId')}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">Select a shop owner</option>
                {shopOwners.map((o) => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Shop name *</label>
            <input value={form.name} onChange={set('name')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <input value={form.category} onChange={set('category')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={set('phone')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address} onChange={set('address')} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Shop'}</Button>
          </div>
        </div>
      </Modal>

      {loading ? <Spinner /> : shops.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Inbox size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">No shops yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {shops.map((shop, i) => (
              <motion.div key={shop._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => triggerLogoUpload(shop)}
                      className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white shrink-0 relative group"
                      title="Click to upload logo"
                    >
                      {shop.logo ? (
                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        uploadingLogoFor === shop._id ? <Spinner /> : <Store size={16} />
                      )}
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ImageIcon size={12} className="text-white" />
                      </span>
                    </button>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{shop.name}</p>
                      {shop.category && <p className="text-[11px] text-gray-400 truncate">{shop.category}</p>}
                    </div>
                  </div>
                  <Badge color={STATUS_COLOR[shop.status] || 'gray'}>{shop.status}</Badge>
                </div>
                {shop.address && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <MapPin size={10} className="text-gray-400 shrink-0" /><span className="truncate">{shop.address}</span>
                  </p>
                )}
                {shop.phone && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Phone size={10} className="text-gray-400 shrink-0" />{shop.phone}
                  </p>
                )}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(shop)} className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50 hover:bg-indigo-100">
                    <Edit3 size={10} />Edit
                  </button>
                  <button onClick={() => handleDelete(shop)} className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={10} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
