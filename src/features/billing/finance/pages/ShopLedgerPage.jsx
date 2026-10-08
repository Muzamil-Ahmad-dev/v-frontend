import { Store } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'name',        label: 'Name',         type: 'text',   required: true },
  { key: 'reference',   label: 'Reference',    type: 'text',   required: true },
  { key: 'expense',     label: 'Expense',      type: 'number' },
  { key: 'receiveCash', label: 'Receive Cash', type: 'number' },
  { key: 'cashPaid',    label: 'Cash Paid',    type: 'number' },
  { key: 'status',      label: 'Status',       type: 'select', options: ['Payable', 'Receivable', 'Settled'], default: 'Settled' },
];

export default function ShopLedgerPage() {
  return (
    <FinanceCrudPage
      title="Shop Ledger"
      subtitle="Per-shop running ledger"
      icon={Store}
      color="sky"
      api={financeApi.shopLedger}
      fields={fields}
    />
  );
}
