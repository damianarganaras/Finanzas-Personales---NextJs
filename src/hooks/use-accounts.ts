import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Account, AccountFormData } from '@/types';

export function useAccounts() {
  const query = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      console.log('Fetching accounts...');
      const response = await fetch('/api/accounts');
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al cargar cuentas');
      }
      const data = await response.json();
      console.log('Accounts data received:', data);
      return data;
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear cuenta');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useAccountById(id: string) {
  return useQuery<Account>({
    queryKey: ['accounts', id],
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar la cuenta');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & AccountFormData) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la cuenta');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', data.id] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar cuenta');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
