'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction, TransactionJournal, TransactionFormData } from '@/types/transaction';

const TRANSACTIONS_QUERY_KEY = 'transactions';

export function useTransactions() {
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Error al cargar transacciones');
      }
      return response.json();
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return {
    transactions,
    loading: isLoading,
    error: error?.message || null,
  };
}

export function useTransactionById(id: string) {
  return useQuery<Transaction>({
    queryKey: [TRANSACTIONS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar la transacción');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la transacción');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refrescar el caché de transacciones
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionFormData & { id: string }) => {
      const { id, ...updateData } = data;
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la transacción');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar caché de transacciones
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la transacción');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar caché de transacciones
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
    },
  });
}

// Hook para filtrar transacciones por tipo
export function useTransactionsByType(type?: 'withdrawal' | 'deposit' | 'transfer') {
  const { transactions, loading, error } = useTransactions();

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (!type) return true;
    
    // Determinar el tipo basado en el monto y las cuentas involucradas
    if (type === 'withdrawal' && transaction.amount < 0) return true;
    if (type === 'deposit' && transaction.amount > 0) return true;
    if (type === 'transfer') {
      // Para transferencias necesitaríamos verificar si hay transacciones relacionadas
      // Por ahora, usamos una heurística simple
      return false; // Implementar lógica de transferencias más adelante
    }
    
    return false;
  });

  return {
    transactions: filteredTransactions,
    loading,
    error,
  };
}

// Hook para obtener estadísticas de transacciones
export function useTransactionStats() {
  const { transactions, loading, error } = useTransactions();

  const stats = {
    totalTransactions: transactions.length,
    totalIncome: transactions
      .filter((t: Transaction) => t.amount > 0)
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0),
    totalExpenses: Math.abs(
      transactions
        .filter((t: Transaction) => t.amount < 0)
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
    ),
    netBalance: transactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0),
  };

  return {
    stats,
    loading,
    error,
  };
}
