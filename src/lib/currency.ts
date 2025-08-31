import type { DolarQuote } from './dollar';

export type Currency = 'ARS' | 'USD';

export function getOfficialQuote(quotes: DolarQuote[]): { compra: number; venta: number } | null {
  const oficial = quotes.find(
    (q) => q.casa?.toLowerCase() === 'oficial' || q.nombre?.toLowerCase().includes('oficial')
  );
  if (!oficial) return null;
  return { compra: Number(oficial.compra), venta: Number(oficial.venta) };
}

// Convert between ARS and USD using official quote
// Convention:
// - ARS -> USD: amount / venta (price to buy USD)
// - USD -> ARS: amount * compra (price to sell USD)
export function convertAmount(amount: number, from: Currency, to: Currency, quotes: DolarQuote[]): number {
  if (from === to) return amount;
  const official = getOfficialQuote(quotes);
  if (!official) throw new Error('Cotización oficial no disponible');
  if (from === 'ARS' && to === 'USD') return amount / official.venta;
  if (from === 'USD' && to === 'ARS') return amount * official.compra;
  return amount;
}
