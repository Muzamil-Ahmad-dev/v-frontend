import { Modal, Card, Button } from '../../../../shared/components/ui.jsx';

export default function WalletAnalyticsModal({ open, onClose, pocketCashTotal, banks }) {
  const totalBankBalance = banks.reduce((sum, b) => sum + (Number(b.accountCash) || 0), 0);
  const totalIn = banks.reduce((sum, b) => sum + (Number(b.cashIn) || 0), 0);
  const totalOut = banks.reduce((sum, b) => sum + (Number(b.cashOut) || 0), 0);
  const profit = totalIn - totalOut + (Number(pocketCashTotal) || 0);

  return (
    <Modal open={open} onClose={onClose} title="Wallet Analytics">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Card className="p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pocket Cash</p>
          <p className="text-2xl font-bold text-sky-600">{Number(pocketCashTotal || 0).toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Bank Balance</p>
          <p className="text-2xl font-bold text-indigo-600">{totalBankBalance.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Across {banks.length} bank{banks.length !== 1 ? 's' : ''}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Net (Profit/Loss)</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {profit.toLocaleString()}
          </p>
        </Card>
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bank-wise Summary</p>
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
              <th className="px-3 py-2">Bank</th>
              <th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 text-right">In</th>
              <th className="px-3 py-2 text-right">Out</th>
              <th className="px-3 py-2 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((b) => {
              const net = (Number(b.cashIn) || 0) - (Number(b.cashOut) || 0);
              return (
                <tr key={b._id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-800">{b.bankName}</td>
                  <td className="px-3 py-2 text-right">{Number(b.accountCash || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">+{Number(b.cashIn || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-red-500">-{Number(b.cashOut || 0).toLocaleString()}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {net.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {banks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-400">No bank data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-5">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}
