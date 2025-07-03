import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreditCards, useCreditCardPurchases, useInstallmentPayments } from '@/hooks/use-credit-cards';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useCreditCards', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería cargar tarjetas de crédito correctamente', async () => {
    const mockCreditCards = [
      {
        id: '1',
        name: 'Visa Santander',
        last4Digits: '1234',
        limit: 50000,
        closingDay: 5,
        dueDay: 25,
        active: true,
        userId: 'user1',
        accountId: 'account1',
        account: {
          id: 'account1',
          name: 'Tarjeta Visa',
          currency: { symbol: '$' }
        },
        purchases: []
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreditCards,
    });

    const { result } = renderHook(() => useCreditCards());

    // Inicialmente debería estar cargando
    expect(result.current.loading).toBe(true);
    expect(result.current.creditCards).toEqual([]);

    // Esperar a que se complete la carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.creditCards).toEqual(mockCreditCards);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/credit-cards');
  });

  it('debería manejar errores al cargar tarjetas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCreditCards());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar tarjetas de crédito');
    expect(result.current.creditCards).toEqual([]);
  });

  it('debería crear una nueva tarjeta de crédito', async () => {
    const newCreditCard = {
      id: '2',
      name: 'Mastercard BBVA',
      last4Digits: '5678',
      limit: 30000,
      closingDay: 10,
      dueDay: 30,
      active: true,
      userId: 'user1',
      accountId: 'account2',
      account: {
        id: 'account2',
        name: 'Tarjeta Mastercard',
        currency: { symbol: '$' }
      },
      purchases: []
    };

    // Mock para la carga inicial
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Mock para la creación
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newCreditCard,
    });

    const { result } = renderHook(() => useCreditCards());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = {
      name: 'Mastercard BBVA',
      last4Digits: '5678',
      limit: 30000,
      closingDay: 10,
      dueDay: 30,
      active: true,
      accountId: 'account2',
    };

    await result.current.createCreditCard(formData);

    expect(mockFetch).toHaveBeenCalledWith('/api/credit-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    expect(result.current.creditCards).toContainEqual(newCreditCard);
  });
});

describe('useInstallmentPayments', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debería cargar cuotas pendientes correctamente', async () => {
    const mockInstallments = [
      {
        id: '1',
        installmentNumber: 1,
        amount: 1000,
        dueDate: new Date('2025-02-15'),
        status: 'pending',
        creditCardPurchase: {
          description: 'Compra supermercado',
          creditCard: {
            name: 'Visa Santander'
          }
        }
      }
    ];

    const mockSummary = {
      totalPending: 5000,
      totalOverdue: 0,
      nextPayments: mockInstallments,
      monthlyTotal: 1000,
    };

    // Mock para cargar cuotas
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInstallments,
    });

    // Mock para cargar resumen
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });

    const { result } = renderHook(() => useInstallmentPayments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.installments).toEqual(mockInstallments);
    expect(result.current.summary).toEqual(mockSummary);
    expect(mockFetch).toHaveBeenCalledWith('/api/credit-cards/installments');
    expect(mockFetch).toHaveBeenCalledWith('/api/credit-cards/installments/summary');
  });

  it('debería pagar una cuota correctamente', async () => {
    const mockInstallments = [
      {
        id: '1',
        installmentNumber: 1,
        amount: 1000,
        dueDate: new Date('2025-02-15'),
        status: 'pending',
        creditCardPurchase: {
          description: 'Compra supermercado',
          creditCard: {
            name: 'Visa Santander'
          }
        }
      }
    ];

    // Mock para carga inicial de cuotas
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInstallments,
    });

    // Mock para carga inicial de resumen
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalPending: 1000, totalOverdue: 0, nextPayments: [], monthlyTotal: 1000 }),
    });

    // Mock para pago de cuota
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockInstallments[0], status: 'paid' }),
    });

    // Mock para refrescar cuotas después del pago
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Mock para refrescar resumen después del pago
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalPending: 0, totalOverdue: 0, nextPayments: [], monthlyTotal: 0 }),
    });

    const { result } = renderHook(() => useInstallmentPayments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.payInstallment('1');

    expect(mockFetch).toHaveBeenCalledWith('/api/credit-cards/installments/1/pay', {
      method: 'POST',
    });
  });
});

describe('useCreditCardPurchases', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debería cargar compras con tarjeta correctamente', async () => {
    const mockPurchases = [
      {
        id: '1',
        totalAmount: 5000,
        installments: 5,
        description: 'Electrodoméstico',
        purchaseDate: new Date('2025-01-15'),
        creditCard: {
          name: 'Visa Santander'
        },
        installmentPayments: []
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPurchases,
    });

    const { result } = renderHook(() => useCreditCardPurchases());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.purchases).toEqual(mockPurchases);
    expect(mockFetch).toHaveBeenCalledWith('/api/credit-cards/purchases');
  });
});
