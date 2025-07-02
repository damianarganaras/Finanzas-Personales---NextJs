'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountsList } from '@/components/accounts/accounts-list';

function AccountsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus cuentas financieras
          </p>
        </div>
        <Button asChild>
          <Link href="/accounts/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Link>
        </Button>
      </div>
      
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
    </div>
  );
}

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus cuentas financieras
          </p>
        </div>
        <Button asChild>
          <Link href="/accounts/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<AccountsSkeleton />}>
        <AccountsList />
      </Suspense>
    </div>
  );
}
