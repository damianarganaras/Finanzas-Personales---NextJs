import { useState, useEffect } from 'react';
import type { Currency } from '@/types';

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/currencies');
        
        if (!response.ok) {
          throw new Error('Error al cargar las monedas');
        }
        
        const data = await response.json();
        setCurrencies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error cargando monedas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrencies();
  }, []);

  return { currencies, loading, error };
}
