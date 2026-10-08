import { CalendarDays } from 'lucide-react';
import FinanceCrudPage from '../FinanceCrudPage.jsx';
import { financeApi } from '../../../../shared/api/staff.js';

const fields = [
  { key: 'date',        label: 'Date',        type: 'date' },
  { key: 'category',    label: 'Category',    type: 'text' },
  { key: 'cashIn',      label: 'Cash In',     type: 'number' },
  { key: 'cashOut',     label: 'Cash Out',    type: 'number' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

export default function DayBookPage() {
  return (
    <FinanceCrudPage
      title="Day Book"
      subtitle="Daily cash in/out log"
      icon={CalendarDays}
      color="sky"
      api={financeApi.dayBook}
      fields={fields}
    />
  );
}
