import { useState, useEffect } from 'react';
import type { AccountType } from '@/types';

export function useAccountTypes() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccountTypes() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/account-types');
        
        if (!response.ok) {
          throw new Error('Error al cargar los tipos de cuenta');
        }
        
        const data = await response.json();
        setAccountTypes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error cargando tipos de cuenta:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountTypes();
  }, []);

  return { accountTypes, loading, error };
}
