"use client";

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Currency } from '@/types/saving-goal';

const schema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  currency: z.enum(['ARS','USD']),
  date: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export function SavingContributionForm({ goalId, defaultCurrency = 'ARS', onSuccess, onCancel }: { goalId: string; defaultCurrency?: Currency; onSuccess?: () => void; onCancel?: () => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, currency: defaultCurrency, date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch(`/api/saving-goals/${goalId}/contributions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, date: new Date(data.date).toISOString() }) });
    if (!res.ok) return;
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={(e)=>field.onChange(parseFloat(e.target.value)||0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
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
        </div>
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha</FormLabel>
            <FormControl><Input type="date" value={field.value} onChange={(e)=>field.onChange(e.target.value)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Agregar</Button>
        </div>
      </form>
    </Form>
  );
}
