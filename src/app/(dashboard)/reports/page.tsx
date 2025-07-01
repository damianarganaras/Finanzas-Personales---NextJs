'use client';

import { useState } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');

  // Datos de prueba para los reportes
  const expensesByCategory = [
    { category: 'Alimentación', amount: 285.50, percentage: 28.5, color: '#3b82f6' },
    { category: 'Transporte', amount: 150.30, percentage: 15.0, color: '#ef4444' },
    { category: 'Entretenimiento', amount: 120.75, percentage: 12.1, color: '#10b981' },
    { category: 'Servicios', amount: 275.60, percentage: 27.6, color: '#f59e0b' },
    { category: 'Compras', amount: 168.90, percentage: 16.9, color: '#8b5cf6' }
  ];

  const monthlyTrends = [
    { month: 'Enero', income: 2500, expenses: 1850, savings: 650 },
    { month: 'Febrero', income: 2500, expenses: 1920, savings: 580 },
    { month: 'Marzo', income: 2650, expenses: 1780, savings: 870 },
    { month: 'Abril', income: 2500, expenses: 2100, savings: 400 },
    { month: 'Mayo', income: 2500, expenses: 1650, savings: 850 },
    { month: 'Junio', income: 2500, expenses: 1890, savings: 610 }
  ];

  const budgetPerformance = [
    { category: 'Alimentación', budgeted: 400, spent: 285.50, variance: 114.50 },
    { category: 'Transporte', budgeted: 200, spent: 150.30, variance: 49.70 },
    { category: 'Entretenimiento', budgeted: 150, spent: 120.75, variance: 29.25 },
    { category: 'Servicios', budgeted: 300, spent: 275.60, variance: 24.40 }
  ];

  const totalIncome = monthlyTrends.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyTrends.reduce((sum, month) => sum + month.expenses, 0);
  const totalSavings = monthlyTrends.reduce((sum, month) => sum + month.savings, 0);
  const averageMonthlyExpenses = totalExpenses / monthlyTrends.length;
  const savingsRate = (totalSavings / totalIncome) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Analiza tus finanzas con reportes detallados y gráficos
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">Este mes</SelectItem>
              <SelectItem value="last-month">Mes anterior</SelectItem>
              <SelectItem value="this-quarter">Este trimestre</SelectItem>
              <SelectItem value="this-year">Este año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro Total</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {savingsRate.toFixed(1)}% de ingresos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">€{averageMonthlyExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por mes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Gastos por Categoría</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="budget">Rendimiento Presupuesto</TabsTrigger>
          <TabsTrigger value="networth">Patrimonio Neto</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
                <CardDescription>Distribución de gastos del período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expensesByCategory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">€{item.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Gastos</CardTitle>
                <CardDescription>Análisis detallado del período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total gastado:</span>
                    <span className="font-medium">€{expensesByCategory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Categoría más alta:</span>
                    <span className="font-medium">{expensesByCategory[0].category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Promedio por categoría:</span>
                    <span className="font-medium">€{(expensesByCategory.reduce((sum, item) => sum + item.amount, 0) / expensesByCategory.length).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transacciones:</span>
                    <span className="font-medium">47 transacciones</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Mensuales</CardTitle>
              <CardDescription>Evolución de ingresos, gastos y ahorros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Tendencia Ingresos</div>
                    <div className="text-lg font-bold text-green-600">+€150</div>
                    <div className="text-xs text-muted-foreground">vs mes anterior</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tendencia Gastos</div>
                    <div className="text-lg font-bold text-red-600">+€90</div>
                    <div className="text-xs text-muted-foreground">vs mes anterior</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tendencia Ahorros</div>
                    <div className="text-lg font-bold text-blue-600">+€210</div>
                    <div className="text-xs text-muted-foreground">vs mes anterior</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {monthlyTrends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">+€{month.income}</span>
                        <span className="text-red-600">-€{month.expenses}</span>
                        <span className="text-blue-600">=€{month.savings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento del Presupuesto</CardTitle>
              <CardDescription>Comparación entre presupuestado y gastado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetPerformance.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.category}</span>
                      <span className={`text-sm ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.variance >= 0 ? '+' : ''}€{item.variance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex space-x-2 text-sm text-muted-foreground">
                      <span>Presupuestado: €{item.budgeted}</span>
                      <span>Gastado: €{item.spent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (item.spent / item.budgeted) * 100 > 100 ? 'bg-red-500' : 
                          (item.spent / item.budgeted) * 100 > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((item.spent / item.budgeted) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patrimonio Neto</CardTitle>
              <CardDescription>Evolución de activos y pasivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">€8,450</div>
                    <div className="text-sm text-muted-foreground">Activos Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">€2,100</div>
                    <div className="text-sm text-muted-foreground">Pasivos Totales</div>
                  </div>
                </div>
                <div className="text-center border-t pt-4">
                  <div className="text-3xl font-bold text-blue-600">€6,350</div>
                  <div className="text-sm text-muted-foreground">Patrimonio Neto</div>
                  <div className="text-xs text-green-600">+€420 vs mes anterior</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
