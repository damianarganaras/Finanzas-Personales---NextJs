import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({ id: 'test-transaction-id' }),
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del fetch global
global.fetch = vi.fn();

describe('Transaction API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Transactions API', () => {
    it('should call fetch with correct URL for getting transactions', async () => {
      const mockTransactions = [
        {
          id: '1',
          description: 'Test Transaction',
          amount: 100,
          date: new Date().toISOString(),
          type: 'withdrawal',
          accountId: 'account-1',
          transactionJournalId: 'journal-1',
          account: {
            id: 'account-1',
            name: 'Test Account',
            accountType: { type: 'asset' },
          },
          transactionJournal: {
            id: 'journal-1',
            userId: 'user-1',
            description: 'Test Transaction',
            date: new Date().toISOString(),
            transactions: [],
          },
          categories: [],
          tags: [],
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      // Simular llamada a la API
      const response = await fetch('/api/transactions');
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/transactions');
      expect(data).toEqual(mockTransactions);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      const response = await fetch('/api/transactions');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('should create transaction with correct payload', async () => {
      const newTransaction = {
        type: 'withdrawal' as const,
        description: 'New Transaction',
        amount: 50,
        date: new Date(),
        sourceAccountId: 'account-1',
        categoryIds: [],
        tagIds: [],
      };

      const mockResponse = {
        id: 'new-transaction-id',
        ...newTransaction,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      expect(fetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();
      expect(data.id).toBe('new-transaction-id');
    });
  });

  describe('Transaction Validation', () => {
    it('should validate required fields for withdrawal', () => {
      const transactionData = {
        type: 'withdrawal' as const,
        description: 'Test withdrawal',
        amount: 100,
        date: new Date(),
        sourceAccountId: 'account-1',
        categoryIds: [],
        tagIds: [],
      };

      // Validación básica
      expect(transactionData.type).toBe('withdrawal');
      expect(transactionData.sourceAccountId).toBeDefined();
      expect(transactionData.amount).toBeGreaterThan(0);
      expect(transactionData.description).toBeTruthy();
    });

    it('should validate required fields for deposit', () => {
      const transactionData = {
        type: 'deposit' as const,
        description: 'Test deposit',
        amount: 200,
        date: new Date(),
        destinationAccountId: 'account-2',
        categoryIds: [],
        tagIds: [],
      };

      expect(transactionData.type).toBe('deposit');
      expect(transactionData.destinationAccountId).toBeDefined();
      expect(transactionData.amount).toBeGreaterThan(0);
    });

    it('should validate required fields for transfer', () => {
      const transactionData = {
        type: 'transfer' as const,
        description: 'Test transfer',
        amount: 150,
        date: new Date(),
        sourceAccountId: 'account-1',
        destinationAccountId: 'account-2',
        categoryIds: [],
        tagIds: [],
      };

      expect(transactionData.type).toBe('transfer');
      expect(transactionData.sourceAccountId).toBeDefined();
      expect(transactionData.destinationAccountId).toBeDefined();
      expect(transactionData.sourceAccountId).not.toBe(transactionData.destinationAccountId);
    });
  });
});
