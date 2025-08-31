"use client";

import { useState, useMemo } from 'react';
import { Plus, PiggyBank, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSavingGoals, useDeleteSavingGoal } from '@/hooks/use-saving-goals';
import { SavingGoalForm } from './SavingGoalForm';
import { formatCurrency } from '@/lib/format';
import type { Currency, SavingGoal } from '@/types/saving-goal';
import { DollarWidget } from '@/components/dashboard/DollarWidget';

export function SavingGoalsList() {
  const { data: goals = [], isLoading, error } = useSavingGoals();
  const del = useDeleteSavingGoal();
  const [openCreate, setOpenCreate] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingGoal | null>(null);
  const [filterCurrency, setFilterCurrency] = useState<Currency | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    if (filterCurrency === 'ALL') return goals;
    return goals.filter((g) => g.currency === filterCurrency);
  }, [goals, filterCurrency]);

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando metas...</div>;
  }
  if (error) {
    return <div className="text-red-600">Error al cargar metas</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Metas de Ahorro</h2>
          <p className="text-sm text-muted-foreground">Seguimiento de tus objetivos</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1 text-sm" value={filterCurrency} onChange={(e)=>setFilterCurrency(e.target.value as any)}>
            <option value="ALL">Todas</option>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nueva meta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Meta</DialogTitle>
                <DialogDescription>Definí un objetivo de ahorro</DialogDescription>
              </DialogHeader>
              <SavingGoalForm onSuccess={() => setOpenCreate(false)} onCancel={() => setOpenCreate(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <PiggyBank className="h-10 w-10 mx-auto mb-2" />
            No hay metas aún.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const pct = Math.min(100, (g.currentAmount / Math.max(1, g.targetAmount)) * 100);
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            return (
              <Card key={g.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold">{g.name}</CardTitle>
                    <div className="flex gap-1">
                      <Dialog open={!!editGoal && editGoal.id === g.id} onOpenChange={(o)=>!o && setEditGoal(null)}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" onClick={()=>setEditGoal(g)}><Edit2 className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Meta</DialogTitle>
                            <DialogDescription>Actualizá datos de la meta</DialogDescription>
                          </DialogHeader>
                          <SavingGoalForm goal={g} onSuccess={()=>setEditGoal(null)} onCancel={()=>setEditGoal(null)} />
                        </DialogContent>
                      </Dialog>
                      <Button size="icon" variant="ghost" onClick={()=>del.mutate(g.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{g.currency}</Badge>
                    {g.dueDate && (<span>Hasta {new Date(g.dueDate).toLocaleDateString('es-AR')}</span>)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Objetivo</span>
                    <span className="font-medium">{formatCurrency(g.targetAmount, g.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ahorrado</span>
                    <span className="font-medium">{formatCurrency(g.currentAmount, g.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Faltante</span>
                    <span className="font-medium">{formatCurrency(remaining, g.currency)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
