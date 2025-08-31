'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavingGoal, SavingContribution } from '@/types/saving-goal';

const GOALS_QK = ['saving-goals'];

export function useSavingGoals() {
  return useQuery<SavingGoal[]>({
    queryKey: GOALS_QK,
    queryFn: async () => {
      const res = await fetch('/api/saving-goals');
      if (!res.ok) throw new Error('Error al cargar metas');
      return res.json();
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useSavingGoal(id?: string) {
  return useQuery<SavingGoal | null>({
    queryKey: [...GOALS_QK, id],
    queryFn: async () => {
      const list = await (await fetch('/api/saving-goals')).json();
      return (list as SavingGoal[]).find((g) => g.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Pick<SavingGoal, 'name' | 'currency' | 'targetAmount' | 'dueDate'>) => {
      const res = await fetch('/api/saving-goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Error al crear meta');
      return res.json();
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: GOALS_QK });
      const prev = qc.getQueryData<SavingGoal[]>(GOALS_QK) || [];
      const temp: SavingGoal = {
        id: `temp-${Math.random().toString(36).slice(2)}`,
        name: vars.name,
        currency: vars.currency,
        targetAmount: vars.targetAmount,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: vars.dueDate,
      };
      qc.setQueryData<SavingGoal[]>(GOALS_QK, [temp, ...prev]);
      return { prev, tempId: temp.id };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(GOALS_QK, ctx.prev); },
    onSuccess: (data, _v, ctx) => {
      qc.setQueryData<SavingGoal[]>(GOALS_QK, (old = []) => old.map((g) => (g.id === ctx?.tempId ? data : g)));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: GOALS_QK }),
  });
}

export function useUpdateSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SavingGoal> & { id: string }) => {
      const res = await fetch('/api/saving-goals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Error al actualizar meta');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_QK }),
  });
}

export function useDeleteSavingGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saving-goals?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar meta');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_QK }),
  });
}

export function useSavingContributions(goalId?: string) {
  return useQuery<SavingContribution[]>({
    queryKey: [...GOALS_QK, goalId, 'contributions'],
    queryFn: async () => {
      const res = await fetch(`/api/saving-goals/${goalId}/contributions`);
      if (!res.ok) throw new Error('Error al cargar aportes');
      return res.json();
    },
    enabled: !!goalId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useCreateSavingContribution(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<SavingContribution, 'id' | 'goalId' | 'createdAt'>) => {
      const res = await fetch(`/api/saving-goals/${goalId}/contributions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Error al crear aporte');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOALS_QK });
      qc.invalidateQueries({ queryKey: [...GOALS_QK, goalId, 'contributions'] });
    },
  });
}

export function useDeleteSavingContribution(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contributionId: string) => {
      const res = await fetch(`/api/saving-goals/${goalId}/contributions/delete?contributionId=${contributionId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Error al eliminar aporte');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOALS_QK });
      qc.invalidateQueries({ queryKey: [...GOALS_QK, goalId, 'contributions'] });
    },
  });
}
