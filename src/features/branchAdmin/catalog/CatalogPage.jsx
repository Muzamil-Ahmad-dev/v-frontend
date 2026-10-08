 import { useState, useEffect, useCallback } from 'react';
import { branchAdminCatalogApi } from '../../../shared/api/branchAdmin.js';
import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Plus, Sparkles, Inbox, Edit3, Trash2, ChevronRight, Smartphone } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 } }),
};

export default function CatalogPage() {
  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState('');

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companyFormError, setCompanyFormError] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [modelName, setModelName] = useState('');
  const [modelFormError, setModelFormError] = useState('');
  const [savingModel, setSavingModel] = useState(false);

  const fetchCompanies = useCallback(() => {
    setLoadingCompanies(true);
    branchAdminCatalogApi.companies.list()
      .then((res) => {
        const list = res.data || [];
        setCompanies(list);
        if (!selectedCompany && list.length > 0) setSelectedCompany(list[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCompanies(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const fetchModels = useCallback(() => {
    if (!selectedCompany) { setModels([]); return; }
    setLoadingModels(true);
    branchAdminCatalogApi.models.list({ companyId: selectedCompany._id })
      .then((res) => setModels(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingModels(false));
  }, [selectedCompany]);
  useEffect(() => { fetchModels(); }, [fetchModels]);

  // ── Company CRUD ──────────────────────────────────────────────────────────
  const openCreateCompany = () => { setEditingCompany(null); setCompanyName(''); setCompanyFormError(''); setCompanyModalOpen(true); };
  const openEditCompany = (c) => { setEditingCompany(c); setCompanyName(c.name); setCompanyFormError(''); setCompanyModalOpen(true); };

  const saveCompany = async () => {
    if (!companyName.trim()) { setCompanyFormError('Company name is required.'); return; }
    setSavingCompany(true); setCompanyFormError('');
    try {
      if (editingCompany) await branchAdminCatalogApi.companies.update(editingCompany._id, { name: companyName });
      else await branchAdminCatalogApi.companies.create({ name: companyName });
      setCompanyModalOpen(false); fetchCompanies();
    } catch (err) { setCompanyFormError(err.message); } finally { setSavingCompany(false); }
  };

  const deleteCompany = async (c) => {
    if (!window.confirm(`Delete "${c.name}" and all its models?`)) return;
    try {
      await branchAdminCatalogApi.companies.remove(c._id);
      if (selectedCompany?._id === c._id) setSelectedCompany(null);
      fetchCompanies();
    } catch (err) { setError(err.message); }
  };

  // ── Model CRUD ────────────────────────────────────────────────────────────
  const openCreateModel = () => { setEditingModel(null); setModelName(''); setModelFormError(''); setModelModalOpen(true); };
  const openEditModel = (m) => { setEditingModel(m); setModelName(m.name); setModelFormError(''); setModelModalOpen(true); };

  const saveModel = async () => {
    if (!modelName.trim()) { setModelFormError('Model name is required.'); return; }
    if (!selectedCompany) { setModelFormError('Select a company first.'); return; }
    setSavingModel(true); setModelFormError('');
    try {
      if (editingModel) await branchAdminCatalogApi.models.update(editingModel._id, { name: modelName });
      else await branchAdminCatalogApi.models.create({ name: modelName, companyId: selectedCompany._id });
      setModelModalOpen(false); fetchModels();
    } catch (err) { setModelFormError(err.message); } finally { setSavingModel(false); }
  };

  const deleteModel = async (m) => {
    if (!window.confirm(`Delete model "${m.name}"?`)) return;
    try { await branchAdminCatalogApi.models.remove(m._id); fetchModels(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={16} className="text-indigo-500" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Catalog</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 ml-6">Brand & phone model reference data, shared with your Admin</p>
      </motion.div>

      <Alert type="error" message={error} />

      <Modal open={companyModalOpen} onClose={() => setCompanyModalOpen(false)} title={editingCompany ? 'Edit Company' : 'Add Company'}>
        <div className="space-y-3">
          <Alert type="error" message={companyFormError} />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company / Brand name *</label>
            <input
              value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Samsung"
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCompanyModalOpen(false)}>Cancel</Button>
            <Button onClick={saveCompany} disabled={savingCompany}>{savingCompany ? 'Saving...' : editingCompany ? 'Save Changes' : 'Add Company'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modelModalOpen} onClose={() => setModelModalOpen(false)} title={editingModel ? 'Edit Model' : `Add Model to ${selectedCompany?.name || ''}`}>
        <div className="space-y-3">
          <Alert type="error" message={modelFormError} />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Model name *</label>
            <input
              value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="e.g. Galaxy S24"
              className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModelModalOpen(false)}>Cancel</Button>
            <Button onClick={saveModel} disabled={savingModel}>{savingModel ? 'Saving...' : editingModel ? 'Save Changes' : 'Add Model'}</Button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Companies list */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <Tags size={12} />Companies
            </span>
            <button onClick={openCreateCompany} className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50">
              <Plus size={14} />
            </button>
          </div>
          {loadingCompanies ? <Spinner /> : companies.length === 0 ? (
            <div className="flex flex-col items-center py-8 px-4">
              <Inbox size={20} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">No companies yet</p>
            </div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto">
              <AnimatePresence>
                {companies.map((c, i) => (
                  <motion.div key={c._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                    onClick={() => setSelectedCompany(c)}
                    className={`group flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer border-b border-gray-50 transition-colors ${
                      selectedCompany?._id === c._id ? 'bg-indigo-50/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-medium truncate ${selectedCompany?._id === c._id ? 'text-indigo-700' : 'text-gray-700'}`}>{c.name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); openEditCompany(c); }} className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Edit3 size={11} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteCompany(c); }} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    {selectedCompany?._id === c._id && <ChevronRight size={13} className="text-indigo-400 shrink-0" />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Models for selected company */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={12} />
              Models{selectedCompany ? ` — ${selectedCompany.name}` : ''}
            </span>
            <button
              onClick={openCreateModel} disabled={!selectedCompany}
              className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>
          {!selectedCompany ? (
            <div className="flex flex-col items-center py-14 px-4">
              <p className="text-xs text-gray-400">Select a company to view its models</p>
            </div>
          ) : loadingModels ? <Spinner /> : models.length === 0 ? (
            <div className="flex flex-col items-center py-14 px-4">
              <Inbox size={20} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">No models yet for {selectedCompany.name}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
              <AnimatePresence>
                {models.map((m, i) => (
                  <motion.div key={m._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                    className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-indigo-200/60 hover:bg-indigo-50/40 transition-colors"
                  >
                    <span className="text-sm text-gray-700 truncate">{m.name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEditModel(m)} className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Edit3 size={11} />
                      </button>
                      <button onClick={() => deleteModel(m)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
