'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de prueba
  const transactions = [
    {
      id: '1',
      date: '2024-06-29',
      description: 'Compra de supermercado',
      amount: -85.50,
      type: 'withdrawal',
      category: 'Alimentación',
      account: 'Cuenta Corriente Principal',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-06-28',
      description: 'Salario mensual',
      amount: 2500.00,
      type: 'deposit',
      category: 'Salario',
      account: 'Cuenta Corriente Principal',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-06-27',
      description: 'Pago de electricidad',
      amount: -120.30,
      type: 'withdrawal',
      category: 'Servicios',
      account: 'Cuenta Corriente Principal',
      status: 'pending'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza todas tus transacciones financieras
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="deposits">Ingresos</TabsTrigger>
          <TabsTrigger value="withdrawals">Gastos</TabsTrigger>
          <TabsTrigger value="transfers">Transferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>
                Lista completa de todas las transacciones registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{transaction.description}</h3>
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type === 'deposit' ? 'Ingreso' : 
                           transaction.type === 'withdrawal' ? 'Gasto' : 'Transferencia'}
                        </Badge>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status === 'completed' ? 'Completado' : 
                           transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{transaction.date}</span>
                        <span>{transaction.category}</span>
                        <span>{transaction.account}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos</CardTitle>
              <CardDescription>Transacciones de ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí se mostrarían solo los ingresos...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Gastos</CardTitle>
              <CardDescription>Transacciones de gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí se mostrarían solo los gastos...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transferencias</CardTitle>
              <CardDescription>Transferencias entre cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí se mostrarían solo las transferencias...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
