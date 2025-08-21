'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { accountSchema, type AccountFormData } from '@/lib/validations';
import { useCurrencies } from '@/hooks/use-currencies';
import { useAccountTypes } from '@/hooks/use-account-types';
import { getAccountTypeName, getAccountTypeIconComponent } from '@/lib/account-types';

// Descripciones amigables para mostrar bajo el nombre
function getAccountTypeDescription(type: string): string {
  const map: Record<string, string> = {
    asset: 'Cuentas corrientes, ahorros, efectivo',
    liability: 'Tarjetas de crédito, préstamos',
    expense: 'Categorías de gastos',
    revenue: 'Fuentes de ingresos',
  };
  return map[String(type).toLowerCase()] || '';
}

export default function CreateAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Cargar datos desde la API
  const { currencies, loading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { accountTypes, loading: accountTypesLoading, error: accountTypesError } = useAccountTypes();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      accountTypeId: '',
      virtualBalance: 0,
      iban: '',
      active: true,
      currencyId: '',
    },
  });

  // Establecer moneda por defecto cuando se carguen las monedas
  useEffect(() => {
    if (currencies.length > 0 && !form.getValues('currencyId')) {
      const defaultCurrency = currencies.find(c => c.code === 'ARS') || currencies[0];
      form.setValue('currencyId', defaultCurrency.id);
    }
  }, [currencies, form]);

  async function onSubmit(data: AccountFormData) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/accounts');
        router.refresh();
      } else {
        const errorData = await response.json();
        form.setError('root', {
          type: 'manual',
          message: errorData.message || 'Error al crear la cuenta',
        });
      }
    } catch {
      form.setError('root', {
        type: 'manual',
        message: 'Ocurrió un error. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/accounts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Cuenta</h1>
          <p className="text-muted-foreground">
            Crea una nueva cuenta financiera
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Completa los datos para crear tu nueva cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mostrar errores de carga */}
            {(currenciesError || accountTypesError) && (
              <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-md">
                {currenciesError && <div>Error cargando monedas: {currenciesError}</div>}
                {accountTypesError && <div>Error cargando tipos de cuenta: {accountTypesError}</div>}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Cuenta</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Cuenta Corriente Principal"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cuenta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isLoading || accountTypesLoading}>
                            <SelectValue placeholder={
                              accountTypesLoading 
                                ? "Cargando tipos de cuenta..." 
                                : "Selecciona el tipo de cuenta"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountTypes.map((type) => {
                            const LabelIcon = getAccountTypeIconComponent(type.type);
                            return (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-start gap-2">
                                  <LabelIcon className="h-4 w-4 mt-1" />
                                  <div>
                                    <div className="font-medium">
                                      {getAccountTypeName(type.type)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {getAccountTypeDescription(type.type)}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isLoading || currenciesLoading}>
                            <SelectValue placeholder={
                              currenciesLoading 
                                ? "Cargando monedas..." 
                                : "Selecciona la moneda"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.code} - {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="virtualBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance Inicial (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número de cuenta o IBAN"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cuenta Activa</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Las cuentas inactivas no aparecen en transacciones
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="text-sm text-red-500">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear Cuenta'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/accounts">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
