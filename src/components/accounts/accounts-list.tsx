'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Wallet, CreditCard, Landmark, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccounts } from '@/hooks/use-accounts';
import type { Account } from '@/types';

function getAccountTypeIcon(type: string) {
  switch (type) {
    case 'asset':
      return <Wallet className="h-5 w-5" />;
    case 'liability':
      return <CreditCard className="h-5 w-5" />;
    case 'expense':
      return <TrendingUp className="h-5 w-5" />;
    case 'revenue':
      return <Landmark className="h-5 w-5" />;
    default:
      return <Wallet className="h-5 w-5" />;
  }
}

function getAccountTypeName(type: string) {
  const names: Record<string, string> = {
    asset: 'Activo',
    liability: 'Pasivo',
    expense: 'Gasto',
    revenue: 'Ingreso'
  };
  return names[type] || type;
}

function getAccountTypeColor(type: string) {
  const colors: Record<string, string> = {
    asset: 'bg-green-100 text-green-800',
    liability: 'bg-red-100 text-red-800',
    expense: 'bg-orange-100 text-orange-800',
    revenue: 'bg-blue-100 text-blue-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

function AccountCard({ account }: { account: Account }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2 flex-1">
          {getAccountTypeIcon(account.accountType.type)}
          <div>
            <CardTitle className="text-lg">{account.name}</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className={getAccountTypeColor(account.accountType.type)}>
                {getAccountTypeName(account.accountType.type)}
              </Badge>
            </CardDescription>
          </div>
        </div>
        {!account.active && (
          <Badge variant="outline" className="text-gray-500">
            Inactiva
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {account.virtualBalance !== null && account.virtualBalance !== undefined && (
            <div className="text-2xl font-bold">
              ${account.virtualBalance.toString()} {account.currency?.symbol || ''}
            </div>
          )}
          {account.iban && (
            <div className="text-sm text-muted-foreground">
              <strong>IBAN:</strong> {account.iban}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Moneda: {account.currency?.code || 'N/A'}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/accounts/${account.id}`}>
              Ver Detalles
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/accounts/${account.id}/edit`}>
              Editar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountsList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Hubo un problema al cargar las cuentas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tus Cuentas</CardTitle>
          <CardDescription>
            Lista de todas tus cuentas financieras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <p>No tienes cuentas registradas aún.</p>
              <p className="text-sm">Comienza creando tu primera cuenta financiera.</p>
            </div>
            <Button asChild>
              <Link href="/accounts/create">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Cuenta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar cuentas por tipo
  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.accountType.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
        <div key={type}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {getAccountTypeIcon(type)}
            {getAccountTypeName(type)}s
            <Badge variant="outline">{typeAccounts.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {typeAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
