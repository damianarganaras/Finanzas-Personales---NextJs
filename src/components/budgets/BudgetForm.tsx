'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Calendar, DollarSign, Tag } from 'lucide-react'
import { useCategories } from '@/hooks/use-categories'
import { useBudgetForm, useCreateBudget, useUpdateBudget } from '@/hooks/use-budgets'
import type { Budget } from '@/types/budget'
import type { Category } from '@/types/transaction'

interface BudgetFormProps {
  budget?: Budget
  onSuccess?: () => void
  onCancel?: () => void
}

export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const { categories } = useCategories()
  
  const { formData, errors, updateField, validateForm, reset } = useBudgetForm(budget)
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  const isEditing = !!budget
  const isLoading = createBudget.isPending || updateBudget.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (isEditing) {
        await updateBudget.mutateAsync({
          id: budget.id,
          ...formData,
          startDate: formData.startDate,
          endDate: formData.endDate,
        })
      } else {
        await createBudget.mutateAsync({
          ...formData,
          startDate: formData.startDate,
          endDate: formData.endDate,
        })
        reset()
      }
      
      onSuccess?.()
    } catch (error) {
      // El error se maneja en los hooks
    }
  }

  const addCategory = (categoryId: string) => {
    if (!formData.categoryIds.includes(categoryId)) {
      updateField('categoryIds', [...formData.categoryIds, categoryId])
    }
  }

  const removeCategory = (categoryId: string) => {
    updateField('categoryIds', formData.categoryIds.filter(id => id !== categoryId))
  }

  const selectedCategories = categories.filter((cat: Category) => 
    formData.categoryIds.includes(cat.id)
  )

  const unselectedCategories = categories.filter((cat: Category) => 
    !formData.categoryIds.includes(cat.id)
  )

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {isEditing ? 'Editar Presupuesto' : 'Crear Presupuesto'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Modifica los detalles de tu presupuesto'
            : 'Define un nuevo presupuesto para controlar tus gastos'
          }
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Nombre del presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del presupuesto</Label>
            <Input
              id="name"
              placeholder="Ej: Alimentación, Entretenimiento"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Monto del presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto del presupuesto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => updateField('startDate', new Date(e.target.value))}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate.toISOString().split('T')[0]}
                onChange={(e) => updateField('endDate', new Date(e.target.value))}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categorías
            </Label>
            
            {/* Categorías seleccionadas */}
            {selectedCategories.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Categorías seleccionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category: Category) => (
                    <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
                      {category.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeCategory(category.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de categorías */}
            {unselectedCategories.length > 0 && (
              <Select onValueChange={addCategory}>
                <SelectTrigger className={errors.categoryIds ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {unselectedCategories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {errors.categoryIds && (
              <p className="text-sm text-red-500">{errors.categoryIds}</p>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Presupuesto activo</Label>
              <p className="text-sm text-muted-foreground">
                Los presupuestos inactivos no se incluyen en los cálculos
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => updateField('active', checked)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading 
              ? (isEditing ? 'Actualizando...' : 'Creando...') 
              : (isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto')
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
