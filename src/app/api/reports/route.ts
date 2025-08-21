// API route for reports
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
  const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // días
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calcular fechas
    const now = new Date();
    const periodStart = startDate ? new Date(startDate) : new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    const periodEnd = endDate ? new Date(endDate) : now;

    // Queries en paralelo para optimizar performance
    const [
      transactions,
      categories,
      accounts,
      budgets,
      bills
    ] = await Promise.all([
      // Transacciones del período
      db.transaction.findMany({
        where: {
          transactionJournal: {
            userId: session.user.id,
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
        include: {
          account: {
            include: { accountType: true }
          },
          transactionJournal: true,
          categories: {
            include: { category: true }
          }
        },
      }),

      // Categorías del usuario
      db.category.findMany({
        where: {
          userId: session.user.id,
        },
      }),

      // Cuentas del usuario
      db.account.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          accountType: true
        }
      }),

      // Presupuestos
      db.budget.findMany({
        where: {
          userId: session.user.id,
          active: true,
        },
        include: {
          limits: true
        }
      }),

      // Facturas
      db.bill.findMany({
        where: {
          userId: session.user.id,
          active: true,
        },
      }),
    ]);

    // Procesar datos para reportes

    // 1. Gastos por categoría
    const expensesByCategory = categories.map(category => {
      const categoryTransactions = transactions.filter(t => 
        Number(t.amount) < 0 && // Solo gastos
        t.categories.some(tc => tc.category.id === category.id)
      );
      
      const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      
      return {
        category: category.name,
        amount: total,
        transactions: categoryTransactions.length
      };
    }).filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

    // 2. Ingresos vs Gastos por mes (últimos 12 meses)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionJournal.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => Number(t.amount) > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = Math.abs(monthTransactions
        .filter(t => Number(t.amount) < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0));

      monthlyData.push({
        month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }

    // 3. Saldos por tipo de cuenta
    const accountBalances = accounts.reduce((acc, account) => {
      const accountTransactions = transactions.filter(t => t.accountId === account.id);
  const balance = accountTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      const typeName = account.accountType.type;
      if (!acc[typeName]) {
        acc[typeName] = { total: 0, accounts: 0 };
      }
      
      acc[typeName].total += balance;
      acc[typeName].accounts += 1;
      
      return acc;
    }, {} as Record<string, { total: number; accounts: number }>);

    // 4. Resumen del período
    const totalIncome = transactions
      .filter(t => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = Math.abs(transactions
      .filter(t => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Number(t.amount), 0));

    const netFlow = totalIncome - totalExpenses;

    // 5. Top transacciones
    const topTransactions = transactions
      .sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        date: t.transactionJournal.date,
        description: t.transactionJournal.description,
        amount: Number(t.amount),
        account: t.account.name,
        categories: t.categories.map(tc => tc.category.name)
      }));

    const reportData = {
      period: {
        start: periodStart,
        end: periodEnd,
        days: Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalIncome,
        totalExpenses,
        netFlow,
        transactionCount: transactions.length
      },
      expensesByCategory,
      monthlyData,
      accountBalances,
      topTransactions,
      budgets: budgets.map(b => ({
        name: b.name,
        amount: Number(b.limits?.[0]?.amount || 0),
        // TODO: calcular gasto real vs presupuesto (implementar lógica específica)
      })),
      upcomingBills: bills
        .filter(b => {
          const dueDate = new Date(b.nextDueDate);
          return dueDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // próximos 30 días
        })
        .map(b => ({
          name: b.name,
          amount: b.amount.toNumber(),
          dueDate: b.nextDueDate
        }))
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
