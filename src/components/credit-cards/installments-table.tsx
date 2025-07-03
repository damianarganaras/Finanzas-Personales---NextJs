'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InstallmentPayment } from '@/types/credit-card';
import { useInstallmentPayments } from '@/hooks/use-credit-cards';
import { toast } from 'sonner';

interface InstallmentsTableProps {
  installments: InstallmentPayment[];
}

function formatCurrency(amount: number, symbol: string = '$') {
  return `${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

function getStatusBadge(status: string, dueDate: Date) {
  const today = new Date();
  const isOverdue = dueDate < today && status === 'pending';
  
  if (status === 'paid') {
    return <Badge variant="default" className="bg-green-100 text-green-800">Pagada</Badge>;
  }
  
  if (isOverdue) {
    return <Badge variant="destructive">Vencida</Badge>;
  }
  
  return <Badge variant="secondary">Pendiente</Badge>;
}

export function InstallmentsTable({ installments }: InstallmentsTableProps) {
  const { payInstallment } = useInstallmentPayments();
  const [payingId, setPayingId] = useState<string | null>(null);

  const handlePayInstallment = async (installmentId: string) => {
    try {
      setPayingId(installmentId);
      await payInstallment(installmentId);
      toast.success('Cuota pagada exitosamente');
    } catch (error) {
      toast.error('Error al pagar la cuota');
      console.error('Error:', error);
    } finally {
      setPayingId(null);
    }
  };

  if (installments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay cuotas pendientes</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarjeta</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cuota</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((installment) => {
            const isOverdue = installment.dueDate < new Date() && installment.status === 'pending';
            
            return (
              <TableRow key={installment.id} className={isOverdue ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">
                  {installment.creditCardPurchase.creditCard.name}
                  <div className="text-sm text-muted-foreground">
                    •••• {installment.creditCardPurchase.creditCard.last4Digits}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {installment.creditCardPurchase.description}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(installment.creditCardPurchase.purchaseDate), 'dd/MM/yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  {installment.installmentNumber} / {installment.creditCardPurchase.installments}
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(installment.amount))}
                </TableCell>
                <TableCell>
                  <div className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                    {format(installment.dueDate, 'dd/MM/yyyy', { locale: es })}
                  </div>
                  {isOverdue && (
                    <div className="text-xs text-red-600">
                      Vencida
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(installment.status, installment.dueDate)}
                </TableCell>
                <TableCell>
                  {installment.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePayInstallment(installment.id)}
                      disabled={payingId === installment.id}
                    >
                      {payingId === installment.id ? 'Pagando...' : 'Pagar'}
                    </Button>
                  )}
                  {installment.status === 'paid' && installment.paidDate && (
                    <div className="text-sm text-muted-foreground">
                      Pagada el {format(installment.paidDate, 'dd/MM/yyyy')}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
