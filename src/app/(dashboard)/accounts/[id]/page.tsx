import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteAccountButton } from '@/components/accounts/delete-account-button';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

interface AccountDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

function getAccountTypeIcon(type: string) {
  switch (type) {
    case 'asset':
      return '💰';
    case 'liability':
      return '💳';
    case 'expense':
      return '📤';
    case 'revenue':
      return '📥';
    default:
      return '💰';
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

async function AccountDetailsContent({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    notFound();
  }

  const account = await db.account.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      accountType: true,
      currency: true,
      _count: {
        select: {
          transactions: true,
        }
      }
    },
  });

  if (!account) {
    notFound();
  }

  const totalTransactions = account._count.transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/accounts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Cuentas
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {getAccountTypeIcon(account.accountType.type)}
              {account.name}
            </h1>
            <p className="text-muted-foreground">
              Detalles de la cuenta
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/accounts/${account.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteAccountButton 
            account={account} 
            transactionCount={totalTransactions} 
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Cuenta</p>
                <Badge className={getAccountTypeColor(account.accountType.type)}>
                  {getAccountTypeName(account.accountType.type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={account.active ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                  {account.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {account.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moneda</p>
                <p className="font-medium">{account.currency.code} - {account.currency.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Símbolo</p>
                <p className="font-medium text-lg">{account.currency.symbol}</p>
              </div>
            </div>

            {account.iban && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">IBAN / Número de Cuenta</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border">{account.iban}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>Creada:</p>
                <p className="font-medium text-foreground">
                  {new Date(account.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p>Actualizada:</p>
                <p className="font-medium text-foreground">
                  {new Date(account.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance y Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Balance y Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {account.virtualBalance !== null && account.virtualBalance !== undefined && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Balance Actual</p>
                <p className="text-3xl font-bold text-blue-900">
                  {account.currency.symbol}{account.virtualBalance.toString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                <p className="text-sm text-muted-foreground">Transacciones</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {account.active ? '✅' : '❌'}
                </p>
                <p className="text-sm text-muted-foreground">Estado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Gestiona tu cuenta y crea transacciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" asChild>
              <Link href={`/transactions/create?account=${account.id}`}>
                Nueva Transacción
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/transactions?account=${account.id}`}>
                Ver Transacciones
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/accounts/${account.id}/edit`}>
                Editar Cuenta
              </Link>
            </Button>
            <Button variant="outline" disabled>
              Exportar Datos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AccountDetailsPage({ params }: AccountDetailsProps) {
  const resolvedParams = React.use(params);
  
  return (
    <Suspense fallback={<AccountDetailsSkeleton />}>
      <AccountDetailsContent params={resolvedParams} />
    </Suspense>
  );
}
