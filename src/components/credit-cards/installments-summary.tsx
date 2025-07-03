'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InstallmentPaymentSummary, InstallmentPayment } from '@/types/credit-card';
import { CalendarDays, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface InstallmentsSummaryProps {
  summary: InstallmentPaymentSummary | null;
  installments: InstallmentPayment[];
}

function formatCurrency(amount: number, symbol: string = '$') {
  return `${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function InstallmentsSummary({ summary, installments }: InstallmentsSummaryProps) {
  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay datos de resumen disponibles</p>
      </div>
    );
  }

  // Agrupar cuotas por mes
  const installmentsByMonth = installments.reduce((acc, installment) => {
    if (installment.status !== 'pending') return acc;
    
    const monthKey = format(installment.dueDate, 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(installment);
    return acc;
  }, {} as Record<string, InstallmentPayment[]>);

  const monthlyData = Object.entries(installmentsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6) // Próximos 6 meses
    .map(([monthKey, monthInstallments]) => ({
      month: monthKey,
      total: monthInstallments.reduce((sum, inst) => sum + Number(inst.amount), 0),
      count: monthInstallments.length,
      monthName: format(new Date(monthKey + '-01'), 'MMMM yyyy', { locale: es }),
    }));

  const maxMonthlyAmount = Math.max(...monthlyData.map(m => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Próximos Pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Próximos Pagos
          </CardTitle>
          <CardDescription>
            Cuotas que vencen en los próximos días
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.nextPayments.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-muted-foreground">No hay pagos próximos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {summary.nextPayments.slice(0, 5).map((installment) => {
                const isOverdue = installment.dueDate < new Date();
                return (
                  <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {installment.creditCardPurchase.creditCard.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {installment.creditCardPurchase.description} - Cuota {installment.installmentNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(Number(installment.amount))}
                      </div>
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                        {format(installment.dueDate, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    {isOverdue && (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proyección Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Proyección Mensual
          </CardTitle>
          <CardDescription>
            Distribución de cuotas por mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium capitalize">{month.monthName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({month.count} cuotas)
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(month.total)}
                  </span>
                </div>
                <Progress 
                  value={(month.total / maxMonthlyAmount) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(summary.totalPending)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              En todas las cuotas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cuotas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(summary.totalOverdue)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
