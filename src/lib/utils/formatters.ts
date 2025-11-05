import { UserSettingsData } from '@/lib/validations';

export function formatCurrency(
  amount: number, 
  currencyCode: string = 'ARS', 
  locale: string = 'es-AR'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to basic formatting if Intl fails
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export function formatNumber(
  amount: number,
  locale: string = 'es-AR'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

export function formatDate(
  date: Date,
  format: string = 'DD/MM/YYYY',
  locale: string = 'es-AR'
): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const formatted = new Intl.DateTimeFormat(locale, options).format(date);
    
    // Convert to requested format
    if (format === 'MM/DD/YYYY') {
      const parts = formatted.split('/');
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    } else if (format === 'YYYY-MM-DD') {
      const parts = formatted.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    return formatted; // DD/MM/YYYY default
  } catch (error) {
    return date.toLocaleDateString();
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    ARS: '$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    BRL: 'R$',
    CLP: '$',
    COP: '$',
    MXN: '$',
    PEN: 'S/',
    UYU: '$',
  };
  
  return symbols[currencyCode] || currencyCode;
}

// Hook-based formatters that use user settings
export function createFormattersFromSettings(settings: UserSettingsData | null) {
  const currencyCode = settings?.defaultCurrency || 'ARS';
  const locale = settings?.numberFormat || 'es-AR';
  const dateFormat = settings?.dateFormat || 'DD/MM/YYYY';

  return {
    formatCurrency: (amount: number) => formatCurrency(amount, currencyCode, locale),
    formatNumber: (amount: number) => formatNumber(amount, locale),
    formatDate: (date: Date) => formatDate(date, dateFormat, locale),
    currencySymbol: getCurrencySymbol(currencyCode),
  };
}