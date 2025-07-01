import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrencies } from '@/hooks/use-currencies';
import { useAccountTypes } from '@/hooks/use-account-types';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useCurrencies hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debe cargar monedas exitosamente', async () => {
    const mockCurrencies = [
      { id: '1', code: 'ARS', name: 'Peso Argentino', symbol: '$' },
      { id: '2', code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$' },
      { id: '3', code: 'EUR', name: 'Euro', symbol: '€' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCurrencies
    });

    const { result } = renderHook(() => useCurrencies());

    // Estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.currencies).toEqual([]);
    expect(result.current.error).toBe(null);

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currencies).toEqual(mockCurrencies);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith('/api/currencies');
  });

  it('debe manejar errores al cargar monedas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const { result } = renderHook(() => useCurrencies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currencies).toEqual([]);
    expect(result.current.error).toBe('Error al cargar las monedas');
  });

  it('debe manejar errores de red', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCurrencies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currencies).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });
});

describe('useAccountTypes hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debe cargar tipos de cuenta exitosamente', async () => {
    const mockAccountTypes = [
      { id: '1', type: 'asset' },
      { id: '2', type: 'liability' },
      { id: '3', type: 'expense' },
      { id: '4', type: 'revenue' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAccountTypes
    });

    const { result } = renderHook(() => useAccountTypes());

    // Estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.accountTypes).toEqual([]);
    expect(result.current.error).toBe(null);

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accountTypes).toEqual(mockAccountTypes);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith('/api/account-types');
  });

  it('debe manejar errores al cargar tipos de cuenta', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const { result } = renderHook(() => useAccountTypes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accountTypes).toEqual([]);
    expect(result.current.error).toBe('Error al cargar los tipos de cuenta');
  });
});
