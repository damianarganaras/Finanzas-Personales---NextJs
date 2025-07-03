'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CreditCardFormData, CreditCardPurchase, InstallmentPayment, InstallmentPaymentSummary } from '@/types/credit-card';

export function useCreditCards() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/credit-cards');
      if (!response.ok) {
        throw new Error('Error al cargar tarjetas de crédito');
      }
      const data = await response.json();
      setCreditCards(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createCreditCard = async (data: CreditCardFormData) => {
    try {
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear tarjeta de crédito');
      }

      const newCreditCard = await response.json();
      setCreditCards(prev => [...prev, newCreditCard]);
      return newCreditCard;
    } catch (error) {
      throw error;
    }
  };

  const updateCreditCard = async (id: string, data: Partial<CreditCardFormData>) => {
    try {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar tarjeta de crédito');
      }

      const updatedCreditCard = await response.json();
      setCreditCards(prev => 
        prev.map(card => card.id === id ? updatedCreditCard : card)
      );
      return updatedCreditCard;
    } catch (error) {
      throw error;
    }
  };

  const deleteCreditCard = async (id: string) => {
    try {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar tarjeta de crédito');
      }

      setCreditCards(prev => prev.filter(card => card.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchCreditCards();
  }, []);

  return {
    creditCards,
    loading,
    error,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    refetch: fetchCreditCards,
  };
}

export function useCreditCardPurchases() {
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/credit-cards/purchases');
      if (!response.ok) {
        throw new Error('Error al cargar compras');
      }
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    loading,
    error,
    refetch: fetchPurchases,
  };
}

export function useInstallmentPayments() {
  const [installments, setInstallments] = useState<InstallmentPayment[]>([]);
  const [summary, setSummary] = useState<InstallmentPaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/credit-cards/installments');
      if (!response.ok) {
        throw new Error('Error al cargar cuotas');
      }
      const data = await response.json();
      setInstallments(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstallmentsSummary = async () => {
    try {
      const response = await fetch('/api/credit-cards/installments/summary');
      if (!response.ok) {
        throw new Error('Error al cargar resumen de cuotas');
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  const payInstallment = async (installmentId: string) => {
    try {
      const response = await fetch(`/api/credit-cards/installments/${installmentId}/pay`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al pagar cuota');
      }

      // Refrescar datos
      await fetchInstallments();
      await fetchInstallmentsSummary();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchInstallments();
    fetchInstallmentsSummary();
  }, []);

  return {
    installments,
    summary,
    loading,
    error,
    payInstallment,
    refetch: fetchInstallments,
  };
}
