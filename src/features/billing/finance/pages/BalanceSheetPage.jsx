import { PieChart } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'periodLabel', label: 'Period Label', type: 'text', placeholder: 'e.g. June 2026' },
  { key: 'assets',      label: 'Assets',       type: 'number' },
  { key: 'liabilities', label: 'Liabilities',  type: 'number' },
  { key: 'equity',      label: 'Equity',       type: 'number' },
  { key: 'notes',       label: 'Notes',        type: 'textarea' },
];

export default function BalanceSheetPage() {
  return (
    <FinanceCrudPage
      title="Balance Sheet"
      subtitle="Assets, liabilities & equity"
      icon={PieChart}
      color="sky"
      api={financeApi.balanceSheet}
      fields={fields}
    />
  );
}
