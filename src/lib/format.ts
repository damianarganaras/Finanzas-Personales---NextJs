export function formatCurrencyARS(value: number) {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatDateAR(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}
