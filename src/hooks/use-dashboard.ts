import { useState, useEffect } from 'react';

interface DashboardMetrics {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  incomeChange: number;
  expenseChange: number;
  savingsRate: number;
}

interface DashboardAccounts {
  total: number;
  byType: {
    asset: number;
    liability: number;
    expense: number;
    revenue: number;
  };
  totalAssets: number;
  totalLiabilities: number;
}

interface DashboardTransaction {
  id: string;
  description: string;
  amount: number;
  accountName: string;
  accountType: string;
  date: string;
}

interface DashboardBudget {
  id: string;
  name: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
}

interface DashboardCreditCards {
  total: number;
  totalLimit: number;
  cards: {
    id: string;
    name: string;
    limit: number;
    dueDay: number;
  }[];
}

interface DashboardSavings {
  total: number;
  totalTarget: number;
  totalCurrent: number;
  averageProgress: number;
  goals: {
    id: string;
    name: string;
    target: number;
    current: number;
    percentage: number;
    remaining: number;
  }[];
}

interface DashboardBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  frequency: string;
}

interface DashboardStats {
  totalTransactionsThisMonth: number;
  totalTransactionsLastMonth: number;
  transactionsChange: number;
  activeBudgets: number;
  activeSavingsGoals: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  accounts: DashboardAccounts;
  recentTransactions: DashboardTransaction[];
  budgets: DashboardBudget[];
  creditCards: DashboardCreditCards;
  savings: DashboardSavings;
  upcomingBills: DashboardBill[];
  stats: DashboardStats;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard');
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refresh = () => {
    fetchDashboardData();
  };

  return {
    data,
    isLoading,
    error,
    refresh
  };
}
