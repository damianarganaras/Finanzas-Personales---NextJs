"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReports } from '@/hooks/use-reports';
import { SpendingChart } from '@/components/reports/SpendingChart';
import { IncomeChart } from '@/components/reports/IncomeChart';
import { CategoryBreakdown } from '@/components/reports/CategoryBreakdown';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export function ReportsClient() {
  const { reportData, loading, error, getReportsForPeriod } = useReports();
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365'>('30');

  const onChangePeriod = (value: string) => {
    const v = (value as '7' | '30' | '90' | '365');
    setPeriod(v);
    getReportsForPeriod(v);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Análisis y resúmenes financieros</p>
        </div>
        <Select value={period} onValueChange={onChangePeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
            <SelectItem value="365">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      <ReportFilters />

      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Generando reportes…</CardTitle>
            <CardDescription>Esto puede tardar unos segundos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && reportData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingChart data={reportData.expensesByCategory} />
          <IncomeChart data={reportData.monthlyData} />
          <CategoryBreakdown 
            data={reportData.expensesByCategory.map(c => ({ name: c.category, amount: c.amount, percentage: 0 }))}
            totalSpent={reportData.summary.totalExpenses}
          />
        </div>
      )}
    </div>
  );
}
