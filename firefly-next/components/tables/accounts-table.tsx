import React from 'react';
import { useAccounts } from '../../hooks/use-accounts';
import { Table } from '../ui/table';

const AccountsTable = () => {
  const { accounts, isLoading, error } = useAccounts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading accounts</div>;

  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Balance</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map(account => (
          <tr key={account.id}>
            <td>{account.name}</td>
            <td>{account.accountType}</td>
            <td>{account.balance}</td>
            <td>
              <button>Edit</button>
              <button>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AccountsTable;