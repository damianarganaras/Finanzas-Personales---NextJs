'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target, PiggyBank } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';

interface MetricsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, description, icon: Icon, trend = 'neutral' }: MetricsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getTrendColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${getTrendColor()}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  className?: string;
}

export function DashboardMetrics({ className }: DashboardMetricsProps) {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Error al cargar métricas del dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metrics, savings, stats } = data;

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getChangeDescription = (change: number, period: string): string => {
    return `${formatChange(change)} desde el ${period}`;
  };

  const metricsData: MetricsCardProps[] = [
    {
      title: 'Patrimonio Neto',
      value: formatCurrency(metrics.netWorth),
      description: `Activos: ${formatCurrency(metrics.totalAssets)}`,
      icon: Wallet,
      trend: metrics.netWorth >= 0 ? 'up' : 'down'
    },
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(metrics.currentMonthIncome),
      description: getChangeDescription(metrics.incomeChange, 'mes pasado'),
      icon: TrendingUp,
      trend: metrics.incomeChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Gastos del Mes',
      value: formatCurrency(metrics.currentMonthExpenses),
      description: getChangeDescription(metrics.expenseChange, 'mes pasado'),
      icon: TrendingDown,
      trend: metrics.expenseChange <= 0 ? 'up' : 'down'
    },
    {
      title: 'Metas de Ahorro',
      value: `${savings.total} activas`,
      description: `${savings.averageProgress.toFixed(0)}% completado promedio`,
      icon: PiggyBank,
      trend: savings.averageProgress >= 50 ? 'up' : 'neutral'
    }
  ];

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`} data-testid="financial-metrics">
      {metricsData.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
