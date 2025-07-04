'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAccounts } from '@/hooks/use-accounts';
import { getAccountTypeName, getAccountTypeColor } from '@/lib/account-types';
import { getAccountTypeIcon } from '@/lib/account-type-helpers';

interface AccountSummaryCardProps {
  className?: string;
}

export function AccountSummaryCard({ className }: AccountSummaryCardProps) {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Resumen de Cuentas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !accounts) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Resumen de Cuentas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar cuentas</p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar cuentas por tipo
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.accountType.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  // Calcular totales
  const assetTotal = accountsByType.asset?.reduce((sum, acc) => sum + Number(acc.virtualBalance || 0), 0) || 0;
  const liabilityTotal = accountsByType.liability?.reduce((sum, acc) => sum + Number(acc.virtualBalance || 0), 0) || 0;
  const netWorth = assetTotal - liabilityTotal;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Resumen de Cuentas</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>
          {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} registrada{accounts.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patrimonio Neto */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium">Patrimonio Neto</span>
          </div>
          <span className="font-bold text-lg">
            ${netWorth.toFixed(2)}
          </span>
        </div>

        {/* Resumen por tipo */}
        <div className="space-y-2">
          {Object.entries(accountsByType).map(([type, typeAccounts]) => {
            const total = typeAccounts.reduce((sum, acc) => sum + Number(acc.virtualBalance || 0), 0);
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAccountTypeIcon(type, { className: "h-4 w-4" })}
                  <span className="text-sm">
                    {getAccountTypeName(type)} ({typeAccounts.length})
                  </span>
                </div>
                <span className="text-sm font-medium">
                  ${total.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href="/accounts">
              Ver Todas
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1">
            <Link href="/accounts/create">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
