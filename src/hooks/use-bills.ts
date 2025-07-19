import { useState, useEffect } from 'react';
import type { Bill } from '@/types/bill';

interface UseBillsReturn {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  createBill: (bill: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Bill>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<Bill>;
  deleteBill: (id: string) => Promise<void>;
  refresh: () => void;
}

export function useBills(): UseBillsReturn {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bills');
      
      if (!response.ok) {
        throw new Error('Error al cargar facturas');
      }
      
      const billsData = await response.json();
      setBills(billsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createBill = async (billData: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Bill> => {
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        throw new Error('Error al crear factura');
      }

      const newBill = await response.json();
      setBills(prev => [...prev, newBill]);
      return newBill;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error desconocido');
    }
  };

  const updateBill = async (id: string, billData: Partial<Bill>): Promise<Bill> => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar factura');
      }

      const updatedBill = await response.json();
      setBills(prev => prev.map(bill => bill.id === id ? updatedBill : bill));
      return updatedBill;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error desconocido');
    }
  };

  const deleteBill = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar factura');
      }

      setBills(prev => prev.filter(bill => bill.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Error desconocido');
    }
  };

  const refresh = () => {
    fetchBills();
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return {
    bills,
    loading,
    error,
    createBill,
    updateBill,
    deleteBill,
    refresh
  };
}
