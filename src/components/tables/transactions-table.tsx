'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteTransaction } from '@/hooks/use-transactions';
import toast from 'react-hot-toast';
import type { Transaction } from '@/types/transaction';

interface TransactionsTableProps {
  transactions: Transaction[];
}

function getTypeColor(amount: number) {
  if (amount > 0) {
    return 'bg-green-100 text-green-800 hover:bg-green-200';
  } else {
    return 'bg-red-100 text-red-800 hover:bg-red-200';
  }
}

function getTypeName(amount: number) {
  return amount > 0 ? 'Ingreso' : 'Gasto';
}

function formatCurrency(amount: number, symbol: string = '$') {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const deleteTransactionMutation = useDeleteTransaction();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, description: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la transacción "${description}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTransactionMutation.mutateAsync(id);
      toast.success('Transacción eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al eliminar la transacción'
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay transacciones para mostrar</p>
        <Link href="/dashboard/transactions/create">
          <Button className="mt-4">
            Crear primera transacción
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead>Categorías</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDate(transaction.transactionJournal.date)}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {transaction.transactionJournal.description}
                  </div>
                  {transaction.description && (
                    <div className="text-sm text-muted-foreground">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{transaction.account.name}</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {transaction.account.accountType.type === 'asset' ? 'Activo' :
                     transaction.account.accountType.type === 'expense' ? 'Gasto' :
                     transaction.account.accountType.type === 'revenue' ? 'Ingreso' :
                     transaction.account.accountType.type === 'liability' ? 'Pasivo' :
                     transaction.account.accountType.type}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {transaction.categories.length > 0 ? (
                    transaction.categories.map((category) => (
                      <Badge key={category.id} variant="secondary" className="text-xs">
                        {category.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin categoría</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(transaction.amount)}>
                  {getTypeName(transaction.amount)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className={`font-bold ${
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/transactions/${transaction.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/transactions/${transaction.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      disabled={deletingId === transaction.id}
                      onClick={() => handleDelete(
                        transaction.id, 
                        transaction.transactionJournal.description
                      )}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === transaction.id ? 'Eliminando...' : 'Eliminar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
