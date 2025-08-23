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
    onMutate: async (variables: { name: string }) => {
      await queryClient.cancelQueries({ queryKey: [TAGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<Tag[]>([TAGS_QUERY_KEY]) || [];
      const tempId = `temp-${Math.random().toString(36).slice(2)}`;
      const optimistic: Tag = { id: tempId, name: variables.name, userId: 'me' } as Tag;
      queryClient.setQueryData<Tag[]>([TAGS_QUERY_KEY], (old = []) => [optimistic, ...old]);
      return { previous, tempId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([TAGS_QUERY_KEY], context.previous);
      }
    },
    onSuccess: (data, _vars, context) => {
      queryClient.setQueryData<Tag[]>([TAGS_QUERY_KEY], (old = []) => {
        if (!context?.tempId) return [data as Tag, ...old];
        return old.map((t) => (t.id === context.tempId ? (data as Tag) : t));
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });
}
