'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MonthlyData } from '@/hooks/use-reports';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface IncomeChartProps {
  data: MonthlyData[];
  loading?: boolean;
}

export function IncomeChart({ data, loading }: IncomeChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No hay datos financieros para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular tendencias
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalNet = data.reduce((sum, item) => sum + item.net, 0);
  const avgNet = totalNet / data.length;

  // Tendencia del último mes vs promedio
  const lastMonthNet = data[data.length - 1]?.net || 0;
  const netTrend = lastMonthNet - avgNet;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'income' && 'Ingresos: '}
              {entry.dataKey === 'expenses' && 'Gastos: '}
              {entry.dataKey === 'net' && 'Neto: '}
              ${Math.abs(entry.value).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const Chart = chartType === 'line' ? LineChart : BarChart;
  const ChartElements = chartType === 'line' ? (
    <>
      <Line 
        type="monotone" 
        dataKey="income" 
        stroke="#10b981" 
        strokeWidth={2}
        dot={{ r: 4 }}
        name="Ingresos"
      />
      <Line 
        type="monotone" 
        dataKey="expenses" 
        stroke="#ef4444" 
        strokeWidth={2}
        dot={{ r: 4 }}
        name="Gastos"
      />
      <Line 
        type="monotone" 
        dataKey="net" 
        stroke="#3b82f6" 
        strokeWidth={2}
        dot={{ r: 4 }}
        name="Neto"
      />
    </>
  ) : (
    <>
      <Bar dataKey="income" fill="#10b981" name="Ingresos" />
      <Bar dataKey="expenses" fill="#ef4444" name="Gastos" />
      <Bar dataKey="net" fill="#3b82f6" name="Neto" />
    </>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Flujo de Efectivo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Evolución de ingresos y gastos en los últimos 12 meses
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resumen de tendencias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Ingresos</p>
            <p className="text-xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Gastos</p>
            <p className="text-xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Flujo Neto</p>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-xl font-bold ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalNet.toFixed(2)}
              </p>
              {netTrend !== 0 && (
                <div className={`flex items-center ${netTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netTrend > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${Math.abs(value).toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {ChartElements}
            </Chart>
          </ResponsiveContainer>
        </div>

        {/* Análisis rápido */}
        <div className="mt-4 text-sm text-muted-foreground">
          {avgNet > 0 ? (
            <p>📈 Tu flujo de efectivo promedio es positivo: <span className="text-green-600 font-medium">${avgNet.toFixed(2)}/mes</span></p>
          ) : (
            <p>📉 Tu flujo de efectivo promedio es negativo: <span className="text-red-600 font-medium">${avgNet.toFixed(2)}/mes</span></p>
          )}
          {Math.abs(netTrend) > 50 && (
            <p className="mt-1">
              {netTrend > 0 ? '🔥' : '⚠️'} El mes pasado fue {netTrend > 0 ? 'mejor' : 'peor'} que el promedio por ${Math.abs(netTrend).toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
