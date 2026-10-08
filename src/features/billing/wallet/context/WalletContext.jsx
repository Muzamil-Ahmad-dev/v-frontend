import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { banksLedgerApi, pocketCashLedgerApi } from '../../../../shared/api/staff.js';

const WalletContext = createContext(null);

/**
 * WalletProvider
 * Central data source for the "My Wallet" feature: Pocket Cash + Bank
 * Accounts. Talks directly to /api/pocketCash/* and /api/banks/* so every
 * screen in this feature shares the same live data without re-fetching.
 */
export function WalletProvider({ children }) {
  const [pocketCashTotal, setPocketCashTotal] = useState(0);
  const [pocketCashId, setPocketCashId] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [pocketRes, banksRes] = await Promise.all([
        pocketCashLedgerApi.getTotal(),
        banksLedgerApi.getAll(),
      ]);
      setPocketCashTotal(pocketRes?.total ?? 0);
      setPocketCashId(pocketRes?.id ?? null);
      const banksData = Array.isArray(banksRes?.banks)
        ? banksRes.banks
        : Array.isArray(banksRes?.data)
          ? banksRes.data
          : Array.isArray(banksRes)
            ? banksRes
            : [];
      setBanks(banksData);
    } catch (err) {
      setError(err.message || 'Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addPocketCash = async ({ amount, sourceOfAmountAddition }) => {
    const res = await pocketCashLedgerApi.add({ amount, sourceOfAmountAddition });
    await load();
    return res;
  };

  const deductPocketCash = async ({ amount, reasonOfAmountDeduction }) => {
    const res = await pocketCashLedgerApi.deduct({ amount, reasonOfAmountDeduction });
    await load();
    return res;
  };

  const createBank = async (body) => {
    const res = await banksLedgerApi.create(body);
    await load();
    return res;
  };

  const addBankCash = async ({ bankId, sourceOfAmountAddition, accountCash }) => {
    const res = await banksLedgerApi.addCash({ bankId, sourceOfAmountAddition, accountCash });
    await load();
    return res;
  };

  const removeBankCash = async ({ bankId, sourceOfAmountDeduction, accountCash }) => {
    const res = await banksLedgerApi.removeCash({ bankId, sourceOfAmountDeduction, accountCash });
    await load();
    return res;
  };

  const deleteBank = async (bankId) => {
    const res = await banksLedgerApi.remove(bankId);
    await load();
    return res;
  };

  const value = {
    pocketCashTotal,
    pocketCashId,
    banks,
    loading,
    error,
    refresh: load,
    addPocketCash,
    deductPocketCash,
    createBank,
    addBankCash,
    removeBankCash,
    deleteBank,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within a WalletProvider');
  return ctx;
}
