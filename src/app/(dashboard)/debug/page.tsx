'use client';

import { useSession } from 'next-auth/react';
import { useAccounts } from '@/hooks/use-accounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const { data: accounts, isLoading, error } = useAccounts();

  const testAPI = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      console.log('API Response:', { status: response.status, data });
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Debug - Estado de la Aplicación</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
            <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
            <details>
              <summary className="cursor-pointer">Ver sesión completa</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(session, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Cuentas (Hook)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading.toString()}</p>
            <p><strong>Error:</strong> {error?.message || 'None'}</p>
            <p><strong>Accounts Count:</strong> {accounts?.length || 0}</p>
            <details>
              <summary className="cursor-pointer">Ver cuentas completas</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(accounts, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Manual API</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAPI}>
            Probar API /accounts
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Revisa la consola del navegador para ver el resultado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
