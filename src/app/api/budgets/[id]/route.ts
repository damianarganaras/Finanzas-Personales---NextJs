import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación para actualizar presupuesto
const updateBudgetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  active: z.boolean().optional(),
  amount: z.number().positive('El monto debe ser positivo').optional(),
  startDate: z.string().datetime('Fecha de inicio inválida').optional(),
  endDate: z.string().datetime('Fecha de fin inválida').optional(),
  categoryIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    const budget = await db.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
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
      }
    })

    if (!budget) {
      return NextResponse.json(
        { message: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const json = await request.json()
    const validatedData = updateBudgetSchema.parse(json)

    // Verificar que el presupuesto existe y pertenece al usuario
    const existingBudget = await db.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        limits: true,
        categories: true
      }
    })

    if (!existingBudget) {
      return NextResponse.json(
        { message: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Validar fechas si se proporcionan
    if (validatedData.startDate && validatedData.endDate) {
      const startDate = new Date(validatedData.startDate)
      const endDate = new Date(validatedData.endDate)

      if (endDate <= startDate) {
        return NextResponse.json(
          { message: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        )
      }
    }

    // Verificar categorías si se proporcionan
    if (validatedData.categoryIds) {
      const categories = await db.category.findMany({
        where: {
          id: { in: validatedData.categoryIds },
          userId: session.user.id
        }
      })

      if (categories.length !== validatedData.categoryIds.length) {
        return NextResponse.json(
          { message: 'Una o más categorías no son válidas' },
          { status: 400 }
        )
      }
    }

    // Actualizar presupuesto con transacción
    const updatedBudget = await db.$transaction(async (prisma) => {
      // Actualizar datos del presupuesto
      const budgetUpdate: any = {}
      if (validatedData.name !== undefined) budgetUpdate.name = validatedData.name
      if (validatedData.active !== undefined) budgetUpdate.active = validatedData.active

      if (Object.keys(budgetUpdate).length > 0) {
        await prisma.budget.update({
          where: { id: id },
          data: budgetUpdate
        })
      }

      // Actualizar límite si se proporciona monto o fechas
      if (validatedData.amount || validatedData.startDate || validatedData.endDate) {
        const currentLimit = existingBudget.limits[0] // Tomamos el límite más reciente
        
        if (currentLimit) {
          const limitUpdate: any = {}
          if (validatedData.amount !== undefined) limitUpdate.amount = validatedData.amount
          if (validatedData.startDate !== undefined) limitUpdate.startDate = new Date(validatedData.startDate)
          if (validatedData.endDate !== undefined) limitUpdate.endDate = new Date(validatedData.endDate)

          await prisma.budgetLimit.update({
            where: { id: currentLimit.id },
            data: limitUpdate
          })
        }
      }

      // Actualizar categorías si se proporcionan
      if (validatedData.categoryIds) {
        // Eliminar relaciones existentes
        await prisma.budgetCategory.deleteMany({
          where: { budgetId: id }
        })

        // Crear nuevas relaciones
        await prisma.budgetCategory.createMany({
          data: validatedData.categoryIds.map(categoryId => ({
            budgetId: id,
            categoryId,
          }))
        })
      }

      // Retornar el presupuesto actualizado
      return prisma.budget.findUnique({
        where: { id: id },
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
        }
      })
    })

    return NextResponse.json(updatedBudget)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating budget:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar que el presupuesto existe y pertenece al usuario
    const existingBudget = await db.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingBudget) {
      return NextResponse.json(
        { message: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar presupuesto (cascading eliminará límites y categorías)
    await db.budget.delete({
      where: { id: id }
    })

    return NextResponse.json(
      { message: 'Presupuesto eliminado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
