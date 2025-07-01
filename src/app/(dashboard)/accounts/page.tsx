import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

async function AccountsContent() {
  // Por ahora mostraremos un estado vacío
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
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<AccountsSkeleton />}>
      <AccountsContent />
    </Suspense>
  );
}
