'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryData } from '@/hooks/use-reports';
import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';

interface CategoryBreakdownProps {
  data: CategoryData[];
  totalSpent: number;
  loading?: boolean;
}

export function CategoryBreakdown({ data, totalSpent, loading }: CategoryBreakdownProps) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'amount' | 'percentage'>('amount');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No hay gastos categorizados para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar los datos según la selección
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'amount') {
      return Math.abs(b.amount) - Math.abs(a.amount);
    }
    return b.percentage - a.percentage;
  });

  // Mostrar solo los primeros 5 elementos o todos según el estado
  const displayData = showAll ? sortedData : sortedData.slice(0, 5);

  // Calcular estadísticas
  const topCategory = sortedData[0];
  const averageSpending = Math.abs(totalSpent) / sortedData.length;
  const categoriesAboveAverage = sortedData.filter(
    cat => Math.abs(cat.amount) > averageSpending
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Desglose por Categoría</CardTitle>
            <p className="text-sm text-muted-foreground">
              Análisis detallado de tus gastos por categoría
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'amount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('amount')}
            >
              Por Monto
            </Button>
            <Button
              variant={sortBy === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('percentage')}
            >
              Por %
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resumen estadístico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Categoría Principal</p>
            <p className="font-medium">{topCategory?.name || 'N/A'}</p>
            <p className="text-sm text-red-600">
              ${Math.abs(topCategory?.amount || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Gasto Promedio</p>
            <p className="font-medium">${averageSpending.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">por categoría</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Categorías Activas</p>
            <p className="font-medium">{sortedData.length}</p>
            <p className="text-sm text-muted-foreground">
              {categoriesAboveAverage} sobre promedio
            </p>
          </div>
        </div>

        {/* Lista de categorías */}
        <div className="space-y-4">
          {displayData.map((category, index) => {
            const isAboveAverage = Math.abs(category.amount) > averageSpending;
            const progressColor = category.percentage > 20 ? 'bg-red-500' : 
                                 category.percentage > 10 ? 'bg-yellow-500' : 
                                 'bg-blue-500';

            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    {index === 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Mayor gasto
                      </Badge>
                    )}
                    {isAboveAverage && index > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Sobre promedio
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      ${Math.abs(category.amount).toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {category.percentage.toFixed(1)}%
                    </Badge>
                    {isAboveAverage ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={category.percentage} 
                    className="h-3"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-3 rounded-full transition-all ${progressColor}`}
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>

                {/* Información adicional para la categoría principal */}
                {index === 0 && (
                  <div className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">
                    Esta categoría representa {category.percentage.toFixed(1)}% de tus gastos totales.
                    {category.percentage > 30 && (
                      <span className="text-red-600 font-medium"> ⚠️ Considera revisar estos gastos.</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón para mostrar/ocultar todas las categorías */}
        {sortedData.length > 5 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  Mostrar menos <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Ver todas ({sortedData.length - 5} más) <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Consejos basados en los datos */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-900 mb-2">💡 Análisis Inteligente</h4>
          <div className="text-sm text-blue-800 space-y-1">
            {topCategory && topCategory.percentage > 40 && (
              <p>• Tu gasto principal ({topCategory.name}) representa más del 40% del total. Considera diversificar.</p>
            )}
            {categoriesAboveAverage > sortedData.length / 2 && (
              <p>• Tienes muchas categorías con gastos altos. Podría ser útil crear un presupuesto más detallado.</p>
            )}
            {sortedData.length < 4 && (
              <p>• Podrías beneficiarte de categorizar mejor tus gastos para un mejor control.</p>
            )}
            {sortedData.length > 10 && (
              <p>• Tienes una buena diversificación de gastos en {sortedData.length} categorías.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
