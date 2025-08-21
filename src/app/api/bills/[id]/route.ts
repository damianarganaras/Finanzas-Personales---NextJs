import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { billSchema } from '@/lib/validations';

interface RouteParamsPromise {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParamsPromise) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

  const { id } = await params;
    const bill = await db.bill.findFirst({
      where: {
    id,
        userId: session.user.id
      },
      include: {
        category: { select: { id: true, name: true } }
      }
    });

    if (!bill) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParamsPromise) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
  const { id } = await params;
    
  const validatedData = billSchema.parse({
      ...body,
      userId: session.user.id
    });

    const existingBill = await db.bill.findFirst({
      where: {
    id,
        userId: session.user.id
      }
    });

    if (!existingBill) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

  const bill = await db.bill.update({
      where: {
  id
      },
      data: {
        name: validatedData.name,
    description: validatedData.description ?? null,
    amount: validatedData.amount,
    frequency: validatedData.frequency || 'monthly',
    nextDueDate: validatedData.nextDueDate,
    active: validatedData.active !== undefined ? validatedData.active : true,
        autoPayEnabled: validatedData.autoPayEnabled ?? false,
        categoryId: validatedData.categoryId
      },
      include: {
        category: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos de factura inválidos' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParamsPromise) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

  const { id } = await params;
    const existingBill = await db.bill.findFirst({
      where: {
    id,
        userId: session.user.id
      }
    });

    if (!existingBill) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    await db.bill.delete({
      where: {
  id
      }
    });

    return NextResponse.json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
