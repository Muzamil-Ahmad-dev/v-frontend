import { useState } from 'react';
import { Modal, Button, Alert } from '../../../../shared/components/ui.jsx';

export default function DeleteBankModal({ open, bank, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete bank.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete Bank Account">
      <div className="flex flex-col gap-3">
        <Alert message={error} />
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{bank?.bankName}</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>No</Button>
          <Button variant="danger" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
