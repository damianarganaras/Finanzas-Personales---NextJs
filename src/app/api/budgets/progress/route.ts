import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const budgetId = searchParams.get('budgetId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construir filtros para presupuestos
    const budgetWhere: any = {
      userId: session.user.id,
      active: true,
    }

    if (budgetId) {
      budgetWhere.id = budgetId
    }

    // Obtener presupuestos con sus límites y categorías
    const budgets = await db.budget.findMany({
      where: budgetWhere,
      include: {
        limits: {
          where: {
            ...(startDate && { startDate: { gte: new Date(startDate) } }),
            ...(endDate && { endDate: { lte: new Date(endDate) } }),
          },
          orderBy: {
            startDate: 'desc'
          },
          take: 1, // Solo el límite más reciente
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    // Calcular progreso para cada presupuesto
    const progress = await Promise.all(
      budgets.map(async (budget) => {
        const currentLimit = budget.limits[0]
        
        if (!currentLimit) {
          return {
            budgetId: budget.id,
            budgetName: budget.name,
            budgeted: 0,
            spent: 0,
            remaining: 0,
            percentage: 0,
            status: 'on-track' as const,
            period: 'monthly',
            categoryBreakdown: []
          }
        }

        // Obtener categorías del presupuesto
        const categoryIds = budget.categories.map(bc => bc.categoryId)

        // Calcular gastos en el período
        const transactions = await db.transaction.findMany({
          where: {
            userId: session.user.id,
            date: {
              gte: currentLimit.startDate,
              lte: currentLimit.endDate,
            },
            categoryId: {
              in: categoryIds
            },
            amount: {
              lt: 0 // Solo gastos (amounts negativos)
            }
          },
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        // Calcular total gastado
        const totalSpent = Math.abs(
          transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0)
        )

        const budgeted = Number(currentLimit.amount)
        const remaining = budgeted - totalSpent
        const percentage = budgeted > 0 ? (totalSpent / budgeted) * 100 : 0

        // Determinar estado
        let status: 'under' | 'over' | 'on-track' | 'warning'
        if (percentage > 100) {
          status = 'over'
        } else if (percentage > 90) {
          status = 'warning'
        } else if (percentage < 50) {
          status = 'under'
        } else {
          status = 'on-track'
        }

        // Calcular breakdown por categoría
        const categoryBreakdown = budget.categories.map(bc => {
          const categoryTransactions = transactions.filter(t => t.categoryId === bc.categoryId)
          const categorySpent = Math.abs(
            categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
          )
          const categoryPercentage = totalSpent > 0 ? (categorySpent / totalSpent) * 100 : 0

          return {
            categoryId: bc.categoryId,
            categoryName: bc.category.name,
            budgeted: budgeted * (categoryPercentage / 100), // Proporción estimada
            spent: categorySpent,
            percentage: categoryPercentage
          }
        })

        return {
          budgetId: budget.id,
          budgetName: budget.name,
          budgeted,
          spent: totalSpent,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
          status,
          period: 'monthly', // TODO: Calcular basado en las fechas
          categoryBreakdown
        }
      })
    )

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching budget progress:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
