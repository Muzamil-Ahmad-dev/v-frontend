 // import { useState, useEffect, useCallback } from 'react';
// import { branchApi } from '../../../shared/api/admin.js';
// import { Spinner, Alert, Button, Modal } from '../../../shared/components/ui.jsx';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Building2, Plus, MapPin, Phone, UserCog, Sparkles,
//   Inbox, Edit3, Trash2, Power, PowerOff, Calendar,
// } from 'lucide-react';

// const fadeUp = {
//   hidden: { opacity: 0, y: 12, scale: 0.98 },
//   visible: (i) => ({
//     opacity: 1, y: 0, scale: 1,
//     transition: { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 },
//   }),
// };

// const emptyForm = { name: '', address: '', phone: '', managerName: '' };

// function StatusBadge({ isActive }) {
//   return (
//     <span
//       className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
//         isActive
//           ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/50'
//           : 'bg-gray-100 text-gray-500 ring-gray-200/50'
//       }`}
//     >
//       <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
//       {isActive ? 'ACTIVE' : 'INACTIVE'}
//     </span>
//   );
// }

// // ── Mobile card ───────────────────────────────────────────────────────────────
// function MobileCard({ branch, index, onEdit, onToggle, onDelete, busy }) {
//   return (
//     <motion.div
//       custom={index}
//       variants={fadeUp}
//       initial="hidden"
//       animate="visible"
//       className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden"
//     >
//       <div className="p-3 space-y-2">
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex items-center gap-2 min-w-0 flex-1">
//             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
//               {branch.name?.[0]?.toUpperCase()}
//             </div>
//             <div className="min-w-0">
//               <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{branch.name}</p>
//               {branch.address && <p className="text-[10px] text-gray-400 truncate">{branch.address}</p>}
//             </div>
//           </div>
//           <StatusBadge isActive={branch.isActive} />
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           {branch.managerName && (
//             <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
//               <UserCog size={10} className="text-teal-400" />{branch.managerName}
//             </span>
//           )}
//           {branch.phone && (
//             <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
//               <Phone size={10} className="text-teal-400" />{branch.phone}
//             </span>
//           )}
//         </div>

//         <div className="flex items-center gap-1.5 pt-1">
//           <button
//             onClick={() => onEdit(branch)}
//             className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-200/50 hover:bg-teal-100"
//           >
//             <Edit3 size={10} />Edit
//           </button>
//           <button
//             onClick={() => onToggle(branch)}
//             disabled={busy}
//             className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold border disabled:opacity-50 ${
//               branch.isActive
//                 ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
//                 : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
//             }`}
//           >
//             {branch.isActive ? <PowerOff size={10} /> : <Power size={10} />}
//             {branch.isActive ? 'Deactivate' : 'Activate'}
//           </button>
//           <button
//             onClick={() => onDelete(branch)}
//             className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500"
//           >
//             <Trash2 size={10} />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function BranchesPage() {
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [busyId, setBusyId] = useState(null);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formError, setFormError] = useState('');
//   const [formLoading, setFormLoading] = useState(false);

//   const fetchBranches = useCallback(() => {
//     setLoading(true);
//     branchApi.list()
//       .then((res) => setBranches(res.data || []))
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => { fetchBranches(); }, [fetchBranches]);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm);
//     setFormError('');
//     setModalOpen(true);
//   };

//   const openEdit = (branch) => {
//     setEditing(branch);
//     setForm({
//       name: branch.name || '',
//       address: branch.address || '',
//       phone: branch.phone || '',
//       managerName: branch.managerName || '',
//     });
//     setFormError('');
//     setModalOpen(true);
//   };

//   const handleSave = async () => {
//     if (!form.name.trim()) {
//       setFormError('Branch name is required.');
//       return;
//     }
//     setFormLoading(true);
//     setFormError('');
//     try {
//       if (editing) {
//         await branchApi.update(editing._id, form);
//       } else {
//         await branchApi.create(form);
//       }
//       setModalOpen(false);
//       fetchBranches();
//     } catch (err) {
//       setFormError(err.message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleToggle = async (branch) => {
//     setBusyId(branch._id);
//     try {
//       await branchApi.update(branch._id, { isActive: !branch.isActive });
//       fetchBranches();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const handleDelete = async (branch) => {
//     if (!window.confirm(`Delete branch "${branch.name}"? This cannot be undone.`)) return;
//     setBusyId(branch._id);
//     try {
//       await branchApi.remove(branch._id);
//       fetchBranches();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

//   return (
//     <div className="p-3 sm:p-5 lg:p-8 max-w-[1400px] mx-auto">

//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ type: 'spring', stiffness: 120, damping: 18 }}
//         className="flex items-center justify-between mb-5 sm:mb-7 gap-3"
//       >
//         <div className="min-w-0">
//           <div className="flex items-center gap-2 mb-0.5">
//             <Sparkles size={16} className="text-teal-500" />
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Branches</h2>
//           </div>
//           <p className="text-xs sm:text-sm text-gray-500 ml-6">Manage your business branches and locations</p>
//         </div>
//         <motion.button
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.97 }}
//           onClick={openCreate}
//           className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-teal-500/25 shrink-0"
//         >
//           <Plus size={13} />
//           <span className="hidden sm:inline">Add Branch</span>
//           <span className="sm:hidden">Add</span>
//         </motion.button>
//       </motion.div>

//       <Alert message={error} />

