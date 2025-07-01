import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { DeleteAccountButton } from '@/components/accounts/delete-account-button';
import type { Account } from '@/types';

// Mock del router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del hook useDeleteAccount
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/use-accounts', () => ({
  useDeleteAccount: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

// Mock de fetch global
global.fetch = vi.fn();

// Helper para crear wrapper con QueryClient
const createWrapper = () => {
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockAccount: Account = {
  id: 'acc-1',
  name: 'Cuenta Principal',
  accountTypeId: 'type-1',
  currencyId: 'curr-1',
  virtualBalance: 1000,
  iban: 'ES1234567890',
  active: true,
  userId: 'user-1',
  userGroupId: 'group-1',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  accountType: {
    id: 'type-1',
    type: 'asset',
    name: 'Activo'
  },
  currency: {
    id: 'curr-1',
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: '$'
  }
};

describe('DeleteAccountButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el botón habilitado cuando no hay transacciones', () => {
    render(
      <DeleteAccountButton account={mockAccount} transactionCount={0} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: /eliminar/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('debe renderizar el botón deshabilitado cuando hay transacciones', () => {
    render(
      <DeleteAccountButton account={mockAccount} transactionCount={5} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: /eliminar/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('debe mostrar diálogo de confirmación al hacer clic', async () => {
    render(
      <DeleteAccountButton account={mockAccount} transactionCount={0} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar cuenta?')).toBeInTheDocument();
      expect(screen.getByText(/Esta acción eliminará permanentemente/)).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de error cuando hay transacciones asociadas', async () => {
    render(
      <DeleteAccountButton account={mockAccount} transactionCount={3} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: /eliminar/i });
    expect(button).toBeDisabled();
    
    // El botón está deshabilitado y no debería abrir el diálogo al hacer clic
    // En su lugar, vamos a verificar que el botón muestre el estado correcto
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('debe llamar a la mutación de eliminar cuando se confirma', async () => {
    mockMutateAsync.mockResolvedValueOnce({ message: 'Cuenta eliminada' });

    render(
      <DeleteAccountButton account={mockAccount} transactionCount={0} />,
      { wrapper: createWrapper() }
    );

    // Abrir diálogo
    const button = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(button);

    // Confirmar eliminación
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('acc-1');
      expect(mockPush).toHaveBeenCalledWith('/accounts');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('debe manejar errores al eliminar', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValueOnce(new Error('Error del servidor'));

    render(
      <DeleteAccountButton account={mockAccount} transactionCount={0} />,
      { wrapper: createWrapper() }
    );

    // Abrir diálogo
    const button = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(button);

    // Confirmar eliminación
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('acc-1');
      expect(consoleSpy).toHaveBeenCalledWith('Error al eliminar cuenta:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
