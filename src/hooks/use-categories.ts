'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '@/types/transaction';

const CATEGORIES_QUERY_KEY = 'categories';

export function useCategories() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      return response.json();
    },
  });

  return {
    categories,
    loading: isLoading,
    error: error?.message || null,
  };
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la categoría');
      }

      return response.json();
    },
    // Optimistic update: insert temp category immediately, rollback on error, reconcile on success
    onMutate: async (variables: { name: string }) => {
      await queryClient.cancelQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      const previous = queryClient.getQueryData<Category[]>([CATEGORIES_QUERY_KEY]) || [];
      const tempId = `temp-${Math.random().toString(36).slice(2)}`;
      const optimistic: Category = { id: tempId, name: variables.name, userId: 'me' } as Category;
      queryClient.setQueryData<Category[]>([CATEGORIES_QUERY_KEY], (old = []) => [optimistic, ...old]);
      return { previous, tempId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([CATEGORIES_QUERY_KEY], context.previous);
      }
    },
    onSuccess: (data, _vars, context) => {
      // Replace temp item with server item, keeping selection order
      queryClient.setQueryData<Category[]>([CATEGORIES_QUERY_KEY], (old = []) => {
        if (!context?.tempId) return [data as Category, ...old];
        return old.map((c) => (c.id === context.tempId ? (data as Category) : c));
      });
    },
    onSettled: () => {
      // Ensure sync with server
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}
