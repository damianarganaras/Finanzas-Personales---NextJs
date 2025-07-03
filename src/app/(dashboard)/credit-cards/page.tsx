'use client';

import { useState } from 'react';
import { Plus, CreditCard as CreditCardIcon, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreditCards, useInstallmentPayments } from '@/hooks/use-credit-cards';
import { CreditCardsList } from '@/components/credit-cards/credit-cards-list';
import { InstallmentsTable } from '@/components/credit-cards/installments-table';
import { InstallmentsSummary } from '@/components/credit-cards/installments-summary';

function formatCurrency(amount: number, symbol: string = '$') {
  return `${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export default function CreditCardsPage() {
  const { creditCards, loading: cardsLoading, error: cardsError } = useCreditCards();
  const { installments, summary, loading: installmentsLoading, error: installmentsError } = useInstallmentPayments();

  if (cardsLoading || installmentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (cardsError || installmentsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">{cardsError || installmentsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarjetas de Crédito</h1>
          <p className="text-muted-foreground">
            Gestiona tus tarjetas de crédito y cuotas pendientes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/credit-cards/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarjeta
            </Button>
          </Link>
          <Link href="/transactions/create?type=credit_card_purchase">
            <Button variant="outline">
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuotas Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total a pagar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuotas Vencidas</CardTitle>
              <div className="text-red-600">⚠️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalOverdue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.monthlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pagos del mes actual
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarjetas Activas</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {creditCards.filter(card => card.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                De {creditCards.length} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="installments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installments">Cuotas Pendientes</TabsTrigger>
          <TabsTrigger value="cards">Mis Tarjetas</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="installments">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas Pendientes</CardTitle>
              <CardDescription>
                Próximos pagos y cuotas vencidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstallmentsTable installments={installments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle>Mis Tarjetas de Crédito</CardTitle>
              <CardDescription>
                Gestiona tus tarjetas de crédito y límites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreditCardsList creditCards={creditCards} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <InstallmentsSummary summary={summary} installments={installments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
