import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Spinner, Alert, Button } from '../../../../shared/components/ui.jsx';
import { useWalletContext } from '../context/WalletContext.jsx';
import PocketCashCard from '../components/PocketCashCard.jsx';
import BankCreateForm from '../components/BankCreateForm.jsx';
import BanksTable from '../components/BanksTable.jsx';
import CashMovementModal from '../components/CashMovementModal.jsx';
import DeleteBankModal from '../components/DeleteBankModal.jsx';
import WalletAnalyticsModal from '../components/WalletAnalyticsModal.jsx';

export default function WalletOverviewPage() {
  const {
    pocketCashTotal, banks, loading, error,
    addPocketCash, deductPocketCash, createBank, addBankCash, removeBankCash, deleteBank,
  } = useWalletContext();

  const [pocketModal, setPocketModal] = useState(null); // 'add' | 'remove' | null
  const [bankCashModal, setBankCashModal] = useState(null); // { mode, bank } | null
  const [deleteTarget, setDeleteTarget] = useState(null); // bank | null
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6">
      <Alert message={error} />

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setAnalyticsOpen(true)} className="gap-1.5">
          <BarChart3 size={14} /> View Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <PocketCashCard
            total={pocketCashTotal}
            onAdd={() => setPocketModal('add')}
            onRemove={() => setPocketModal('remove')}
          />
        </div>
        <div className="lg:col-span-2">
          <BankCreateForm onCreate={createBank} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <BanksTable
          banks={banks}
          onAddCash={(bank) => setBankCashModal({ mode: 'add', bank })}
          onRemoveCash={(bank) => setBankCashModal({ mode: 'remove', bank })}
          onDelete={(bank) => setDeleteTarget(bank)}
        />
      </motion.div>

      {/* Pocket Cash add/remove */}
      <CashMovementModal
        open={pocketModal === 'add'}
        mode="add"
        title="Add Pocket Cash"
        onClose={() => setPocketModal(null)}
        onSubmit={(amount, note) => addPocketCash({ amount, sourceOfAmountAddition: note })}
      />
      <CashMovementModal
        open={pocketModal === 'remove'}
        mode="remove"
        title="Remove Pocket Cash"
        onClose={() => setPocketModal(null)}
        onSubmit={(amount, note) => deductPocketCash({ amount, reasonOfAmountDeduction: note })}
      />

      {/* Bank add/remove cash */}
      <CashMovementModal
        open={bankCashModal?.mode === 'add'}
        mode="add"
        title={`Add Cash — ${bankCashModal?.bank?.bankName || ''}`}
        onClose={() => setBankCashModal(null)}
        onSubmit={(amount, note) => addBankCash({
          bankId: bankCashModal.bank._id,
          sourceOfAmountAddition: note,
          accountCash: amount,
        })}
      />
      <CashMovementModal
        open={bankCashModal?.mode === 'remove'}
        mode="remove"
        title={`Remove Cash — ${bankCashModal?.bank?.bankName || ''}`}
        onClose={() => setBankCashModal(null)}
        onSubmit={(amount, note) => removeBankCash({
          bankId: bankCashModal.bank._id,
          sourceOfAmountDeduction: note,
          accountCash: amount,
        })}
      />

      <DeleteBankModal
        open={!!deleteTarget}
        bank={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteBank(deleteTarget._id)}
      />

      <WalletAnalyticsModal
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        pocketCashTotal={pocketCashTotal}
        banks={banks}
      />
    </div>
  );
}
