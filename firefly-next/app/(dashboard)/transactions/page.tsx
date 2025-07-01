import React from 'react';
import { useTransactions } from '../../../hooks/use-transactions';
import TransactionsTable from '../../../components/tables/transactions-table';
import { MainLayout } from '../../../components/layout/main-layout';

const TransactionsPage = () => {
  const { transactions, isLoading, error } = useTransactions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading transactions</div>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <TransactionsTable transactions={transactions} />
    </MainLayout>
  );
};

export default TransactionsPage;