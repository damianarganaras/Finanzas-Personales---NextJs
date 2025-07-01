import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAccountById } from '../../../lib/api'; // Adjust the import path as necessary

const AccountDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchAccount = async () => {
        try {
          const data = await getAccountById(id);
          setAccount(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchAccount();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Account Details</h1>
      {account ? (
        <div>
          <h2>{account.name}</h2>
          <p>Type: {account.accountType}</p>
          <p>Balance: {account.balance}</p>
          <p>IBAN: {account.iban}</p>
          {/* Add more account details as needed */}
        </div>
      ) : (
        <p>No account found.</p>
      )}
    </div>
  );
};

export default AccountDetailPage;