'use client';

import { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BillsPage() {
  // Datos de prueba
  const bills = [
    {
      id: '1',
      name: 'Electricidad',
      amount: 120.30,
      dueDate: '2024-07-05',
      frequency: 'monthly',
      status: 'pending',
      lastPaid: '2024-06-05',
      category: 'Servicios',
      autoPayEnabled: true
    },
    {
      id: '2',
      name: 'Internet',
      amount: 39.99,
      dueDate: '2024-07-10',
      frequency: 'monthly',
      status: 'paid',
      lastPaid: '2024-06-28',
      category: 'Servicios',
      autoPayEnabled: true
    },
    {
      id: '3',
      name: 'Seguro del coche',
      amount: 85.50,
      dueDate: '2024-07-15',
      frequency: 'monthly',
      status: 'upcoming',
      lastPaid: '2024-06-15',
      category: 'Seguros',
      autoPayEnabled: false
    },
    {
      id: '4',
      name: 'Alquiler',
      amount: 850.00,
      dueDate: '2024-07-01',
      frequency: 'monthly',
      status: 'overdue',
      lastPaid: '2024-05-31',
      category: 'Vivienda',
      autoPayEnabled: false
    },
    {
      id: '5',
      name: 'Netflix',
      amount: 15.99,
      dueDate: '2024-07-20',
      frequency: 'monthly',
      status: 'upcoming',
      lastPaid: '2024-06-20',
      category: 'Entretenimiento',
      autoPayEnabled: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'upcoming': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalMonthlyBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter(bill => bill.status === 'paid');
  const overdueBills = bills.filter(bill => bill.status === 'overdue');
  const upcomingBills = bills.filter(bill => bill.status === 'upcoming' || bill.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona tus facturas recurrentes y pagos programados
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalMonthlyBills.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {bills.length} facturas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidBills.length}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingBills.length}</div>
            <p className="text-xs text-muted-foreground">
              Próximas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueBills.length}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="overdue">Vencidas</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="paid">Pagadas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Facturas</CardTitle>
              <CardDescription>
                Lista completa de facturas recurrentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(bill.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{bill.name}</h3>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status === 'paid' ? 'Pagada' :
                             bill.status === 'pending' ? 'Pendiente' :
                             bill.status === 'upcoming' ? 'Próxima' : 'Vencida'}
                          </Badge>
                          {bill.autoPayEnabled && (
                            <Badge variant="outline">Auto-pago</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Vence: {bill.dueDate}</span>
                          <span>{bill.category}</span>
                          <span>Frecuencia: {bill.frequency}</span>
                          {bill.status !== 'paid' && (
                            <span className={
                              getDaysUntilDue(bill.dueDate) < 0 ? 'text-red-600 font-medium' :
                              getDaysUntilDue(bill.dueDate) <= 3 ? 'text-yellow-600 font-medium' :
                              'text-blue-600'
                            }>
                              {getDaysUntilDue(bill.dueDate) < 0 
                                ? `${Math.abs(getDaysUntilDue(bill.dueDate))} días vencida`
                                : getDaysUntilDue(bill.dueDate) === 0 
                                ? 'Vence hoy'
                                : `${getDaysUntilDue(bill.dueDate)} días restantes`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€{bill.amount.toFixed(2)}</div>
                      {bill.status === 'pending' && (
                        <Button size="sm" className="mt-1">
                          Marcar como Pagada
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Facturas Vencidas</CardTitle>
              <CardDescription>Facturas que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueBills.length === 0 ? (
                <p className="text-muted-foreground">¡Excelente! No tienes facturas vencidas.</p>
              ) : (
                <p className="text-muted-foreground">Mostrando solo facturas vencidas...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Facturas</CardTitle>
              <CardDescription>Facturas que vencen pronto</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Mostrando facturas próximas a vencer...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Facturas Pagadas</CardTitle>
              <CardDescription>Facturas ya pagadas este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Mostrando facturas pagadas...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
