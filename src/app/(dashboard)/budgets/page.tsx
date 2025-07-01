'use client';

import { useState } from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BudgetsPage() {
  // Datos de prueba
  const budgets = [
    {
      id: '1',
      name: 'Alimentación',
      budgeted: 400,
      spent: 285.50,
      remaining: 114.50,
      period: 'monthly',
      category: 'Gastos esenciales',
      status: 'on-track'
    },
    {
      id: '2',
      name: 'Entretenimiento',
      budgeted: 150,
      spent: 165.30,
      remaining: -15.30,
      period: 'monthly',
      category: 'Ocio',
      status: 'over-budget'
    },
    {
      id: '3',
      name: 'Transporte',
      budgeted: 200,
      spent: 89.20,
      remaining: 110.80,
      period: 'monthly',
      category: 'Transporte',
      status: 'under-budget'
    },
    {
      id: '4',
      name: 'Servicios',
      budgeted: 300,
      spent: 275.60,
      remaining: 24.40,
      period: 'monthly',
      category: 'Gastos fijos',
      status: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-blue-100 text-blue-800';
      case 'under-budget': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'over-budget': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <TrendingUp className="h-4 w-4" />;
      case 'under-budget': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'over-budget': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground">
            Planifica y controla tus gastos mensuales
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestado</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalBudgeted.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudgeted) * 100).toFixed(1)}% del presupuesto
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restante</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{totalRemaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRemaining >= 0 ? 'Dentro del presupuesto' : 'Excedido'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Mes Actual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos del Mes</CardTitle>
              <CardDescription>
                Seguimiento de tus presupuestos para el mes actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {budgets.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{budget.name}</h3>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status === 'on-track' ? 'En el objetivo' :
                         budget.status === 'under-budget' ? 'Por debajo' :
                         budget.status === 'warning' ? 'Atención' : 'Excedido'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(budget.status)}
                      <span className="text-sm text-muted-foreground">
                        €{budget.spent.toFixed(2)} de €{budget.budgeted.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(budget.spent / budget.budgeted) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{budget.category}</span>
                    <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {budget.remaining >= 0 ? 'Restante: ' : 'Excedido: '}
                      €{Math.abs(budget.remaining).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Presupuestos</CardTitle>
              <CardDescription>Rendimiento de presupuestos anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí se mostraría el historial de presupuestos...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Gastos</CardTitle>
              <CardDescription>Patrones y tendencias en tus presupuestos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí se mostrarían gráficos y análisis...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
