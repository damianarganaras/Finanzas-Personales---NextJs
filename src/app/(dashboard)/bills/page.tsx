'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Receipt, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import { useBills } from '@/hooks/use-bills';
import { BillForm } from '@/components/bills/BillForm';
import { BillList } from '@/components/bills/BillList';
import { BillCalendar } from '@/components/bills/BillCalendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BillsPage() {
  const { bills, loading, error } = useBills();
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
            <p className="text-muted-foreground">Gestiona tus pagos recurrentes</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">Gestiona tus pagos recurrentes</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Error al cargar facturas: {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular estadísticas
  const activeBills = bills.filter(bill => bill.active);
  const totalMonthly = activeBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const upcomingBills = activeBills.filter(bill => {
    const dueDate = new Date(bill.nextDueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });
  const overdueBills = activeBills.filter(bill => {
    const dueDate = new Date(bill.nextDueDate);
    const today = new Date();
    return dueDate < today;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona tus pagos recurrentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
          >
            Calendario
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeBills.length} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Gastos recurrentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas (7 días)</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBills.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingBills.length > 0 ? 'Requieren atención' : 'Todo al día'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueBills.length}</div>
            <p className="text-xs text-red-600">
              {overdueBills.length > 0 ? 'Pagar urgente' : 'Todo pagado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {overdueBills.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Facturas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{bill.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Vencía: {format(new Date(bill.nextDueDate), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  <Badge variant="destructive">${Number(bill.amount).toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal */}
      {view === 'list' ? (
        <BillList bills={bills} />
      ) : (
        <BillCalendar bills={bills} />
      )}

      {/* Formulario modal */}
      {showForm && (
        <BillForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            // El refresh se maneja automáticamente en el hook
          }}
        />
      )}
    </div>
  );
}
