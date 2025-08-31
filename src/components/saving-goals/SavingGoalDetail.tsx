"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSavingGoal, useSavingContributions, useCreateSavingContribution, useDeleteSavingContribution } from '@/hooks/use-saving-goals';
import { SavingContributionForm } from './SavingContributionForm';
import { formatCurrency, formatDateAR } from '@/lib/format';

export function SavingGoalDetail({ goalId }: { goalId: string }) {
  const { data: goal } = useSavingGoal(goalId);
  const { data: contributions = [] } = useSavingContributions(goalId);
  const create = useCreateSavingContribution(goalId);
  const remove = useDeleteSavingContribution(goalId);
  const [open, setOpen] = useState(false);

  if (!goal) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm">Agregar aporte</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo aporte</DialogTitle>
                <DialogDescription>Registra un nuevo aporte a esta meta</DialogDescription>
              </DialogHeader>
              <SavingContributionForm goalId={goal.id} defaultCurrency={goal.currency as any} onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex justify-between text-sm"><span>Objetivo</span><span className="font-medium">{formatCurrency(goal.targetAmount, goal.currency as any)}</span></div>
          <div className="flex justify-between text-sm"><span>Ahorrado</span><span className="font-medium">{formatCurrency(goal.currentAmount, goal.currency as any)}</span></div>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-2">Aportes</h4>
          <div className="divide-y border rounded">
            {contributions.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3">Sin aportes aún</div>
            ) : contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3">
                <div className="text-sm">
                  <div className="font-medium">{formatCurrency(c.amount, c.currency as any)}</div>
                  <div className="text-xs text-muted-foreground">{formatDateAR(c.date)}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)}>Eliminar</Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
