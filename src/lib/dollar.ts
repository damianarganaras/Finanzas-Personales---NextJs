import 'server-only';

export type DolarQuote = {
  moneda: 'USD';
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
};

export async function getDollarQuotes(options?: { cacheSeconds?: number }) {
  const { cacheSeconds = 600 } = options || {};
  const res = await fetch('https://dolarapi.com/v1/dolares', {
    next: { revalidate: cacheSeconds },
    cache: 'force-cache',
  });
  if (!res.ok) throw new Error('No se pudieron obtener cotizaciones');
  const data = (await res.json()) as DolarQuote[];
  return data;
}
