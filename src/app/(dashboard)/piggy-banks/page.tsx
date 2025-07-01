'use client';

import { useState } from 'react';
import { Plus, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PiggyBanksPage() {
  // Datos de prueba
  const piggyBanks = [
    {
      id: '1',
      name: 'Vacaciones de Verano',
      targetAmount: 2000,
      currentAmount: 1350,
      targetDate: '2024-08-15',
      monthlyContribution: 200,
      status: 'active',
      category: 'Viajes',
      notes: 'Viaje a Italia'
    },
    {
      id: '2',
      name: 'Fondo de Emergencia',
      targetAmount: 5000,
      currentAmount: 3250,
      targetDate: '2024-12-31',
      monthlyContribution: 300,
      status: 'active',
      category: 'Emergencias',
      notes: '6 meses de gastos'
    },
    {
      id: '3',
      name: 'Laptop Nueva',
      targetAmount: 1200,
      currentAmount: 1200,
      targetDate: '2024-06-30',
      monthlyContribution: 150,
      status: 'completed',
      category: 'Tecnología',
      notes: 'MacBook Pro M3'
    },
    {
      id: '4',
      name: 'Coche Nuevo',
      targetAmount: 15000,
      currentAmount: 2800,
      targetDate: '2025-06-30',
      monthlyContribution: 400,
      status: 'active',
      category: 'Transporte',
      notes: 'Entrada para coche híbrido'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthsUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffMonths = (target.getFullYear() - today.getFullYear()) * 12 + 
                      (target.getMonth() - today.getMonth());
    return diffMonths;
  };

  const totalTargetAmount = piggyBanks.reduce((sum, piggy) => sum + piggy.targetAmount, 0);
  const totalCurrentAmount = piggyBanks.reduce((sum, piggy) => sum + piggy.currentAmount, 0);
  const totalMonthlyContributions = piggyBanks
    .filter(piggy => piggy.status === 'active')
    .reduce((sum, piggy) => sum + piggy.monthlyContribution, 0);

  const activePiggyBanks = piggyBanks.filter(piggy => piggy.status === 'active');
  const completedPiggyBanks = piggyBanks.filter(piggy => piggy.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h1>
          <p className="text-muted-foreground">
            Define y alcanza tus objetivos financieros
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Meta
        </Button>
      </div>

      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objetivos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalTargetAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {piggyBanks.length} metas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ahorrado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalCurrentAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1)}% del objetivo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aporte Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalMonthlyContributions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Metas activas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedPiggyBanks.length}</div>
            <p className="text-xs text-muted-foreground">
              Este año
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metas Activas</CardTitle>
              <CardDescription>
                Metas de ahorro en progreso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {activePiggyBanks.map((piggy) => {
                const progressPercentage = (piggy.currentAmount / piggy.targetAmount) * 100;
                const remainingAmount = piggy.targetAmount - piggy.currentAmount;
                const monthsRemaining = getMonthsUntilTarget(piggy.targetDate);
                const requiredMonthlyAmount = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;
                
                return (
                  <div key={piggy.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{piggy.name}</h3>
                          <Badge className={getStatusColor(piggy.status)}>
                            {piggy.status === 'active' ? 'Activa' : 'Completada'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{piggy.notes}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          €{piggy.currentAmount.toFixed(2)} / €{piggy.targetAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {progressPercentage.toFixed(1)}% completado
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={progressPercentage} className="h-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Restante:</span>
                        <div className="font-medium">€{remainingAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha objetivo:</span>
                        <div className="font-medium">{piggy.targetDate}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aporte actual:</span>
                        <div className="font-medium">€{piggy.monthlyContribution.toFixed(2)}/mes</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aporte necesario:</span>
                        <div className={`font-medium ${
                          requiredMonthlyAmount > piggy.monthlyContribution ? 'text-red-600' : 'text-green-600'
                        }`}>
                          €{requiredMonthlyAmount.toFixed(2)}/mes
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Agregar Dinero
                      </Button>
                      <Button size="sm" variant="outline">
                        Editar Meta
                      </Button>
                      <Button size="sm" variant="outline">
                        Ver Historial
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Metas Completadas</CardTitle>
              <CardDescription>Objetivos que ya has alcanzado</CardDescription>
            </CardHeader>
            <CardContent>
              {completedPiggyBanks.length === 0 ? (
                <p className="text-muted-foreground">Aún no has completado ninguna meta de ahorro.</p>
              ) : (
                <div className="space-y-4">
                  {completedPiggyBanks.map((piggy) => (
                    <div key={piggy.id} className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{piggy.name}</h3>
                            <Badge className={getStatusColor(piggy.status)}>Completada</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{piggy.notes}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            €{piggy.targetAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ¡Objetivo alcanzado!
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Metas</CardTitle>
              <CardDescription>Lista completa de metas de ahorro</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vista general de todas las metas...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
