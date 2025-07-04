import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  Budget, 
  BudgetFormData, 
  CreateBudgetData, 
  UpdateBudgetData, 
  BudgetResponse,
  BudgetProgressResponse 
} from '@/types/budget'

// Hook para obtener todos los presupuestos
export function useBudgets(options?: {
  page?: number
  limit?: number
  active?: boolean
}) {
  const { page = 1, limit = 10, active } = options || {}
  
  const queryKey = ['budgets', { page, limit, active }]
  
  return useQuery<BudgetResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (active !== undefined) {
        params.append('active', active.toString())
      }
      
      const response = await fetch(`/api/budgets?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los presupuestos')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para obtener un presupuesto específico
export function useBudget(id: string) {
  return useQuery<Budget>({
    queryKey: ['budget', id],
    queryFn: async () => {
      const response = await fetch(`/api/budgets/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Presupuesto no encontrado')
        }
        throw new Error('Error al cargar el presupuesto')
      }
      
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para obtener el progreso de presupuestos
export function useBudgetProgress(options?: {
  budgetId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { budgetId, startDate, endDate } = options || {}
  
  const queryKey = ['budget-progress', { budgetId, startDate, endDate }]
  
  return useQuery<BudgetProgressResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (budgetId) params.append('budgetId', budgetId)
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())
      
      const response = await fetch(`/api/budgets/progress?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar el progreso de presupuestos')
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (datos más dinámicos)
  })
}

// Hook para crear presupuesto
export function useCreateBudget() {
  const queryClient = useQueryClient()
  
  return useMutation<Budget, Error, CreateBudgetData>({
    mutationFn: async (data) => {
      // Convertir fechas a strings para la API
      const apiData = {
        ...data,
        startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
        endDate: data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate,
      }
      
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el presupuesto')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidar todas las queries de presupuestos
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
      toast.success('Presupuesto creado correctamente')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Hook para actualizar presupuesto
export function useUpdateBudget() {
  const queryClient = useQueryClient()
  
  return useMutation<Budget, Error, UpdateBudgetData>({
    mutationFn: async (data) => {
      const { id, ...updateData } = data
      
      // Convertir fechas a strings para la API
      const apiData = {
        ...updateData,
        ...(updateData.startDate && {
          startDate: updateData.startDate instanceof Date ? updateData.startDate.toISOString() : updateData.startDate
        }),
        ...(updateData.endDate && {
          endDate: updateData.endDate instanceof Date ? updateData.endDate.toISOString() : updateData.endDate
        }),
      }
      
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al actualizar el presupuesto')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Invalidar y actualizar queries específicas
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget', data.id] })
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
      toast.success('Presupuesto actualizado correctamente')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Hook para eliminar presupuesto
export function useDeleteBudget() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar el presupuesto')
      }
    },
    onSuccess: () => {
      // Invalidar todas las queries de presupuestos
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
      toast.success('Presupuesto eliminado correctamente')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Hook personalizado para manejar formularios de presupuesto
export function useBudgetForm(initialData?: Budget) {
  const [formData, setFormData] = useState<BudgetFormData>(() => {
    if (initialData && initialData.limits.length > 0) {
      const currentLimit = initialData.limits[0]
      return {
        name: initialData.name,
        active: initialData.active,
        amount: Number(currentLimit.amount),
        startDate: new Date(currentLimit.startDate),
        endDate: new Date(currentLimit.endDate),
        categoryIds: initialData.categories.map(bc => bc.categoryId),
      }
    }
    
    return {
      name: '',
      active: true,
      amount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días después
      categoryIds: [],
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser positivo'
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = 'Debe seleccionar al menos una categoría'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando se actualiza
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const reset = () => {
    setFormData({
      name: '',
      active: true,
      amount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      categoryIds: [],
    })
    setErrors({})
  }

  return {
    formData,
    errors,
    updateField,
    validateForm,
    reset,
    setFormData,
  }
}
