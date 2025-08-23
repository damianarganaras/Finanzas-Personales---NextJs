'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions, useTransactionStats } from '@/hooks/use-transactions';
import { TransactionsTable } from '@/components/tables/transactions-table';

function getTypeColor(type: string) {
  switch (type) {
    case 'deposit':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'withdrawal':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'transfer':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

function formatCurrency(amount: number, symbol: string = '$') {
  return `${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  useEffect(() => { router.refresh(); /* ensure fresh data on entry */ }, []);
  
  const { transactions, loading, error } = useTransactions();
  const { stats, loading: statsLoading } = useTransactionStats();

  if (loading || statsLoading) {
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar transacciones</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Filtrar transacciones según el término de búsqueda
  const filteredTransactions = transactions.filter((transaction: any) =>
    transaction.transactionJournal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus movimientos financieros
          </p>
        </div>
        <Link href="/transactions/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <div className="text-green-600">+</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <div className="text-red-600">-</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <div className={stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}>
              {stats.netBalance >= 0 ? "+" : "-"}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(stats.netBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Transactions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="deposits">Ingresos</TabsTrigger>
          <TabsTrigger value="withdrawals">Gastos</TabsTrigger>
          <TabsTrigger value="transfers">Transferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Transacciones</CardTitle>
              <CardDescription>
                Lista completa de todas tus transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={filteredTransactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos</CardTitle>
              <CardDescription>Transacciones de ingresos y depósitos</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable 
                transactions={filteredTransactions.filter((t: any) => t.amount > 0)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Gastos</CardTitle>
              <CardDescription>Transacciones de gastos y retiros</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable 
                transactions={filteredTransactions.filter((t: any) => t.amount < 0)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transferencias</CardTitle>
              <CardDescription>Transferencias entre cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Las transferencias se muestran como pares de transacciones (origen y destino).
              </p>
              <TransactionsTable transactions={[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
