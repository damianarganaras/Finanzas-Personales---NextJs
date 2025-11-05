'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { AccountSummaryCard } from '@/components/dashboard/AccountSummaryCard';
import { RecentTransactionsList } from '@/components/dashboard/RecentTransactionsList';
import { CreditCardSummary } from '@/components/dashboard/CreditCardSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { DollarWidget } from '@/components/dashboard/DollarWidget';
import { SavingGoalsList } from '@/components/saving-goals/SavingGoalsList';
import { useUserSettings } from '@/hooks/use-user-settings';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { userSettings: settings, isLoading: settingsLoading } = useUserSettings();

  // Default widget visibility
  const defaultWidgets = {
    metrics: true,
    dollarWidget: true,
    accountSummary: true,
    creditCardSummary: true,
    recentTransactions: true,
    quickActions: true,
    financialChart: true,
    upcomingBills: false, // Por defecto oculto ya que está en desarrollo
    savingGoals: true,
  };

  // Get widget preferences from user settings or use defaults
  const widgets = settings?.dashboardWidgets || defaultWidgets;

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 lg:grid-cols-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

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
      {widgets.metrics && <DashboardMetrics />}

      {/* Cotización rápida */}
      {widgets.dollarWidget && (
        <div className="grid gap-6 sm:grid-cols-2">
          <DollarWidget />
        </div>
      )}

      {/* Grid principal con información detallada */}
      {(widgets.accountSummary || widgets.creditCardSummary || widgets.recentTransactions || widgets.quickActions) && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Columna izquierda - Resumen de cuentas y tarjetas */}
          {(widgets.accountSummary || widgets.creditCardSummary) && (
            <div className="space-y-6">
              {widgets.accountSummary && <AccountSummaryCard />}
              {widgets.creditCardSummary && <CreditCardSummary />}
            </div>
          )}

          {/* Columna central - Transacciones recientes */}
          {widgets.recentTransactions && (
            <div className="lg:col-span-2">
              <RecentTransactionsList limit={8} />
            </div>
          )}

          {/* Columna derecha - Acciones rápidas */}
          {widgets.quickActions && (
            <div>
              <QuickActions />
            </div>
          )}
        </div>
      )}

      {/* Gráficos y análisis */}
      {(widgets.financialChart || widgets.upcomingBills || widgets.savingGoals) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico financiero interactivo */}
          {widgets.financialChart && <FinancialChart />}

          {/* Próximas facturas y metas */}
          {(widgets.upcomingBills || widgets.savingGoals) && (
            <div className="space-y-6">
              {widgets.upcomingBills && (
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
              )}

              {/* Metas de ahorro reales */}
              {widgets.savingGoals && <SavingGoalsList />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
