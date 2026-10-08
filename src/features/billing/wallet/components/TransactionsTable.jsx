import { Trash2 } from 'lucide-react';
import { Button, EmptyState } from '../../../../shared/components/ui.jsx';

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');

/**
 * TransactionsTable
 * rows: [{ _id, type: 'in'|'out', amount, note, balanceAfter, date }]
 */
export default function TransactionsTable({ rows, onDelete, emptyLabel = 'No transactions yet' }) {
  if (!rows || rows.length === 0) {
    return <EmptyState icon="🧾" title={emptyLabel} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-2.5">Date</th>
            <th className="px-4 py-2.5">Note</th>
            <th className="px-4 py-2.5 text-right">In</th>
            <th className="px-4 py-2.5 text-right">Out</th>
            <th className="px-4 py-2.5 text-right">Balance After</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-t border-gray-100 hover:bg-gray-50/60">
              <td className="px-4 py-3 text-gray-500">{fmtDate(row.date || row.createdAt)}</td>
              <td className="px-4 py-3 text-gray-700">{row.note || '—'}</td>
              <td className="px-4 py-3 text-right text-emerald-600">{row.type === 'in' ? `+${Number(row.amount).toLocaleString()}` : ''}</td>
              <td className="px-4 py-3 text-right text-red-500">{row.type === 'out' ? `-${Number(row.amount).toLocaleString()}` : ''}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{Number(row.balanceAfter ?? 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => onDelete(row)} className="gap-1 text-red-500 hover:bg-red-50">
                  <Trash2 size={12} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
