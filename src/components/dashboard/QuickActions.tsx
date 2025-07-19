'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpDown, CreditCard, Target, Receipt, Settings } from 'lucide-react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/use-dashboard';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  variant?: 'default' | 'outline' | 'secondary';
  badge?: string;
}

function QuickActionButton({ title, description, icon: Icon, href, variant = 'outline', badge }: QuickActionProps) {
  return (
    <Button variant={variant} asChild className="h-auto p-4 flex-col gap-2">
      <Link href={href}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="font-medium">{title}</span>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground text-center">{description}</p>
      </Link>
    </Button>
  );
}

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingBills = data?.upcomingBills?.length || 0;
  const activeBudgets = data?.stats?.activeBudgets || 0;
  const activeSavingsGoals = data?.stats?.activeSavingsGoals || 0;

  const quickActions: QuickActionProps[] = [
    {
      title: 'Nueva Transacción',
      description: 'Registrar ingreso o gasto',
      icon: Plus,
      href: '/transactions/create',
      variant: 'default'
    },
    {
      title: 'Transferir',
      description: 'Entre cuentas',
      icon: ArrowUpDown,
      href: '/transactions/create?type=transfer',
      variant: 'outline'
    },
    {
      title: 'Tarjeta de Crédito',
      description: 'Registrar compra',
      icon: CreditCard,
      href: '/credit-cards',
      variant: 'outline'
    },
    {
      title: 'Presupuestos',
      description: 'Gestionar gastos',
      icon: Target,
      href: '/budgets',
      variant: 'outline',
      badge: activeBudgets > 0 ? `${activeBudgets}` : undefined
    },
    {
      title: 'Facturas',
      description: 'Próximos pagos',
      icon: Receipt,
      href: '/bills',
      variant: 'outline',
      badge: upcomingBills > 0 ? `${upcomingBills}` : undefined
    },
    {
      title: 'Configuración',
      description: 'Ajustes y preferencias',
      icon: Settings,
      href: '/settings',
      variant: 'outline'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <QuickActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
