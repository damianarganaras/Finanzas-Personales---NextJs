'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboard } from '@/hooks/use-dashboard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FinancialChartProps {
  className?: string;
}

export function FinancialChart({ className }: FinancialChartProps) {
  const { data, isLoading } = useDashboard();
  const [chartType, setChartType] = useState<'balance' | 'expenses'>('balance');

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium">Análisis Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium">Análisis Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Error al cargar datos del gráfico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Datos simulados para el gráfico de evolución del balance (últimos 6 meses)
  const balanceData = [
    { month: 'Ago', balance: data.metrics.netWorth - 1200 },
    { month: 'Sep', balance: data.metrics.netWorth - 800 },
    { month: 'Oct', balance: data.metrics.netWorth - 400 },
    { month: 'Nov', balance: data.metrics.netWorth - 100 },
    { month: 'Dic', balance: data.metrics.netWorth + 200 },
    { month: 'Ene', balance: data.metrics.netWorth }
  ];

  // Datos para el gráfico de gastos por categoría
  const expenseData = [
    { name: 'Comida', value: data.metrics.currentMonthExpenses * 0.3, color: '#8884d8' },
    { name: 'Transporte', value: data.metrics.currentMonthExpenses * 0.2, color: '#82ca9d' },
    { name: 'Entretenimiento', value: data.metrics.currentMonthExpenses * 0.15, color: '#ffc658' },
    { name: 'Servicios', value: data.metrics.currentMonthExpenses * 0.2, color: '#ff7c7c' },
    { name: 'Otros', value: data.metrics.currentMonthExpenses * 0.15, color: '#8dd1e1' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm">
            {`Balance: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            {`${formatCurrency(payload[0].value)} (${((payload[0].value / data.metrics.currentMonthExpenses) * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              {chartType === 'balance' ? 'Evolución del Balance' : 'Gastos por Categoría'}
            </CardTitle>
            <CardDescription>
              {chartType === 'balance' 
                ? 'Tendencia de tu patrimonio en los últimos 6 meses'
                : 'Distribución de gastos del mes actual'
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'balance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('balance')}
            >
              Balance
            </Button>
            <Button
              variant={chartType === 'expenses' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('expenses')}
            >
              Gastos
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'balance' ? (
              <LineChart data={balanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                />
                <YAxis 
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={12}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
