'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';
import { useTags, useCreateTag } from '@/hooks/use-tags';
import { useTransactionById, useUpdateTransaction } from '@/hooks/use-transactions';
import type { Category, Tag } from '@/types';

// Esquema para edición de transacciones
const editFormSchema = z.object({
  type: z.enum(['withdrawal', 'deposit', 'transfer']),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().positive('El monto debe ser positivo'),
  date: z.date(),
  sourceAccountId: z.string(),
  destinationAccountId: z.string(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.type === 'withdrawal' && !data.sourceAccountId) {
    return false;
  }
  if (data.type === 'deposit' && !data.destinationAccountId) {
    return false;
  }
  if (data.type === 'transfer' && (!data.sourceAccountId || !data.destinationAccountId)) {
    return false;
  }
  return true;
}, {
  message: "Debe seleccionar las cuentas apropiadas según el tipo de transacción",
});

type EditFormData = z.infer<typeof editFormSchema>;

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [transactionType, setTransactionType] = useState<'withdrawal' | 'deposit' | 'transfer'>('withdrawal');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const { data: transaction, isLoading: transactionLoading, error: transactionError } = useTransactionById(transactionId);
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { tags, loading: tagsLoading } = useTags();
  
  const updateTransactionMutation = useUpdateTransaction();
  const createCategoryMutation = useCreateCategory();
  const createTagMutation = useCreateTag();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      type: 'withdrawal',
      description: '',
      amount: 0,
      date: new Date(),
      sourceAccountId: '',
      destinationAccountId: '',
      categoryIds: [],
      tagIds: [],
      notes: '',
    },
  });

  // Cargar datos de la transacción cuando están disponibles
  useEffect(() => {
    if (transaction) {
      setTransactionType(transaction.type as 'withdrawal' | 'deposit' | 'transfer');
      
      form.reset({
        type: transaction.type as 'withdrawal' | 'deposit' | 'transfer',
        description: transaction.description,
        amount: Math.abs(Number(transaction.amount)), // Siempre positivo en el formulario
  date: transaction.date ? new Date(transaction.date) : new Date(),
        sourceAccountId: transaction.sourceAccountId || '',
        destinationAccountId: transaction.destinationAccountId || '',
        categoryIds: transaction.categories?.map(c => c.id) || [],
        tagIds: transaction.tags?.map(t => t.id) || [],
        notes: transaction.notes || '',
      });
    }
  }, [transaction, form]);

  const handleTabChange = (value: string) => {
    const newType = value as 'withdrawal' | 'deposit' | 'transfer';
    setTransactionType(newType);
    form.setValue('type', newType);
    
    // Limpiar las cuentas seleccionadas al cambiar de tipo si no son compatibles
    if (newType === 'deposit') {
      form.setValue('sourceAccountId', '');
    }
    if (newType === 'withdrawal') {
      form.setValue('destinationAccountId', '');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategoryMutation.mutateAsync({ name: newCategoryName.trim() });
      setNewCategoryName('');
      setIsCreatingCategory(false);
      toast.success('Categoría creada correctamente');
    } catch (error) {
      toast.error('Error al crear la categoría');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await createTagMutation.mutateAsync({ name: newTagName.trim() });
      setNewTagName('');
      setIsCreatingTag(false);
      toast.success('Tag creado correctamente');
    } catch (error) {
      toast.error('Error al crear el tag');
    }
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      // Validar que las cuentas requeridas estén seleccionadas
      if (data.type === 'withdrawal' && !data.sourceAccountId) {
        toast.error('Debe seleccionar una cuenta de origen');
        return;
      }
      
      if (data.type === 'deposit' && !data.destinationAccountId) {
        toast.error('Debe seleccionar una cuenta de destino');
        return;
      }
      
      if (data.type === 'transfer' && (!data.sourceAccountId || !data.destinationAccountId)) {
        toast.error('Debe seleccionar tanto la cuenta de origen como la de destino');
        return;
      }

      await updateTransactionMutation.mutateAsync({
        id: transactionId,
        ...data,
        categoryIds: data.categoryIds || [],
        tagIds: data.tagIds || [],
      });
      
      toast.success('Transacción actualizada correctamente');
      router.push(`/dashboard/transactions/${transactionId}`);
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al actualizar la transacción'
      );
    }
  };

  if (transactionLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (transactionError || !transaction) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Transacción no encontrada
              </h2>
              <p className="text-gray-600">
                La transacción que intentas editar no existe o ha sido eliminada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar cuentas según el tipo
  const assetAccounts = accounts.filter(account => 
    account.accountType.type === 'asset'
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/transactions/${transactionId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Transacción</h1>
            <p className="text-muted-foreground">
              Modifica los detalles de la transacción
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Transacción */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Transacción</CardTitle>
              <CardDescription>
                Cambia el tipo de movimiento si es necesario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={transactionType} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="withdrawal">Gasto</TabsTrigger>
                  <TabsTrigger value="deposit">Ingreso</TabsTrigger>
                  <TabsTrigger value="transfer">Transferencia</TabsTrigger>
                </TabsList>

                <TabsContent value="withdrawal" className="space-y-4 mt-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-900">Editar un Gasto</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Dinero que sale de una de tus cuentas de activos
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="deposit" className="space-y-4 mt-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900">Editar un Ingreso</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Dinero que entra a una de tus cuentas de activos
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4 mt-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900">Editar una Transferencia</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Movimiento de dinero entre dos de tus cuentas de activos
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Detalles de la Transacción */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Transacción</CardTitle>
              <CardDescription>
                Modifica la información básica sobre la transacción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Compra de supermercado"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Cuentas */}
          <Card>
            <CardHeader>
              <CardTitle>Cuentas</CardTitle>
              <CardDescription>
                Modifica las cuentas involucradas en la transacción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(transactionType === 'withdrawal' || transactionType === 'transfer') && (
                <FormField
                  control={form.control}
                  name="sourceAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cuenta de origen *
                        {transactionType === 'withdrawal' && ' (de donde sale el dinero)'}
                        {transactionType === 'transfer' && ' (cuenta origen)'}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una cuenta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.currency.symbol} {account.virtualBalance ? Number(account.virtualBalance).toFixed(2) : '0.00'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(transactionType === 'deposit' || transactionType === 'transfer') && (
                <FormField
                  control={form.control}
                  name="destinationAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cuenta de destino *
                        {transactionType === 'deposit' && ' (donde entra el dinero)'}
                        {transactionType === 'transfer' && ' (cuenta destino)'}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una cuenta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.currency.symbol} {account.virtualBalance ? Number(account.virtualBalance).toFixed(2) : '0.00'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Categorías y Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Categorización</CardTitle>
              <CardDescription>
                Modifica las categorías y etiquetas de la transacción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categorías */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FormLabel>Categorías</FormLabel>
                  {!isCreatingCategory ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingCategory(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Nombre de la categoría"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim()}
                      >
                        Crear
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCreatingCategory(false);
                          setNewCategoryName('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {categories.map((category: Category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="categoryIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {category.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FormLabel>Etiquetas</FormLabel>
                  {!isCreatingTag ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingTag(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Etiqueta
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Nombre de la etiqueta"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                      >
                        Crear
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCreatingTag(false);
                          setNewTagName('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {tags.map((tag: Tag) => (
                          <FormField
                            key={tag.id}
                            control={form.control}
                            name="tagIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tag.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tag.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, tag.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tag.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {tag.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notas adicionales */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
              <CardDescription>
                Modifica la información adicional sobre la transacción (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Link href={`/dashboard/transactions/${transactionId}`}>
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={updateTransactionMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateTransactionMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
