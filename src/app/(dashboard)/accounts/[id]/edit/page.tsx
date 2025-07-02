'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
import { useUpdateAccount, useAccountById } from '@/hooks/use-accounts';

// Funciones auxiliares para tipos de cuenta
function getAccountTypeName(type: string): string {
  const names: Record<string, string> = {
    asset: 'Activos',
    liability: 'Pasivos', 
    expense: 'Gastos',
    revenue: 'Ingresos'
  };
  return names[type] || type;
}

function getAccountTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    asset: 'Cuentas corrientes, ahorros, efectivo',
    liability: 'Tarjetas de crédito, préstamos',
    expense: 'Categorías de gastos',
    revenue: 'Fuentes de ingresos'
  };
  return descriptions[type] || '';
}

interface EditAccountPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditAccountPage({ params }: EditAccountPageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Cargar datos desde la API
  const { data: account, isLoading: accountLoading, error: accountError } = useAccountById(resolvedParams.id);
  const { currencies, loading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { accountTypes, loading: accountTypesLoading, error: accountTypesError } = useAccountTypes();
  const updateAccountMutation = useUpdateAccount();

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

  // Llenar el formulario cuando se cargue la cuenta
  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        accountTypeId: account.accountTypeId,
        virtualBalance: account.virtualBalance ? Number(account.virtualBalance) : 0,
        iban: account.iban || '',
        active: account.active,
        currencyId: account.currencyId || '',
      });
    }
  }, [account, form]);

  async function onSubmit(data: AccountFormData) {
    if (!account) return;
    
    setIsLoading(true);

    try {
      await updateAccountMutation.mutateAsync({
        id: account.id,
        ...data
      });
      
      toast.success(`Cuenta "${data.name}" actualizada correctamente`);
      router.push(`/accounts/${account.id}`);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la cuenta';
      toast.error(errorMessage);
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (accountLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (accountError || !account) {
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
            <h1 className="text-3xl font-bold tracking-tight">Error</h1>
            <p className="text-muted-foreground">
              No se pudo cargar la cuenta
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                {accountError instanceof Error ? accountError.message : 'Cuenta no encontrada'}
              </p>
              <Button asChild>
                <Link href="/accounts">Volver a Cuentas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/accounts/${account.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cuenta</h1>
          <p className="text-muted-foreground">
            Modifica los datos de "{account.name}"
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Actualiza los datos de tu cuenta financiera
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                          {accountTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div>
                                <div className="font-medium">
                                  {type.name || getAccountTypeName(type.type)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {type.description || getAccountTypeDescription(type.type)}
                                </div>
                              </div>
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
                  name="currencyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormLabel>Balance Actual</FormLabel>
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
                      <FormLabel>IBAN / Número de Cuenta (Opcional)</FormLabel>
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
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/accounts/${account.id}`}>Cancelar</Link>
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
