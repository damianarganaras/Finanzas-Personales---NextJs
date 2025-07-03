'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useAccounts } from '@/hooks/use-accounts';
import { toast } from 'sonner';
import { filterAccountsByType } from '@/lib/account-types';
import { Account } from '@/types/account';

const creditCardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  last4Digits: z.string().regex(/^\d{4}$/, 'Deben ser exactamente 4 dígitos'),
  limit: z.string().min(1, 'El límite es requerido'),
  closingDay: z.string().min(1, 'El día de cierre es requerido'),
  dueDay: z.string().min(1, 'El día de vencimiento es requerido'),
  active: z.boolean(),
  accountId: z.string().min(1, 'La cuenta es requerida'),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

export default function CreateCreditCardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { createCreditCard } = useCreditCards();
  const { data: accounts } = useAccounts();

  // Filtrar solo cuentas de tipo liability (pasivos)
  const liabilityAccounts = filterAccountsByType(accounts, 'liability');

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      last4Digits: '',
      limit: '',
      closingDay: '',
      dueDay: '',
      active: true,
      accountId: '',
    },
  });

  const onSubmit = async (data: CreditCardFormData) => {
    try {
      setIsLoading(true);
      
      const formattedData = {
        ...data,
        limit: parseFloat(data.limit),
        closingDay: parseInt(data.closingDay),
        dueDay: parseInt(data.dueDay),
      };

      await createCreditCard(formattedData);
      
      toast.success('Tarjeta creada exitosamente');
      
      router.push('/credit-cards');
    } catch (error) {
      console.error('Error al crear tarjeta:', error);
      toast.error('No se pudo crear la tarjeta de crédito. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/credit-cards">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Tarjeta de Crédito</h1>
          <p className="text-muted-foreground">
            Agrega una nueva tarjeta de crédito a tu sistema
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Tarjeta</CardTitle>
            <CardDescription>
              Completa los datos de tu tarjeta de crédito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nombre de la Tarjeta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ej: Visa Santander"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Un nombre identificativo para tu tarjeta
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last4Digits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Últimos 4 Dígitos</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234"
                            maxLength={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Límite de Crédito</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100000"
                            step="0.01"
                            min="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closingDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Día de Cierre</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15"
                            min="1"
                            max="31"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Día del mes en que cierra la tarjeta (1-31)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Día de Vencimiento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            min="1"
                            max="31"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Día del mes en que vence el pago (1-31)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Cuenta Asociada</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una cuenta de pasivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {liabilityAccounts.map((account: Account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} ({account.currency.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Cuenta donde se registrarán los saldos de la tarjeta
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Tarjeta Activa
                          </FormLabel>
                          <FormDescription>
                            ¿Esta tarjeta está activa para usar?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Crear Tarjeta
                      </>
                    )}
                  </Button>
                  <Link href="/credit-cards">
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
