'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { AccountSummaryCard } from '@/components/dashboard/AccountSummaryCard';
import { RecentTransactionsList } from '@/components/dashboard/RecentTransactionsList';
import { CreditCardSummary } from '@/components/dashboard/CreditCardSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { DollarWidget } from '@/components/dashboard/DollarWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu situación financiera
        </p>
      </div>
      
      {/* Métricas principales con datos reales */}
      <DashboardMetrics />

      {/* Cotización rápida */}
      <div className="grid gap-6 sm:grid-cols-2">
        <DollarWidget />
      </div>

      {/* Grid principal con información detallada */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Columna izquierda - Resumen de cuentas y tarjetas */}
        <div className="space-y-6">
          <AccountSummaryCard />
          <CreditCardSummary />
        </div>

        {/* Columna central - Transacciones recientes */}
        <div className="lg:col-span-2">
          <RecentTransactionsList limit={8} />
        </div>

        {/* Columna derecha - Acciones rápidas */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico financiero interactivo */}
        <FinancialChart />

        {/* Próximas facturas y metas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Próximas Facturas</CardTitle>
              <CardDescription>
                Pagos pendientes este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Funcionalidad en desarrollo</p>
                <p className="text-xs mt-1">Próximamente: gestión de facturas recurrentes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Progreso de Metas</CardTitle>
              <CardDescription>
                Estado de tus objetivos de ahorro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Funcionalidad en desarrollo</p>
                <p className="text-xs mt-1">Próximamente: seguimiento de metas de ahorro</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
