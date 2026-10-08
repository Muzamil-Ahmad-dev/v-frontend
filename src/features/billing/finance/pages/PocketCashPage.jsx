import { Wallet2 } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'accountCash', label: 'Account Cash', type: 'number', required: true },
];

export default function PocketCashPage() {
  return (
    <FinanceCrudPage
      title="Pocket Cash"
      subtitle="Petty cash in/out"
      icon={Wallet2}
      color="sky"
      api={financeApi.pocketCash}
      fields={fields}
    />
  );
}
