'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard as CreditCardIcon, AlertTriangle, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useCreditCards } from '@/hooks/use-credit-cards';
import type { CreditCard } from '@/types/credit-card';

interface CreditCardSummaryProps {
  className?: string;
}

export function CreditCardSummary({ className }: CreditCardSummaryProps) {
  const { creditCards, loading, error } = useCreditCards();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Tarjetas de Crédito</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !creditCards) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Tarjetas de Crédito</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar tarjetas</p>
        </CardContent>
      </Card>
    );
  }

  if (creditCards.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Tarjetas de Crédito</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CreditCardIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No hay tarjetas registradas
            </p>
            <Button size="sm" asChild>
              <Link href="/credit-cards/create">
                <Plus className="h-4 w-4 mr-1" />
                Primera Tarjeta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const activeCards = creditCards.filter((card: CreditCard) => card.active);
  const totalLimit = creditCards.reduce((sum: number, card: CreditCard) => sum + Number(card.limit), 0);
  
  // Obtener próximos vencimientos (simulado)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const upcomingDueDates = creditCards
    .filter((card: CreditCard) => card.active)
    .map((card: CreditCard) => {
      const dueDate = new Date(currentYear, currentMonth, card.dueDay);
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      return { card, dueDate };
    })
    .sort((a: any, b: any) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Tarjetas de Crédito</CardTitle>
          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>
          {activeCards.length} de {creditCards.length} activa{activeCards.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Límite total */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Límite Total</span>
          </div>
          <span className="font-bold text-lg">
            ${totalLimit.toFixed(2)}
          </span>
        </div>

        {/* Lista de tarjetas */}
        <div className="space-y-2">
          {creditCards.slice(0, 3).map((card: CreditCard) => (
            <div key={card.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {card.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ****{card.last4Digits}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  ${Number(card.limit).toFixed(0)}
                </span>
                {!card.active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactiva
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Próximos vencimientos */}
        {upcomingDueDates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Próximos Vencimientos
            </div>
            {upcomingDueDates.map(({ card, dueDate }: { card: CreditCard; dueDate: Date }) => {
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilDue <= 7;
              
              return (
                <div key={card.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {card.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {isUrgent && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                    <span className={isUrgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                      {daysUntilDue} día{daysUntilDue !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href="/credit-cards">
              Ver Todas
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1">
            <Link href="/credit-cards/create">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
