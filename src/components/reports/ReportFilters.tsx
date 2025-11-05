'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Filter, X, RotateCcw } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

import type { Account, Category } from '@/types';

export function ReportFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Parse initial values from URL
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    return {
      from: fromParam ? new Date(fromParam) : startOfMonth(new Date()),
      to: toParam ? new Date(toParam) : endOfMonth(new Date()),
    };
  });

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(() => {
    const accountsParam = searchParams.get('accounts');
    return accountsParam ? accountsParam.split(',') : [];
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoriesParam = searchParams.get('categories');
    return categoriesParam ? categoriesParam.split(',') : [];
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Update URL when filters change
  const updateUrl = (newFilters: {
    dateRange?: DateRange;
    accounts?: string[];
    categories?: string[];
  }) => {
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.dateRange !== undefined) {
      if (newFilters.dateRange.from) {
        params.set('from', format(newFilters.dateRange.from, 'yyyy-MM-dd'));
      } else {
        params.delete('from');
      }
      
      if (newFilters.dateRange.to) {
        params.set('to', format(newFilters.dateRange.to, 'yyyy-MM-dd'));
      } else {
        params.delete('to');
      }
    }

    if (newFilters.accounts !== undefined) {
      if (newFilters.accounts.length > 0) {
        params.set('accounts', newFilters.accounts.join(','));
      } else {
        params.delete('accounts');
      }
    }

    if (newFilters.categories !== undefined) {
      if (newFilters.categories.length > 0) {
        params.set('categories', newFilters.categories.join(','));
      } else {
        params.delete('categories');
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    const newRange = range || { from: undefined, to: undefined };
    setDateRange(newRange);
    updateUrl({ dateRange: newRange });
  };

  // Handle account selection
  const handleAccountToggle = (accountId: string) => {
    const newSelection = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    
    setSelectedAccounts(newSelection);
    updateUrl({ accounts: newSelection });
  };

  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelection);
    updateUrl({ categories: newSelection });
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultRange = {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    };
    setDateRange(defaultRange);
    setSelectedAccounts([]);
    setSelectedCategories([]);
    
    updateUrl({
      dateRange: defaultRange,
      accounts: [],
      categories: [],
    });
  };

  // Quick date range presets
  const setQuickRange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days - 1);
    const newRange = { from, to };
    setDateRange(newRange);
    updateUrl({ dateRange: newRange });
  };

  // Count active filters
  const activeFiltersCount = 
    (dateRange.from || dateRange.to ? 1 : 0) +
    selectedAccounts.length +
    selectedCategories.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reportes
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        </CardTitle>
        <CardDescription>
          Filtra los datos de los reportes por fecha, cuentas y categorías
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rango de Fechas</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="date-from" className="text-xs">Desde</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    const newRange = { ...dateRange, from: newDate };
                    setDateRange(newRange);
                    updateUrl({ dateRange: newRange });
                  }}
                  className="w-40"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="date-to" className="text-xs">Hasta</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    const newRange = { ...dateRange, to: newDate };
                    setDateRange(newRange);
                    updateUrl({ dateRange: newRange });
                  }}
                  className="w-40"
                />
              </div>
            </div>
            
            {/* Quick Range Buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(7)}
              >
                7d
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(30)}
              >
                30d
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(90)}
              >
                90d
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Cuentas ({selectedAccounts.length} seleccionadas)
          </Label>
          {accountsLoading ? (
            <div className="text-sm text-muted-foreground">Cargando cuentas...</div>
          ) : accounts && accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {accounts
                .filter((account: Account) => account.active)
                .map((account: Account) => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`account-${account.id}`}
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => handleAccountToggle(account.id)}
                    />
                    <Label
                      htmlFor={`account-${account.id}`}
                      className="text-sm font-normal cursor-pointer flex-1 truncate"
                    >
                      {account.name}
                    </Label>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay cuentas disponibles</div>
          )}
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Categorías ({selectedCategories.length} seleccionadas)
          </Label>
          {categoriesLoading ? (
            <div className="text-sm text-muted-foreground">Cargando categorías...</div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {categories.map((category: Category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer flex-1 truncate"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay categorías disponibles</div>
          )}
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Activos:</Label>
              <div className="flex flex-wrap gap-2">
                {(dateRange.from || dateRange.to) && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "dd/MM", { locale: es })} - ${format(dateRange.to, "dd/MM", { locale: es })}`
                      : "Fecha personalizada"
                    }
                  </Badge>
                )}
                {selectedAccounts.length > 0 && (
                  <Badge variant="outline">
                    {selectedAccounts.length} cuenta{selectedAccounts.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {selectedCategories.length > 0 && (
                  <Badge variant="outline">
                    {selectedCategories.length} categoría{selectedCategories.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}