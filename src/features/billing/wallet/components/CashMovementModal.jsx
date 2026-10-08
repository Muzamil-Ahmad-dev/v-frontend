import { useState } from 'react';
import { Modal, Button, Input, Alert } from '../../../../shared/components/ui.jsx';

/**
 * CashMovementModal
 * Shared "Add Cash" / "Remove Cash" form, used both by the Pocket Cash card
 * and by each row of the Banks table.
 *
 * mode: 'add' | 'remove'
 * onSubmit(amount, note) => Promise
 */
export default function CashMovementModal({ open, mode = 'add', title, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdd = mode === 'add';
  const noteLabel = isAdd ? 'Source of Amount' : 'Reason for Deduction';

  const reset = () => {
    setAmount('');
    setNote('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!note.trim()) {
      setError(`${noteLabel} is required.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(Number(amount), note.trim());
      reset();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={title || (isAdd ? 'Add Cash' : 'Remove Cash')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Alert message={error} />
        <Input
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <Input
          label={noteLabel}
          type="text"
          placeholder={isAdd ? 'e.g. Cash deposit from sale' : 'e.g. Office supplies'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant={isAdd ? 'success' : 'danger'} disabled={submitting}>
            {submitting ? 'Processing…' : isAdd ? 'Add Cash' : 'Remove Cash'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
