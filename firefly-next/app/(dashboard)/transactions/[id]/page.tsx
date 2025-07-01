import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getTransactionById } from '../../../lib/api'; // Adjust the import path as necessary
import TransactionDetails from '../../../components/TransactionDetails'; // Adjust the import path as necessary

const TransactionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchTransaction = async () => {
        try {
          const data = await getTransactionById(id);
          setTransaction(data);
        } catch (err) {
          setError('Error fetching transaction details');
        } finally {
          setLoading(false);
        }
      };

      fetchTransaction();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Transaction Details</h1>
      {transaction && <TransactionDetails transaction={transaction} />}
    </div>
  );
};

export default TransactionPage;