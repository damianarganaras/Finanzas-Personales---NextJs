import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccountById, useUpdateAccount, useDeleteAccount } from '@/hooks/use-accounts';
import type { AccountFormData } from '@/types';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Wrapper para QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: any }) => {
    const React = require('react');
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAccountById hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debe cargar una cuenta específica exitosamente', async () => {
    const mockAccount = {
      id: 'account-1',
      name: 'Cuenta Corriente Principal',
      accountTypeId: 'asset-1',
      virtualBalance: 5000,
      iban: 'AR1234567890123456789012',
      active: true,
      userId: 'user-1',
      userGroupId: 'group-1',
      currencyId: 'ars-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      accountType: {
        id: 'asset-1',
        type: 'asset',
        name: 'Activo'
      },
      currency: {
        id: 'ars-1',
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$'
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAccount
    });

    const { result } = renderHook(() => useAccountById('account-1'), {
      wrapper: createWrapper()
    });

    // Estado inicial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(null);

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockAccount);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith('/api/accounts/account-1');
  });

  it('debe manejar errores al cargar cuenta', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const { result } = renderHook(() => useAccountById('account-1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Error al cargar la cuenta');
  });

  it('no debe hacer llamada si no hay ID', () => {
    const { result } = renderHook(() => useAccountById(''), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useUpdateAccount hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debe actualizar una cuenta exitosamente', async () => {
    const mockUpdatedAccount = {
      id: 'account-1',
      name: 'Cuenta Corriente Actualizada',
      accountTypeId: 'asset-1',
      virtualBalance: 6000,
      iban: 'AR1234567890123456789012',
      active: true,
      userId: 'user-1',
      userGroupId: 'group-1',
      currencyId: 'ars-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      accountType: {
        id: 'asset-1',
        type: 'asset',
        name: 'Activo'
      },
      currency: {
        id: 'ars-1',
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$'
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedAccount
    });

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapper()
    });

    const updateData = {
      id: 'account-1',
      name: 'Cuenta Corriente Actualizada',
      accountTypeId: 'asset-1',
      virtualBalance: 6000,
      iban: 'AR1234567890123456789012',
      active: true,
      currencyId: 'ars-1'
    };

    await result.current.mutateAsync(updateData);

    expect(mockFetch).toHaveBeenCalledWith('/api/accounts/account-1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Cuenta Corriente Actualizada',
        accountTypeId: 'asset-1',
        virtualBalance: 6000,
        iban: 'AR1234567890123456789012',
        active: true,
        currencyId: 'ars-1'
      }),
    });
  });

  it('debe manejar errores al actualizar cuenta', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Datos inválidos' })
    });

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapper()
    });

    const updateData = {
      id: 'account-1',
      name: '',  // Nombre vacío debería causar error
      accountTypeId: 'asset-1',
      active: true,
      currencyId: 'ars-1'
    };

    await expect(result.current.mutateAsync(updateData)).rejects.toThrow('Datos inválidos');
  });

  it('debe manejar errores de red al actualizar', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUpdateAccount(), {
      wrapper: createWrapper()
    });

    const updateData = {
      id: 'account-1',
      name: 'Cuenta Test',
      accountTypeId: 'asset-1',
      active: true,
      currencyId: 'ars-1'
    };

    await expect(result.current.mutateAsync(updateData)).rejects.toThrow('Network error');
  });
});

describe('useDeleteAccount hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('debe eliminar una cuenta exitosamente', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Cuenta eliminada correctamente' })
    });

    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: createWrapper()
    });

    await result.current.mutateAsync('account-1');

    expect(mockFetch).toHaveBeenCalledWith('/api/accounts/account-1', {
      method: 'DELETE',
    });
  });

  it('debe manejar error cuando hay transacciones asociadas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ 
        message: 'No se puede eliminar una cuenta con transacciones asociadas' 
      })
    });

    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: createWrapper()
    });

    await expect(result.current.mutateAsync('account-1')).rejects.toThrow('No se puede eliminar una cuenta con transacciones asociadas');
  });

  it('debe manejar error cuando la cuenta no existe', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Cuenta no encontrada' })
    });

    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: createWrapper()
    });

    await expect(result.current.mutateAsync('account-nonexistent')).rejects.toThrow('Cuenta no encontrada');
  });

  it('debe manejar errores de red al eliminar', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: createWrapper()
    });

    await expect(result.current.mutateAsync('account-1')).rejects.toThrow('Network error');
  });
});
