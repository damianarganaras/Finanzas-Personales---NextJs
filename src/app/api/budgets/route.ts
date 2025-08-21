import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación para crear presupuesto
const createBudgetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  active: z.boolean().default(true),
  amount: z.number().positive('El monto debe ser positivo'),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  categoryIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una categoría'),
})

// Schema de validación para actualizar presupuesto
const updateBudgetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  active: z.boolean().optional(),
  amount: z.number().positive('El monto debe ser positivo').optional(),
  startDate: z.string().datetime('Fecha de inicio inválida').optional(),
  endDate: z.string().datetime('Fecha de fin inválida').optional(),
  categoryIds: z.array(z.string()).optional(),
})

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
  const userId = session.user!.id
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const active = searchParams.get('active')
    
    const skip = (page - 1) * limit

    // Construir filtros
  const where: any = { userId }

    if (active !== null) {
      where.active = active === 'true'
    }

    // Obtener presupuestos con relaciones
    const [budgets, total] = await Promise.all([
      db.budget.findMany({
        where,
        include: {
          limits: {
            orderBy: {
              startDate: 'desc'
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit,
      }),
      db.budget.count({ where })
    ])

    return NextResponse.json({
      budgets,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

  const json = await request.json()
  const userId = session.user!.id
    const validatedData = createBudgetSchema.parse(json)

    // Validar que las fechas sean coherentes
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    if (endDate <= startDate) {
      return NextResponse.json(
        { message: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      )
    }

    // Verificar que las categorías existen y pertenecen al usuario
  const categories = await db.category.findMany({
      where: {
        id: { in: validatedData.categoryIds },
    userId
      }
    })

    if (categories.length !== validatedData.categoryIds.length) {
      return NextResponse.json(
        { message: 'Una o más categorías no son válidas' },
        { status: 400 }
      )
    }

    // Crear presupuesto con transacción
    const budget = await db.$transaction(async (prisma) => {
      // Crear el presupuesto
    const newBudget = await prisma.budget.create({
        data: {
          name: validatedData.name,
          active: validatedData.active,
      userId,
        }
      })

      // Crear el límite de presupuesto
      await prisma.budgetLimit.create({
        data: {
          budgetId: newBudget.id,
          amount: validatedData.amount,
          startDate: startDate,
          endDate: endDate,
        }
      })

      // Crear las relaciones con categorías
      await prisma.budgetCategory.createMany({
        data: validatedData.categoryIds.map(categoryId => ({
          budgetId: newBudget.id,
          categoryId,
        }))
      })

      // Retornar el presupuesto completo
      return prisma.budget.findUnique({
        where: { id: newBudget.id },
        include: {
          limits: true,
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating budget:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
