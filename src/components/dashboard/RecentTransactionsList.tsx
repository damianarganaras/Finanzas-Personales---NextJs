'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowUpDown, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useTransactions } from '@/hooks/use-transactions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Transaction } from '@/types/transaction';

interface RecentTransactionsListProps {
  className?: string;
  limit?: number;
}

export function RecentTransactionsList({ className, limit = 5 }: RecentTransactionsListProps) {
  const { transactions, loading, error } = useTransactions();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Transacciones Recientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !transactions) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Transacciones Recientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar transacciones</p>
        </CardContent>
      </Card>
    );
  }

  // Obtener las transacciones más recientes
  const recentTransactions = (transactions as Transaction[])
    .sort((a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  if (recentTransactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Transacciones Recientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <ArrowUpDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No hay transacciones aún
            </p>
            <Button size="sm" asChild>
              <Link href="/transactions/create">
                <Plus className="h-4 w-4 mr-1" />
                Primera Transacción
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Transacciones Recientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>
          {recentTransactions.length} transacción{recentTransactions.length !== 1 ? 'es' : ''} reciente{recentTransactions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.map((transaction: Transaction) => (
            <div key={transaction.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                {/* Icono basado en si es ingreso o egreso */}
                {Number(transaction.amount) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transaction.account.name}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(transaction.createdAt), 'dd MMM', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  Number(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Number(transaction.amount) > 0 ? '+' : ''}${Number(transaction.amount).toFixed(2)}
                </span>
                
                {/* Categorías */}
                {transaction.categories.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {transaction.categories[0].name}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Acciones */}
        <div className="flex gap-2 pt-4 border-t">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href="/transactions">
              Ver Todas
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1">
            <Link href="/transactions/create">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
