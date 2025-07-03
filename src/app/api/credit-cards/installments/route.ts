import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const installments = await db.installmentPayment.findMany({
      where: {
        creditCardPurchase: {
          creditCard: {
            userId: session.user.id,
          },
        },
      },
      include: {
        creditCardPurchase: {
          include: {
            creditCard: true,
          },
        },
        paymentTransaction: {
          include: {
            account: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Pendientes primero
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json(installments);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
