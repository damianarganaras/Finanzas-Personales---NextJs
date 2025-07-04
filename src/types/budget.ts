// Tipos para los presupuestos
export interface Budget {
  id: string
  name: string
  active: boolean
  userId: string
  createdAt?: Date
  updatedAt?: Date
  limits: BudgetLimit[]
  categories: BudgetCategory[]
}

export interface BudgetLimit {
  id: string
  budgetId: string
  amount: number
  startDate: Date
  endDate: Date
  budget?: Budget
}

export interface BudgetCategory {
  budgetId: string
  categoryId: string
  budget?: Budget
  category?: {
    id: string
    name: string
    type: string
  }
}

// Tipos para formularios
export interface BudgetFormData {
  name: string
  active: boolean
  amount: number
  startDate: Date
  endDate: Date
  categoryIds: string[]
}

export interface CreateBudgetData {
  name: string
  active?: boolean
  amount: number
  startDate: string | Date
  endDate: string | Date
  categoryIds: string[]
}

export interface UpdateBudgetData {
  id: string
  name?: string
  active?: boolean
  amount?: number
  startDate?: string | Date
  endDate?: string | Date
  categoryIds?: string[]
}

// Tipos para reportes
export interface BudgetProgress {
  budgetId: string
  budgetName: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  status: 'under' | 'over' | 'on-track' | 'warning'
  period: string
  categoryBreakdown: CategorySpending[]
}

export interface CategorySpending {
  categoryId: string
  categoryName: string
  budgeted: number
  spent: number
  percentage: number
}

// Tipo para respuestas de la API
export interface BudgetResponse {
  budgets: Budget[]
  total: number
  page: number
  limit: number
}

export interface BudgetProgressResponse {
  progress: BudgetProgress[]
}
