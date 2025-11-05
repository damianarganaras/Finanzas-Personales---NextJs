import { useState, useEffect } from 'react';

export interface ReportPeriod {
  start: Date;
  end: Date;
  days: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  transactions: number;
}

export interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface AccountBalance {
  total: number;
  accounts: number;
}

export interface TopTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  account: string;
  categories: string[];
}

export interface UpcomingBill {
  name: string;
  amount: number;
  dueDate: Date;
}

export interface ReportData {
  period: ReportPeriod;
  summary: ReportSummary;
  expensesByCategory: ExpenseByCategory[];
  monthlyData: MonthlyData[];
  accountBalances: Record<string, AccountBalance>;
  topTransactions: TopTransaction[];
  upcomingBills: UpcomingBill[];
}

export function useReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    accountIds?: string[];
    categoryIds?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.period) searchParams.append('period', params.period);
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);
      if (params?.accountIds?.length) searchParams.append('accountIds', params.accountIds.join(','));
      if (params?.categoryIds?.length) searchParams.append('categoryIds', params.categoryIds.join(','));

      const response = await fetch(`/api/reports?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar reportes');
      }

  const data = await response.json();
      
      // Convertir strings de fecha a objetos Date
      const processedData: ReportData = {
        ...data,
        period: {
          ...data.period,
          start: new Date(data.period.start),
          end: new Date(data.period.end)
        },
        topTransactions: (data.topTransactions as Array<{
          id: string; date: string | Date; description: string; amount: number; account: string; categories: string[];
        }>).map((t) => ({
          ...t,
          date: new Date(t.date)
        })),
        upcomingBills: (data.upcomingBills as Array<{ name: string; amount: number; dueDate: string | Date; }>).map((b) => ({
          ...b,
          dueDate: new Date(b.dueDate)
        }))
      };

      setReportData(processedData);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar reportes iniciales (últimos 30 días)
  useEffect(() => {
    fetchReports({ period: '30' });
  }, []);

  const refreshReports = () => {
    if (reportData) {
      fetchReports();
    }
  };

  const getReportsForPeriod = (period: string) => {
    fetchReports({ period });
  };

  const getReportsForDateRange = (startDate: string, endDate: string) => {
    fetchReports({ startDate, endDate });
  };

  const getReportsWithFilters = (filters: {
    dateRange?: { from?: Date; to?: Date };
    accountIds?: string[];
    categoryIds?: string[];
  }) => {
    return fetchReports({
      startDate: filters.dateRange?.from?.toISOString().split('T')[0],
      endDate: filters.dateRange?.to?.toISOString().split('T')[0],
      accountIds: filters.accountIds,
      categoryIds: filters.categoryIds
    });
  };

  return {
    reportData,
    loading,
    error,
    refreshReports,
    getReportsForPeriod,
    getReportsForDateRange,
    getReportsWithFilters,
  };
}
