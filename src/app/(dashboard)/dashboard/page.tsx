'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { AccountSummaryCard } from '@/components/dashboard/AccountSummaryCard';
import { RecentTransactionsList } from '@/components/dashboard/RecentTransactionsList';
import { CreditCardSummary } from '@/components/dashboard/CreditCardSummary';

export default function DashboardPage() {
  // Datos de ejemplo para las métricas principales
  const stats = [
    {
      title: 'Balance Total',
      value: '$12,234.56',
      description: '+20.1% desde el mes pasado',
      icon: Wallet,
      trend: 'up'
    },
    {
      title: 'Ingresos del Mes',
      value: '+$4,500.00',
      description: '+8.2% desde el mes pasado',
      icon: TrendingUp,
      trend: 'up'
    },
    {
      title: 'Gastos del Mes',
      value: '-$2,350.00',
      description: '-3.1% desde el mes pasado',
      icon: TrendingDown,
      trend: 'down'
    },
    {
      title: 'Metas de Ahorro',
      value: '3 activas',
      description: '67% completado promedio',
      icon: Target,
      trend: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu situación financiera
        </p>
      </div>
      
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          const isNegative = stat.trend === 'down';
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${
                  isPositive ? 'text-green-600' : 
                  isNegative ? 'text-red-600' : 
                  'text-muted-foreground'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  isPositive ? 'text-green-600' : 
                  isNegative ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid principal con información detallada */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda - Resumen de cuentas */}
        <div className="space-y-6">
          <AccountSummaryCard />
          <CreditCardSummary />
        </div>

        {/* Columna central - Transacciones recientes */}
        <div className="lg:col-span-2">
          <RecentTransactionsList limit={8} />
        </div>
      </div>

      {/* Gráficos y reportes adicionales */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Gastos por Categoría</CardTitle>
            <CardDescription>
              Distribución de gastos del mes actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Gráfico de gastos por categoría (próximamente)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Evolución del Balance</CardTitle>
            <CardDescription>
              Tendencia de tus finanzas en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Gráfico de evolución del balance (próximamente)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
