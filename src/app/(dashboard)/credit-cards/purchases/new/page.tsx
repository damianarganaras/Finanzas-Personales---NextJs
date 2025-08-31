'use client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { useTags, useCreateTag } from '@/hooks/use-tags';
import toast from 'react-hot-toast';

const schema = z.object({
  creditCardId: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  purchaseDate: z.coerce.date(),
  installments: z.coerce.number().min(1).max(60),
  financingType: z.enum(['no_interest','interest_fixed','interest_variable']),
  interestRate: z.coerce.number().optional(),
  description: z.string().min(1),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  if (data.financingType !== 'no_interest') {
    if (data.interestRate === undefined || isNaN(data.interestRate) || data.interestRate <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La tasa mensual es requerida y debe ser mayor a 0',
        path: ['interestRate'],
      });
    }
  }
});

type FormData = z.infer<typeof schema>;

export default function NewCreditCardPurchasePage() {
  const router = useRouter();
  const { creditCards, loading: cardsLoading } = useCreditCards();
  const { categories } = useCategories();
  const { tags } = useTags();
  const createCategory = useCreateCategory();
  const createTag = useCreateTag();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchaseDate: new Date(),
      installments: 1,
      financingType: 'no_interest',
      categoryIds: [],
      tagIds: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        creditCardId: data.creditCardId,
        totalAmount: data.totalAmount,
        installments: data.installments,
        hasInterest: data.financingType !== 'no_interest',
        interestRate: data.financingType === 'no_interest' ? undefined : data.interestRate,
        description: data.description,
        purchaseDate: data.purchaseDate.toISOString(),
        categoryIds: data.categoryIds,
        tagIds: data.tagIds,
      };
      const res = await fetch('/api/credit-cards/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al registrar compra');
      }
      toast.success('Compra registrada');
      router.push('/credit-cards');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error desconocido');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Nueva compra con tarjeta</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="creditCardId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarjeta</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tarjeta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cardsLoading ? null : creditCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ••••{c.last4Digits}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField name="totalAmount" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} onChange={(e)=>field.onChange(parseFloat(e.target.value)||0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="purchaseDate" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl><Input type="date" value={field.value?field.value.toISOString().split('T')[0]:''} onChange={(e)=>field.onChange(new Date(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField name="installments" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuotas</FormLabel>
                    <FormControl><Input type="number" min={1} max={60} {...field} onChange={(e)=>field.onChange(parseInt(e.target.value||'1',10))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="financingType" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financiación</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no_interest">Sin interés</SelectItem>
                        <SelectItem value="interest_fixed">Con interés (cuota fija)</SelectItem>
                        <SelectItem value="interest_variable">Con interés (variable)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {form.watch('financingType') !== 'no_interest' && (
                  <FormField name="interestRate" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa mensual (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} onChange={(e)=>field.onChange(parseFloat(e.target.value)||0)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Input {...field} placeholder="Comercio / detalle" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Categorías (multi-select simple con checkboxes) */}
              <div className="space-y-2">
                <FormLabel>Categorías</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {categories?.map((c: any) => {
                    const selected = (form.getValues('categoryIds') || []).includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current = form.getValues('categoryIds') || [];
                            form.setValue(
                              'categoryIds',
                              e.target.checked ? [...current, c.id] : current.filter((id) => id !== c.id),
                              { shouldDirty: true }
                            );
                          }}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Nueva categoría" onKeyDown={async (e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && target.value.trim()) {
                      e.preventDefault();
                      try {
                        const tempId = `temp-${Math.random().toString(36).slice(2)}`;
                        form.setValue('categoryIds', [...(form.getValues('categoryIds')||[]), tempId]);
                        const created = await createCategory.mutateAsync({ name: target.value.trim() });
                        form.setValue('categoryIds', (form.getValues('categoryIds')||[]).map((id)=> id===tempId? created.id: id));
                        target.value = '';
                        toast.success('Categoría creada');
                      } catch {
                        form.setValue('categoryIds', (form.getValues('categoryIds')||[]).filter((id)=>!id.startsWith('temp-')));
                        toast.error('No se pudo crear la categoría');
                      }
                    }
                  }} />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Etiquetas</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {tags?.map((t: any) => {
                    const selected = (form.getValues('tagIds') || []).includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current = form.getValues('tagIds') || [];
                            form.setValue(
                              'tagIds',
                              e.target.checked ? [...current, t.id] : current.filter((id) => id !== t.id),
                              { shouldDirty: true }
                            );
                          }}
                        />
                        <span>{t.name}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Nuevo tag" onKeyDown={async (e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && target.value.trim()) {
                      e.preventDefault();
                      try {
                        const tempId = `temp-${Math.random().toString(36).slice(2)}`;
                        form.setValue('tagIds', [...(form.getValues('tagIds')||[]), tempId]);
                        const created = await createTag.mutateAsync({ name: target.value.trim() });
                        form.setValue('tagIds', (form.getValues('tagIds')||[]).map((id)=> id===tempId? created.id: id));
                        target.value = '';
                        toast.success('Tag creado');
                      } catch {
                        form.setValue('tagIds', (form.getValues('tagIds')||[]).filter((id)=>!id.startsWith('temp-')));
                        toast.error('No se pudo crear el tag');
                      }
                    }
                  }} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
