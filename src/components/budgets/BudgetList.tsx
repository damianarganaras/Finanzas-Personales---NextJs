'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingDown, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useBudgets, useDeleteBudget, useBudgetProgress } from '@/hooks/use-budgets'
import { BudgetForm } from './BudgetForm'
import type { Budget } from '@/types/budget'

interface BudgetListProps {
  showCreateButton?: boolean
}

export function BudgetList({ showCreateButton = true }: BudgetListProps) {
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: budgetsResponse, isLoading, error } = useBudgets({ limit: 50 })
  const { data: progressResponse } = useBudgetProgress()
  const deleteBudget = useDeleteBudget()

  const budgets = budgetsResponse?.budgets || []
  const progress = progressResponse?.progress || []

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (budgetId: string) => {
    await deleteBudget.mutateAsync(budgetId)
  }

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedBudget(null)
  }

  const getBudgetProgress = (budgetId: string) => {
    return progress.find(p => p.budgetId === budgetId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'under':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'destructive'
      case 'warning':
        return 'outline'
      case 'under':
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Error al cargar los presupuestos
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear */}
      {showCreateButton && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Presupuestos</h2>
            <p className="text-muted-foreground">
              Gestiona y monitorea tus presupuestos financieros
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Presupuesto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
              </DialogHeader>
              <BudgetForm
                onSuccess={handleFormSuccess}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Lista de presupuestos */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No hay presupuestos</h3>
              <p className="text-muted-foreground">
                Crea tu primer presupuesto para comenzar a controlar tus gastos
              </p>
              {showCreateButton && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">Crear Primer Presupuesto</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
                    </DialogHeader>
                    <BudgetForm
                      onSuccess={handleFormSuccess}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const budgetProgress = getBudgetProgress(budget.id)
            const currentLimit = budget.limits[0]
            
            return (
              <Card key={budget.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={budget.active ? 'default' : 'secondary'}>
                          {budget.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {budgetProgress && (
                          <Badge variant={getStatusColor(budgetProgress.status) as any}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(budgetProgress.status)}
                              {Math.round(budgetProgress.percentage)}%
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Presupuesto</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres eliminar el presupuesto "{budget.name}"? 
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(budget.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información del presupuesto */}
                  {currentLimit && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Presupuestado:</span>
                        <span className="font-medium">${Number(currentLimit.amount).toLocaleString()}</span>
                      </div>
                      
                      {budgetProgress && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Gastado:</span>
                            <span className="font-medium">${budgetProgress.spent.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Restante:</span>
                            <span className={`font-medium ${budgetProgress.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              ${budgetProgress.remaining.toLocaleString()}
                            </span>
                          </div>
                          
                          <Progress 
                            value={Math.min(budgetProgress.percentage, 100)} 
                            className="h-2"
                          />
                        </>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(currentLimit.startDate).toLocaleDateString()} - {new Date(currentLimit.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Categorías */}
                  {budget.categories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Categorías:</p>
                      <div className="flex flex-wrap gap-1">
                        {budget.categories.slice(0, 3).map((bc) => (
                          <Badge key={bc.categoryId} variant="outline" className="text-xs">
                            {bc.category?.name}
                          </Badge>
                        ))}
                        {budget.categories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{budget.categories.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog para editar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Presupuesto</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <BudgetForm
              budget={selectedBudget}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
