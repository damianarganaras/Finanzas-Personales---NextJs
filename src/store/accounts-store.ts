import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Account } from '@/types';

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAccountsStore = create<AccountsState>()(
  devtools(
    (set) => ({
      accounts: [],
      isLoading: false,
      error: null,
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (account) => 
        set((state) => ({ accounts: [account, ...state.accounts] })),
      updateAccount: (id, updatedAccount) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, ...updatedAccount } : account
          ),
        })),
      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'accounts-store',
    }
  )
);
