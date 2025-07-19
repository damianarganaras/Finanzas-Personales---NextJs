'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Receipt, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBills } from '@/hooks/use-bills';
import { BillForm } from './BillForm';
import { toast } from 'react-hot-toast';

interface BillListProps {
  bills: any[];
}

export function BillList({ bills }: BillListProps) {
  const { deleteBill, updateBill } = useBills();
  const [editingBill, setEditingBill] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const getStatusInfo = (bill: any) => {
    const dueDate = new Date(bill.nextDueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (!bill.active) {
      return {
        status: 'inactive',
        label: 'Inactiva',
        variant: 'secondary' as const,
        icon: <Pause className="h-4 w-4" />
      };
    }
    
    if (daysUntilDue < 0) {
      return {
        status: 'overdue',
        label: `Vencida (${Math.abs(daysUntilDue)} días)`,
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4" />
      };
    } else if (daysUntilDue <= 3) {
      return {
        status: 'urgent',
        label: `Vence en ${daysUntilDue} días`,
        variant: 'destructive' as const,
        icon: <Clock className="h-4 w-4" />
      };
    } else if (daysUntilDue <= 7) {
      return {
        status: 'upcoming',
        label: `${daysUntilDue} días restantes`,
        variant: 'default' as const,
        icon: <Clock className="h-4 w-4" />
      };
    } else {
      return {
        status: 'ok',
        label: format(dueDate, 'dd/MM/yyyy', { locale: es }),
        variant: 'secondary' as const,
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
  };

  const handleToggleActive = async (bill: any) => {
    try {
      await updateBill(bill.id, { active: !bill.active });
      toast.success(`Factura ${bill.active ? 'desactivada' : 'activada'} correctamente`);
    } catch (error) {
      console.error('Error al cambiar estado de la factura:', error);
      toast.error('Error al cambiar el estado de la factura');
    }
  };

  const handleDelete = async (billId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      return;
    }

    try {
      setIsDeleting(billId);
      await deleteBill(billId);
      toast.success('Factura eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      toast.error('Error al eliminar la factura');
    } finally {
      setIsDeleting(null);
    }
  };

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay facturas registradas</h3>
            <p className="text-muted-foreground">
              Comienza agregando tu primera factura recurrente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Facturas Registradas ({bills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bills.map(bill => {
              const statusInfo = getStatusInfo(bill);
              
              return (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    statusInfo.status === 'overdue' ? 'border-red-200 bg-red-50' :
                    statusInfo.status === 'urgent' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      statusInfo.status === 'overdue' ? 'bg-red-100' :
                      statusInfo.status === 'urgent' ? 'bg-yellow-100' :
                      statusInfo.status === 'inactive' ? 'bg-gray-100' :
                      'bg-blue-100'
                    }`}>
                      <Receipt className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{bill.name}</h3>
                        {bill.autoPayEnabled && (
                          <Badge variant="outline" className="text-xs">
                            Auto-pago
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bill.frequency === 'weekly' && 'Semanal'}
                        {bill.frequency === 'monthly' && 'Mensual'}
                        {bill.frequency === 'quarterly' && 'Trimestral'}
                        {bill.frequency === 'annually' && 'Anual'}
                        {bill.description && ` • ${bill.description}`}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {statusInfo.icon}
                        <span className="text-sm text-muted-foreground">
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${Number(bill.amount).toFixed(2)}
                      </div>
                      <Badge variant={statusInfo.variant} className="mt-1">
                        {bill.active ? (
                          statusInfo.status === 'overdue' ? 'Vencida' :
                          statusInfo.status === 'urgent' ? 'Urgente' :
                          statusInfo.status === 'upcoming' ? 'Próxima' :
                          'Activa'
                        ) : 'Inactiva'}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingBill(bill)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(bill)}>
                          {bill.active ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(bill.id)}
                          className="text-red-600"
                          disabled={isDeleting === bill.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting === bill.id ? 'Eliminando...' : 'Eliminar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      {editingBill && (
        <BillForm
          bill={editingBill}
          onClose={() => setEditingBill(null)}
          onSuccess={() => setEditingBill(null)}
        />
      )}
    </>
  );
}
