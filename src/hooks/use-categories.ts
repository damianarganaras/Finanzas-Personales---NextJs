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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}
