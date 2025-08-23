'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyARS, formatDateAR } from '@/lib/format';
import type { DolarQuote } from '@/lib/dollar';

export function DollarWidget() {
  const [quotes, setQuotes] = useState<DolarQuote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dollar');
        if (!res.ok) throw new Error('Error');
        const data = (await res.json()) as DolarQuote[];
        setQuotes(data);
      } catch (e) {
        setError('No disponible');
      }
    })();
  }, []);

  const oficial = quotes?.find((q) => q.casa?.toLowerCase() === 'oficial' || q.nombre?.toLowerCase().includes('oficial'));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Dólar Oficial</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-sm text-muted-foreground">{error}</div>
            ) : !oficial ? (
              <div className="text-sm text-muted-foreground">Cargando...</div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Compra</div>
                  <div className="font-semibold">{formatCurrencyARS(oficial.compra)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Venta</div>
                  <div className="font-semibold">{formatCurrencyARS(oficial.venta)}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cotizaciones del Dólar</DialogTitle>
          <DialogDescription>Datos provistos por DolarApi.com</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {quotes?.map((q) => (
            <Card key={q.nombre + q.casa}>
              <CardHeader>
                <CardTitle className="text-sm">{q.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Compra</div>
                    <div className="font-medium">{formatCurrencyARS(q.compra)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Venta</div>
                    <div className="font-medium">{formatCurrencyARS(q.venta)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatDateAR(q.fechaActualizacion)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