//       {/* Create / Edit Modal */}
//       <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Branch' : 'Add Branch'}>
//         <Alert message={formError} />
//         <div className="space-y-3 mt-4">
//           <div>
//             <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
//               <Building2 size={11} className="text-teal-400" />Branch Name *
//             </label>
//             <input
//               value={form.name} onChange={set('name')}
//               className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
//               placeholder="Main Branch"
//             />
//           </div>
//           <div>
//             <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
//               <MapPin size={11} className="text-teal-400" />Address
//             </label>
//             <input
//               value={form.address} onChange={set('address')}
//               className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
//               placeholder="Street, City"
//             />
//           </div>
//           <div>
//             <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
//               <Phone size={11} className="text-teal-400" />Phone
//             </label>
//             <input
//               value={form.phone} onChange={set('phone')}
//               className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
//               placeholder="03XX-XXXXXXX"
//             />
//           </div>
//           <div>
//             <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
//               <UserCog size={11} className="text-teal-400" />Manager Name
//             </label>
//             <input
//               value={form.managerName} onChange={set('managerName')}
//               className="w-full px-3 py-2 bg-white/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
//               placeholder="Branch manager"
//             />
//           </div>
//           <div className="flex gap-2 justify-end pt-2">
//             <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
//             <Button onClick={handleSave} disabled={formLoading}>{formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create Branch'}</Button>
//           </div>
//         </div>
//       </Modal>

//       {loading ? <Spinner /> : (
//         <>
//           {/* Mobile cards */}
//           <div className="space-y-2 lg:hidden">
//             {branches.length === 0 && (
//               <div className="flex flex-col items-center py-10">
//                 <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
//                   <Inbox size={20} className="text-gray-300" />
//                 </div>
//                 <p className="text-xs font-medium text-gray-400">No branches yet</p>
//               </div>
//             )}
//             {branches.map((b, i) => (
//               <MobileCard key={b._id} branch={b} index={i} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} busy={busyId === b._id} />
//             ))}
//           </div>

//           {/* Desktop table */}
//           <motion.div
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.08 }}
//             className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm"
//           >
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-gray-50/80 border-b border-gray-200/60">
//                   <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
//                     <th className="px-5 py-3 font-semibold">Branch</th>
//                     <th className="px-5 py-3 font-semibold">Address</th>
//                     <th className="px-5 py-3 font-semibold">Manager</th>
//                     <th className="px-5 py-3 font-semibold">Phone</th>
//                     <th className="px-5 py-3 font-semibold">Status</th>
//                     <th className="px-5 py-3 font-semibold">Created</th>
//                     <th className="px-5 py-3 font-semibold">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {branches.length === 0 && (
//                     <tr>
//                       <td colSpan={7} className="px-6 py-14">
//                         <div className="flex flex-col items-center justify-center">
//                           <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
//                             <Inbox size={24} className="text-gray-300" />
//                           </div>
//                           <p className="text-sm font-medium text-gray-400">No branches yet</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                   <AnimatePresence>
//                     {branches.map((b, i) => (
//                       <motion.tr
//                         key={b._id}
//                         custom={i}
//                         variants={fadeUp}
//                         initial="hidden"
//                         animate="visible"
//                         whileHover={{ backgroundColor: 'rgba(249,250,251,1)' }}
//                         className="border-b border-gray-100 transition-colors"
//                       >
//                         <td className="px-5 py-3.5">
//                           <div className="flex items-center gap-2.5">
//                             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
//                               {b.name?.[0]?.toUpperCase()}
//                             </div>
//                             <span className="font-semibold text-gray-900 text-sm truncate">{b.name}</span>
//                           </div>
//                         </td>
//                         <td className="px-5 py-3.5">
//                           <span className="text-xs text-gray-500 truncate max-w-[200px] inline-block">{b.address || '—'}</span>
//                         </td>
//                         <td className="px-5 py-3.5">
//                           <span className="text-xs text-gray-600">{b.managerName || '—'}</span>
//                         </td>
//                         <td className="px-5 py-3.5">
//                           <span className="text-xs text-gray-500">{b.phone || '—'}</span>
//                         </td>
//                         <td className="px-5 py-3.5">
//                           <StatusBadge isActive={b.isActive} />
//                         </td>
//                         <td className="px-5 py-3.5">
//                           <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
//                             <Calendar size={10} className="text-gray-300" />
//                             {new Date(b.createdAt).toLocaleDateString()}
//                           </span>
//                         </td>
//                         <td className="px-5 py-3.5">
//                           <div className="flex items-center gap-1.5">
//                             <button
//                               onClick={() => openEdit(b)}
//                               className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-200/50 hover:bg-teal-100"
//                             >
//                               <Edit3 size={10} />Edit
//                             </button>
//                             <button
//                               onClick={() => handleToggle(b)}
//                               disabled={busyId === b._id}
//                               className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border disabled:opacity-50 ${
//                                 b.isActive
//                                   ? 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100'
//                                   : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
//                               }`}
//                             >
//                               {b.isActive ? <PowerOff size={10} /> : <Power size={10} />}
//                               {b.isActive ? 'Deactivate' : 'Activate'}
//                             </button>
//                             <button
//                               onClick={() => handleDelete(b)}
//                               className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200/50 hover:bg-red-50 hover:text-red-500"
//                             >
//                               <Trash2 size={10} />
//                             </button>
//                           </div>
//                         </td>
//                       </motion.tr>
//                     ))}
//                   </AnimatePresence>
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </div>
//   );
// }
