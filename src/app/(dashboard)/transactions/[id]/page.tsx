'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, FileText, Calendar, DollarSign, Tag, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTransactionById, useDeleteTransaction } from '@/hooks/use-transactions';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const { data: transaction, isLoading, error } = useTransactionById(transactionId);
  const deleteTransactionMutation = useDeleteTransaction();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return;
    }

    try {
      await deleteTransactionMutation.mutateAsync(transactionId);
      toast.success('Transacción eliminada correctamente');
      router.push('/dashboard/transactions');
    } catch (error) {
      toast.error('Error al eliminar la transacción');
    }
  };

  if (isLoading) {
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

  if (error || !transaction) {
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
                La transacción que buscas no existe o ha sido eliminada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'withdrawal':
        return 'Gasto';
      case 'deposit':
        return 'Ingreso';
      case 'transfer':
        return 'Transferencia';
  default:
    return type ?? 'unknown';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalle de Transacción</h1>
            <p className="text-muted-foreground">
              {transaction.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/transactions/${transactionId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleteTransactionMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteTransactionMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      {/* Información Principal */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Información General</span>
            </CardTitle>
            <Badge className={getTypeColor(transaction.type)}>
              {getTypeLabel(transaction.type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Fecha</span>
              </div>
              <p className="font-medium">
                {format(new Date(transaction.date ?? new Date()), 'PPP', { locale: es })}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Monto</span>
              </div>
              <p className="text-2xl font-bold">
                ${transaction.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Descripción</h4>
            <p className="text-sm text-muted-foreground">
              {transaction.description}
            </p>
          </div>

          {transaction.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Notas</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {transaction.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cuentas Involucradas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cuentas Involucradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transaction.sourceAccount && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Cuenta de Origen</h4>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium">{transaction.sourceAccount.name}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.sourceAccount.accountType.name}
                </p>
              </div>
            </div>
          )}
          
          {transaction.destinationAccount && (
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Cuenta de Destino</h4>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium">{transaction.destinationAccount.name}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.destinationAccount.accountType.name}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorías y Tags */}
      {(transaction.categories?.length > 0 || transaction.tags?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Categorización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.categories?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Categorías</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {transaction.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {transaction.tags?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Etiquetas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
