import { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';
import { Button, Input, Alert } from '../../../../shared/components/ui.jsx';

export default function BankCreateForm({ onCreate }) {
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountType.trim()) {
      setError('Bank name and account type are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate({ bankName: bankName.trim(), accountType: accountType.trim(), accountNumber: accountNumber.trim() });
      setBankName('');
      setAccountType('');
      setAccountNumber('');
    } catch (err) {
      setError(err.message || 'Failed to create bank.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Landmark size={16} className="text-sky-500" />
        <h3 className="text-sm font-semibold text-gray-700">Add Bank Account</h3>
      </div>
      <Alert message={error} />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        <Input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
        <Input placeholder="Account Type (e.g. Savings, Current)" value={accountType} onChange={(e) => setAccountType(e.target.value)} />
        <Input placeholder="Account Number (optional)" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        <div className="sm:col-span-3 flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Bank'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
