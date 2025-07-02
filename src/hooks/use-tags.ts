'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tag } from '@/types/transaction';

const TAGS_QUERY_KEY = 'tags';

export function useTags() {
  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Error al cargar tags');
      }
      return response.json();
    },
  });

  return {
    tags,
    loading: isLoading,
    error: error?.message || null,
  };
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el tag');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });
}
