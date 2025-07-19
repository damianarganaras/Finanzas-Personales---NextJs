import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { billSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const bills = await db.bill.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    const validatedData = billSchema.parse({
      ...body,
      userId: session.user.id
    });

    const bill = await db.bill.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        frequency: validatedData.frequency || 'monthly',
        nextDueDate: validatedData.nextDueDate || new Date(),
        active: validatedData.active !== undefined ? validatedData.active : true,
        userId: session.user.id
      }
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error al crear factura:', error);
    
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
