'use client';

import { useState } from 'react';
import { CreditCard, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard as CreditCardType } from '@/types/credit-card';

interface CreditCardsListProps {
  creditCards: CreditCardType[];
}

function formatCurrency(amount: number, symbol: string = '$') {
  return `${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function CreditCardsList({ creditCards }: CreditCardsListProps) {
  if (creditCards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay tarjetas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando tu primera tarjeta de crédito.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {creditCards.map((creditCard) => (
        <CreditCardCard key={creditCard.id} creditCard={creditCard} />
      ))}
    </div>
  );
}

interface CreditCardCardProps {
  creditCard: CreditCardType;
}

function CreditCardCard({ creditCard }: CreditCardCardProps) {
  const pendingPayments = creditCard.purchases.reduce((total, purchase) => {
    return total + purchase.installmentPayments.length;
  }, 0);

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{creditCard.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={creditCard.active ? "default" : "secondary"}>
            {creditCard.active ? 'Activa' : 'Inactiva'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            •••• •••• •••• {creditCard.last4Digits}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Límite</p>
            <p className="font-semibold">
              {formatCurrency(Number(creditCard.limit), creditCard.account.currency.symbol)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Cuenta</p>
            <p className="font-semibold truncate">{creditCard.account.name}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Cierre</p>
            <p className="font-semibold">Día {creditCard.closingDay}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vencimiento</p>
            <p className="font-semibold">Día {creditCard.dueDay}</p>
          </div>
        </div>
        
        {pendingPayments > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cuotas pendientes</span>
              <Badge variant="outline">{pendingPayments}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
