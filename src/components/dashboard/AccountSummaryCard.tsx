'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, TrendingUp, TrendingDown, Plus, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useAccounts } from '@/hooks/use-accounts';
import { useUserSettings } from '@/hooks/use-user-settings';
import { createFormattersFromSettings } from '@/lib/utils/formatters';
import { getAccountTypeName, getAccountTypeColor } from '@/lib/account-types';
import { getAccountTypeIcon } from '@/lib/account-type-helpers';

interface AccountSummaryCardProps {
  className?: string;
}

export function AccountSummaryCard({ className }: AccountSummaryCardProps) {
  const { data: accounts, isLoading, error } = useAccounts();
  const { userSettings, isLoading: settingsLoading } = useUserSettings();

  const formatters = createFormattersFromSettings(userSettings || null);

  if (isLoading || settingsLoading) {
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
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
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
    <Card className={className} data-testid="account-summary">
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
        {/* Total Assets */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">Total Activos</span>
          </div>
          <span className="font-bold text-lg text-green-800 dark:text-green-200">
            {formatters.formatCurrency(assetTotal)}
          </span>
        </div>

        {/* Total Liabilities */}
        {liabilityTotal > 0 && (
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-200">Total Pasivos</span>
            </div>
            <span className="font-bold text-lg text-red-800 dark:text-red-200">
              {formatters.formatCurrency(Math.abs(liabilityTotal))}
            </span>
          </div>
        )}

        {/* Net Worth */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          netWorth >= 0 
            ? 'bg-blue-50 dark:bg-blue-950' 
            : 'bg-orange-50 dark:bg-orange-950'
        }`}>
          <div className="flex items-center gap-2">
            <DollarSign className={`h-4 w-4 ${
              netWorth >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`} />
            <span className={`font-medium ${
              netWorth >= 0 
                ? 'text-blue-800 dark:text-blue-200' 
                : 'text-orange-800 dark:text-orange-200'
            }`}>
              Patrimonio Neto
            </span>
          </div>
          <span className={`font-bold text-lg ${
            netWorth >= 0 
              ? 'text-blue-800 dark:text-blue-200' 
              : 'text-orange-800 dark:text-orange-200'
          }`}>
            {formatters.formatCurrency(netWorth)}
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
                  {formatters.formatCurrency(total)}
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
