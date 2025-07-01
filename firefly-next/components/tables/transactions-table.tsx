import React from 'react';
import { useTransactions } from '../../hooks/use-transactions';
import { Table } from '../ui/table';

const TransactionsTable = () => {
  const { transactions, isLoading, error } = useTransactions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading transactions</div>;

  return (
    <Table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Account</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td>{new Date(transaction.date).toLocaleDateString()}</td>
            <td>{transaction.description}</td>
            <td>{transaction.amount.toFixed(2)}</td>
            <td>{transaction.category}</td>
            <td>{transaction.account}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TransactionsTable;