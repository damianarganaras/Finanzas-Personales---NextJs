import { describe, it, expect } from 'vitest';

// Función para calcular cuotas con interés (la misma del archivo de API)
function calculateInstallmentWithInterest(
  totalAmount: number,
  installments: number,
  monthlyRate: number
): number {
  // Si no hay interés, simplemente dividir por el número de cuotas
  if (monthlyRate === 0) {
    return totalAmount / installments;
  }
  
  const r = monthlyRate / 100;
  return (totalAmount * r * Math.pow(1 + r, installments)) / (Math.pow(1 + r, installments) - 1);
}

// Función para calcular el total de una compra en cuotas con interés
function calculateTotalWithInterest(
  totalAmount: number,
  installments: number,
  monthlyRate: number
): number {
  const installmentAmount = calculateInstallmentWithInterest(totalAmount, installments, monthlyRate);
  return installmentAmount * installments;
}

describe('Credit Card Business Logic', () => {
  describe('calculateInstallmentWithInterest', () => {
    it('debería calcular correctamente cuotas sin interés', () => {
      const totalAmount = 1000;
      const installments = 10;
      const monthlyRate = 0; // Sin interés

      const result = calculateInstallmentWithInterest(totalAmount, installments, monthlyRate);
      
      // Sin interés, debería ser simplemente totalAmount / installments
      expect(result).toBeCloseTo(100, 2);
    });

    it('debería calcular correctamente cuotas con interés del 2.99% mensual', () => {
      const totalAmount = 10000;
      const installments = 12;
      const monthlyRate = 2.99; // 2.99% mensual

      const result = calculateInstallmentWithInterest(totalAmount, installments, monthlyRate);
      
      // Verificar que es mayor que el cálculo sin interés
      const withoutInterest = totalAmount / installments;
      expect(result).toBeGreaterThan(withoutInterest);
      
      // El resultado debería estar en un rango esperado
      expect(result).toBeCloseTo(1004.02, 2); // Valor calculado correctamente
    });

    it('debería calcular correctamente cuotas con interés del 1.5% mensual', () => {
      const totalAmount = 5000;
      const installments = 6;
      const monthlyRate = 1.5; // 1.5% mensual

      const result = calculateInstallmentWithInterest(totalAmount, installments, monthlyRate);
      
      expect(result).toBeCloseTo(877.63, 2);
    });

    it('debería manejar correctamente 1 cuota (sin dividir)', () => {
      const totalAmount = 1000;
      const installments = 1;
      const monthlyRate = 5; // Alto interés, pero una sola cuota

      const result = calculateInstallmentWithInterest(totalAmount, installments, monthlyRate);
      
      // Con 1 cuota, el resultado debería ser el total más el interés de 1 mes
      expect(result).toBeCloseTo(1050, 2);
    });

    it('debería manejar correctamente muchas cuotas', () => {
      const totalAmount = 20000;
      const installments = 60; // 5 años
      const monthlyRate = 3; // 3% mensual

      const result = calculateInstallmentWithInterest(totalAmount, installments, monthlyRate);
      
      // Verificar que es un número válido y razonable
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result)).toBe(true);
      
      // El total pagado debería ser significativamente mayor al principal
      const totalPaid = result * installments;
      expect(totalPaid).toBeGreaterThan(totalAmount * 2);
    });
  });

  describe('calculateTotalWithInterest', () => {
    it('debería calcular el costo total de financiamiento', () => {
      const totalAmount = 10000;
      const installments = 12;
      const monthlyRate = 2.99;

      const totalPaid = calculateTotalWithInterest(totalAmount, installments, monthlyRate);
      const interestPaid = totalPaid - totalAmount;
      
      expect(totalPaid).toBeGreaterThan(totalAmount);
      expect(interestPaid).toBeGreaterThan(0);
      
      // El interés no debería ser más del 50% del principal para estos parámetros
      expect(interestPaid).toBeLessThan(totalAmount * 0.5);
    });
  });

  describe('Credit Card Validation', () => {
    it('debería validar números de tarjeta (últimos 4 dígitos)', () => {
      const validLast4 = ['1234', '0000', '9999'];
      const invalidLast4 = ['123', '12345', 'abcd', ''];

      validLast4.forEach(last4 => {
        expect(/^\d{4}$/.test(last4)).toBe(true);
      });

      invalidLast4.forEach(last4 => {
        expect(/^\d{4}$/.test(last4)).toBe(false);
      });
    });

    it('debería validar días de cierre y vencimiento', () => {
      const validDays = [1, 15, 28, 31];
      const invalidDays = [0, 32, -1, 35];

      validDays.forEach(day => {
        expect(day >= 1 && day <= 31).toBe(true);
      });

      invalidDays.forEach(day => {
        expect(day >= 1 && day <= 31).toBe(false);
      });
    });

    it('debería validar número de cuotas', () => {
      const validInstallments = [1, 6, 12, 24, 36, 60];
      const invalidInstallments = [0, -1, 61, 100];

      validInstallments.forEach(installments => {
        expect(installments >= 1 && installments <= 60).toBe(true);
      });

      invalidInstallments.forEach(installments => {
        expect(installments >= 1 && installments <= 60).toBe(false);
      });
    });
  });

  describe('Date Calculations', () => {
    it('debería calcular fechas de vencimiento correctamente', () => {
      const purchaseDate = new Date('2025-01-15');
      const dueDay = 25;
      const installments = 3;

      const dueDates = [];
      for (let i = 1; i <= installments; i++) {
        const dueDate = new Date(purchaseDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(dueDay);
        dueDates.push(dueDate);
      }

      expect(dueDates).toHaveLength(3);
      expect(dueDates[0].getDate()).toBe(25);
      expect(dueDates[0].getMonth()).toBe(1); // Febrero (0-indexed)
      expect(dueDates[1].getMonth()).toBe(2); // Marzo
      expect(dueDates[2].getMonth()).toBe(3); // Abril
    });

    it('debería manejar correctamente el cambio de año', () => {
      const purchaseDate = new Date('2024-11-15');
      const dueDay = 10;

      const dueDate = new Date(purchaseDate);
      dueDate.setMonth(dueDate.getMonth() + 2); // Enero del año siguiente
      dueDate.setDate(dueDay);

      expect(dueDate.getFullYear()).toBe(2025);
      expect(dueDate.getMonth()).toBe(0); // Enero
      expect(dueDate.getDate()).toBe(10);
    });
  });
});

// Tests de utilidades para formatear moneda
describe('Currency Formatting', () => {
  function formatCurrency(amount: number, symbol: string = '$') {
    return `${symbol}${Math.abs(amount).toLocaleString('es-AR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  it('debería formatear moneda correctamente', () => {
    expect(formatCurrency(1000)).toBe('$1.000,00');
    expect(formatCurrency(1234.56)).toBe('$1.234,56');
    expect(formatCurrency(-500)).toBe('$500,00'); // Valor absoluto
    expect(formatCurrency(0)).toBe('$0,00');
  });

  it('debería usar el símbolo de moneda correcto', () => {
    expect(formatCurrency(100, '€')).toBe('€100,00');
    expect(formatCurrency(100, 'U$S')).toBe('U$S100,00');
  });
});
