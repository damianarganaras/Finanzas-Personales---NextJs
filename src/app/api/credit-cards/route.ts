import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const CreditCardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  last4Digits: z.string().regex(/^\d{4}$/, 'Deben ser 4 dígitos'),
  limit: z.number().positive('El límite debe ser positivo'),
  closingDay: z.number().min(1).max(31),
  dueDay: z.number().min(1).max(31),
  active: z.boolean().default(true),
  accountId: z.string().min(1, 'La cuenta es requerida'),
});

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const creditCards = await db.creditCard.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        account: {
          include: {
            accountType: true,
            currency: true,
          },
        },
        purchases: {
          include: {
            installmentPayments: {
              where: {
                status: 'pending',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(creditCards);
  } catch (error) {
    console.error('Error al obtener tarjetas de crédito:', error);
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
    const data = CreditCardSchema.parse(body);

    // Verificar que la cuenta pertenece al usuario
    const account = await db.account.findFirst({
      where: {
        id: data.accountId,
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    const creditCard = await db.creditCard.create({
      data: {
        ...data,
        userId: session.user.id,
      },
      include: {
        account: {
          include: {
            accountType: true,
            currency: true,
          },
        },
      },
    });

    return NextResponse.json(creditCard, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al crear tarjeta de crédito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
