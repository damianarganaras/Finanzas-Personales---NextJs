import React from 'react';
import { useAccounts } from '../../../hooks/use-accounts';
import AccountsTable from '../../../components/tables/accounts-table';
import { Link } from 'react-router-dom';

const AccountsPage = () => {
  const { accounts, isLoading, error } = useAccounts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading accounts</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Accounts</h1>
      <Link to="/dashboard/accounts/create" className="btn btn-primary">
        Create New Account
      </Link>
      <AccountsTable accounts={accounts} />
    </div>
  );
};

export default AccountsPage;