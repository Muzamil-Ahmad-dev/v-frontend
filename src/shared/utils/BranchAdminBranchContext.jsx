import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { branchAdminBranchApi } from '../api/branchAdmin.js';
import { branchContext } from '../api/client.js';

const Ctx = createContext(null);

/**
 * A Branch Admin can own several branches. Every branch-scoped module
 * (Purchase / Sale / Billing / Wallet / Finance) needs to know which ONE
 * of those branches is currently "active" so it knows what to show and
 * where new records should be saved.
 *
 * This provider loads the Branch Admin's branches once, picks a sensible
 * default (the last one used, or the first one available), and keeps
 * `branchContext` (in shared/api/client.js) in sync so every API call
 * automatically carries the right ?branchId=.
 */
export function BranchAdminBranchProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [currentBranchId, setCurrentBranchIdState] = useState(branchContext.get());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await branchAdminBranchApi.list();
      const list = res.data || [];
      setBranches(list);

      const stillValid = list.some((b) => b._id === branchContext.get());
      if (!stillValid) {
        const fallback = list[0]?._id || null;
        branchContext.set(fallback);
        setCurrentBranchIdState(fallback);
      }
    } catch (err) {
      setError(err.message || 'Failed to load branches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setCurrentBranchId = (branchId) => {
    branchContext.set(branchId);
    setCurrentBranchIdState(branchId);
  };

  const currentBranch = branches.find((b) => b._id === currentBranchId) || null;

  return (
    <Ctx.Provider
      value={{
        branches,
        currentBranchId,
        currentBranch,
        setCurrentBranchId,
        loading,
        error,
        refreshBranches: load,
        hasNoBranches: !loading && branches.length === 0,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useBranchAdminBranch() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useBranchAdminBranch must be used inside <BranchAdminBranchProvider>');
  }
  return ctx;
}
