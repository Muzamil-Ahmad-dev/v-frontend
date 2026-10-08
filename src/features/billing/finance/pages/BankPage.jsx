import { Landmark } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'bankName',      label: 'Bank Name',      type: 'text',   required: true },
  { key: 'accountType',   label: 'Account Type',   type: 'text',   required: true, placeholder: 'Current / Savings' },
  { key: 'accountNumber', label: 'Account Number', type: 'text' },
  { key: 'accountCash',   label: 'Account Cash',   type: 'number' },
];

export default function BankPage() {
  return (
    <FinanceCrudPage
      title="Bank"
      subtitle="Bank accounts & transactions"
      icon={Landmark}
      color="sky"
      api={financeApi.bank}
      fields={fields}
    />
  );
}
