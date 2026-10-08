import { BookOpen } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'date',         label: 'Date',          type: 'date',     required: true },
  { key: 'openingCash',  label: 'Opening Cash',  type: 'number' },
  { key: 'cashReceived', label: 'Cash Received', type: 'number' },
  { key: 'cashPaid',     label: 'Cash Paid',     type: 'number' },
  { key: 'expense',      label: 'Expense',       type: 'number' },
];

export default function LedgerPage() {
  return (
    <FinanceCrudPage
      title="Ledger"
      subtitle="Daily cash ledger entries for your branch"
      icon={BookOpen}
      color="sky"
      api={financeApi.ledger}
      fields={fields}
    />
  );
}
