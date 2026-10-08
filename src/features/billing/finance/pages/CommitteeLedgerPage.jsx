 import { HandCoins } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'committeeName',     label: 'Committee Name',     type: 'text',   required: true },
  { key: 'totalAmount',       label: 'Total Amount',       type: 'number', required: true },
  { key: 'numberOfMembers',   label: 'Number of Members',  type: 'number', required: true },
  { key: 'headName',          label: 'Head Name',          type: 'text',   required: true },
  { key: 'myComitteeNameNumber', label: 'My Committee No.', type: 'number' },
  { key: 'status',            label: 'Status',             type: 'select', options: ['Not Paid', 'Paid', 'Partially Paid'], default: 'Not Paid' },
];

export default function CommitteeLedgerPage() {
  return (
    <FinanceCrudPage
      title="Committee Ledger"
      subtitle="Committee (BC) contributions"
      icon={HandCoins}
      color="sky"
      api={financeApi.committeeLedger}
      fields={fields}
    />
  );
}