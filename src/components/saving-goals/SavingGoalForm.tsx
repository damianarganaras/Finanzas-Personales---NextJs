"use client";

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SavingGoal } from '@/types/saving-goal';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  currency: z.enum(['ARS','USD']),
  targetAmount: z.coerce.number().positive('El objetivo debe ser mayor a 0'),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function SavingGoalForm({ goal, onSuccess, onCancel }: { goal?: SavingGoal; onSuccess?: () => void; onCancel?: () => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: goal ? {
      name: goal.name,
      currency: goal.currency,
      targetAmount: goal.targetAmount,
      dueDate: goal.dueDate ?? '',
    } : {
      name: '',
      currency: 'ARS',
      targetAmount: 0,
      dueDate: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, dueDate: data.dueDate || undefined };
    const method = goal ? 'PUT' : 'POST';
    const body = goal ? { ...payload, id: goal.id } : payload;
    const res = await fetch('/api/saving-goals', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return;
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl><Input {...field} placeholder="Ej: Viaje a Bariloche" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="currency" render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="targetAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Monto objetivo</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={(e)=>field.onChange(parseFloat(e.target.value)||0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha objetivo (opcional)</FormLabel>
            <FormControl><Input type="date" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
