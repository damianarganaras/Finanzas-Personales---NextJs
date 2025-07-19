import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Obtener datos en paralelo para mejor performance
    const [
      accounts,
      currentMonthTransactions,
      lastMonthTransactions,
      budgets,
      creditCards,
      piggyBanks,
      bills
    ] = await Promise.all([
      // Cuentas con saldos
      db.account.findMany({
        where: { userId },
        include: {
          accountType: true,
          currency: true,
        },
      }),
      
      // Transacciones del mes actual
      db.transaction.findMany({
        where: {
          account: { userId },
          createdAt: { gte: startOfMonth },
        },
        include: {
          account: {
            include: { accountType: true }
          }
        }
      }),
      
      // Transacciones del mes pasado
      db.transaction.findMany({
        where: {
          account: { userId },
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth 
          },
        },
        include: {
          account: {
            include: { accountType: true }
          }
        }
      }),
      
      // Presupuestos activos
      db.budget.findMany({
        where: { userId, active: true },
        include: {
          budgetLimits: {
            where: {
              startDate: { lte: now },
              endDate: { gte: now }
            }
          }
        }
      }),
      
      // Tarjetas de crédito
      db.creditCard.findMany({
        where: { userId, active: true }
      }),
      
      // Metas de ahorro
      db.piggyBank.findMany({
        where: { userId }
      }),
      
      // Facturas próximas
      db.bill.findMany({
        where: { userId, active: true }
      })
    ]);

    // Calcular métricas del balance
    const assetAccounts = accounts.filter(acc => acc.accountType.type === 'asset');
    const liabilityAccounts = accounts.filter(acc => acc.accountType.type === 'liability');
    
    const totalAssets = assetAccounts.reduce((sum, acc) => sum + Number(acc.virtualBalance || 0), 0);
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + Number(acc.virtualBalance || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    // Calcular ingresos y gastos del mes actual
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.account.accountType.type === 'revenue')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.account.accountType.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    // Calcular ingresos y gastos del mes pasado para comparación
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.account.accountType.type === 'revenue')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.account.accountType.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    // Calcular porcentajes de cambio
    const incomeChange = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
    const expenseChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    // Calcular progreso de presupuestos
    const budgetProgress = budgets.map(budget => {
      const currentLimit = budget.budgetLimits[0];
      if (!currentLimit) return null;
      
      const spent = currentMonthTransactions
        .filter(t => t.account.accountType.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      
      const percentage = (spent / Number(currentLimit.amount)) * 100;
      
      return {
        id: budget.id,
        name: budget.name,
        limit: Number(currentLimit.amount),
        spent,
        percentage: Math.min(percentage, 100),
        remaining: Math.max(Number(currentLimit.amount) - spent, 0)
      };
    }).filter(Boolean);

    // Calcular progreso de metas de ahorro
    const savingsProgress = piggyBanks.map(piggy => ({
      id: piggy.id,
      name: piggy.name,
      target: Number(piggy.targetAmount),
      current: Number(piggy.currentAmount),
      percentage: (Number(piggy.currentAmount) / Number(piggy.targetAmount)) * 100,
      remaining: Number(piggy.targetAmount) - Number(piggy.currentAmount)
    }));

    // Calcular próximas facturas
    const upcomingBills = bills.map(bill => {
      const nextDue = new Date(bill.nextDueDate);
      const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: bill.id,
        name: bill.name,
        amount: Number(bill.amount),
        dueDate: bill.nextDueDate,
        daysUntilDue,
        frequency: bill.frequency
      };
    }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    const dashboardData = {
      // Métricas principales
      metrics: {
        netWorth,
        totalAssets,
        totalLiabilities,
        currentMonthIncome,
        currentMonthExpenses,
        incomeChange,
        expenseChange,
        savingsRate: currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0
      },
      
      // Resumen de cuentas
      accounts: {
        total: accounts.length,
        byType: {
          asset: assetAccounts.length,
          liability: liabilityAccounts.length,
          expense: accounts.filter(acc => acc.accountType.type === 'expense').length,
          revenue: accounts.filter(acc => acc.accountType.type === 'revenue').length
        },
        totalAssets,
        totalLiabilities
      },
      
      // Transacciones recientes
      recentTransactions: currentMonthTransactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          accountName: t.account.name,
          accountType: t.account.accountType.type,
          date: t.createdAt
        })),
      
      // Presupuestos
      budgets: budgetProgress,
      
      // Tarjetas de crédito
      creditCards: {
        total: creditCards.length,
        totalLimit: creditCards.reduce((sum, card) => sum + Number(card.limit), 0),
        cards: creditCards.map(card => ({
          id: card.id,
          name: card.name,
          limit: Number(card.limit),
          dueDay: card.dueDay
        }))
      },
      
      // Metas de ahorro
      savings: {
        total: savingsProgress.length,
        totalTarget: savingsProgress.reduce((sum, s) => sum + s.target, 0),
        totalCurrent: savingsProgress.reduce((sum, s) => sum + s.current, 0),
        averageProgress: savingsProgress.length > 0 ? 
          savingsProgress.reduce((sum, s) => sum + s.percentage, 0) / savingsProgress.length : 0,
        goals: savingsProgress
      },
      
      // Próximas facturas
      upcomingBills: upcomingBills.slice(0, 3),
      
      // Estadísticas adicionales
      stats: {
        totalTransactionsThisMonth: currentMonthTransactions.length,
        totalTransactionsLastMonth: lastMonthTransactions.length,
        transactionsChange: lastMonthTransactions.length > 0 ? 
          ((currentMonthTransactions.length - lastMonthTransactions.length) / lastMonthTransactions.length) * 100 : 0,
        activeBudgets: budgets.length,
        activeSavingsGoals: savingsProgress.filter(s => s.percentage < 100).length
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
