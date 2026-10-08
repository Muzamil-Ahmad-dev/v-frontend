import { Users } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'partyName',    label: 'Party Name',    type: 'text',   required: true },
  { key: 'takingCredit', label: 'Taking Credit', type: 'number' },
  { key: 'givingCredit', label: 'Giving Credit', type: 'number' },
  { key: 'status',       label: 'Status',        type: 'select', options: ['Payable', 'Receivable', 'Settled'], default: 'Settled' },
];

export default function PartyLedgerPage() {
  return (
    <FinanceCrudPage
      title="Party Ledger"
      subtitle="Credit given/taken with parties"
      icon={Users}
      color="sky"
      api={financeApi.partyLedger}
      fields={fields}
    />
  );
}
