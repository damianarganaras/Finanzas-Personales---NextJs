import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu situación financiera
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Por ahora mostraremos datos de ejemplo
  const stats = [
    {
      title: 'Balance Total',
      value: '$12,234.56',
      description: '+20.1% desde el mes pasado',
      icon: Wallet,
      trend: 'up' as const,
    },
    {
      title: 'Ingresos',
      value: '$4,500.00',
      description: '+10.5% desde el mes pasado',
      icon: TrendingUp,
      trend: 'up' as const,
    },
    {
      title: 'Gastos',
      value: '$2,234.56',
      description: '-5.2% desde el mes pasado',
      icon: TrendingDown,
      trend: 'down' as const,
    },
    {
      title: 'Presupuesto',
      value: '75%',
      description: 'Utilizado este mes',
      icon: Target,
      trend: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {session.user?.name}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === 'up' 
                  ? 'text-green-600' 
                  : stat.trend === 'down' 
                  ? 'text-red-600' 
                  : 'text-muted-foreground'
              }`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>
              Tus últimas transacciones financieras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-6 text-muted-foreground">
                No hay transacciones aún.
                <br />
                <span className="text-sm">Comienza creando tu primera cuenta y transacción.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
            <CardDescription>
              Tus categorías de gasto principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <div className="text-sm">
                Los gráficos aparecerán cuando tengas transacciones registradas.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
