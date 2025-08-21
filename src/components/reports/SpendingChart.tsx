'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExpenseByCategory } from '@/hooks/use-reports';

interface SpendingChartProps {
  data: ExpenseByCategory[];
  loading?: boolean;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'
];

export function SpendingChart({ data, loading }: SpendingChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
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
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No hay datos de gastos para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tomar solo las top 8 categorías para mejor visualización
  const topCategories = data.slice(0, 8);
  const otherAmount = data.slice(8).reduce((sum, item) => sum + item.amount, 0);
  
  const chartData = [...topCategories];
  if (otherAmount > 0) {
    chartData.push({
      category: 'Otros',
      amount: otherAmount,
      transactions: data.slice(8).reduce((sum, item) => sum + item.transactions, 0)
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-blue-600">
            ${data.amount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.transactions} transacciones
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // No mostrar labels para segmentos muy pequeños
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribución de gastos en el período seleccionado
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {value} (${entry.payload.amount.toFixed(0)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Lista detallada */}
        <div className="mt-6 space-y-2">
          <h4 className="font-medium text-sm">Detalle por categoría:</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {chartData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.transactions} transacciones
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
