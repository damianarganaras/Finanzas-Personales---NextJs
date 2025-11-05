'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserSettings, updateUserSettings } from '@/lib/actions/user-settings';
import { UserSettingsData, UserSettingsInput } from '@/lib/validations';
import { toast } from 'sonner';

export function useUserSettings() {
  const queryClient = useQueryClient();

  const { data: userSettings, isLoading, error } = useQuery({
    queryKey: ['user-settings'],
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (settings: UserSettingsInput) => updateUserSettings(settings),
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-settings'] });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData(['user-settings']);

      // Optimistically update to new value
      queryClient.setQueryData(['user-settings'], (old: UserSettingsData | undefined) => ({
        ...(old || {}),
        ...newSettings,
      }));

      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // Rollback on error
      queryClient.setQueryData(['user-settings'], context?.previousSettings);
      toast.error('Error al actualizar configuración');
    },
    onSuccess: () => {
      toast.success('Configuración actualizada correctamente');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  return {
    userSettings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}