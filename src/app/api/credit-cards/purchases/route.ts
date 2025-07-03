import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const CreditCardPurchaseSchema = z.object({
  creditCardId: z.string().min(1, 'La tarjeta de crédito es requerida'),
  totalAmount: z.number().positive('El monto debe ser positivo'),
  installments: z.number().min(1).max(60, 'Las cuotas deben estar entre 1 y 60'),
  hasInterest: z.boolean(),
  interestRate: z.number().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  purchaseDate: z.string().transform(val => new Date(val)),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const purchases = await db.creditCardPurchase.findMany({
      where: {
        creditCard: {
          userId: session.user.id,
        },
      },
      include: {
        creditCard: {
          include: {
            account: true,
          },
        },
        transaction: {
          include: {
            account: true,
            categories: {
              include: {
                category: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
        installmentPayments: {
          orderBy: {
            installmentNumber: 'asc',
          },
        },
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error al obtener compras:', error);
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
    const data = CreditCardPurchaseSchema.parse(body);

    // Verificar que la tarjeta pertenece al usuario
    const creditCard = await db.creditCard.findFirst({
      where: {
        id: data.creditCardId,
        userId: session.user.id,
      },
      include: {
        account: true,
      },
    });

    if (!creditCard) {
      return NextResponse.json(
        { error: 'Tarjeta de crédito no encontrada' },
        { status: 404 }
      );
    }

    // Crear la transacción principal
    const transactionJournal = await db.transactionJournal.create({
      data: {
        userId: session.user.id,
        description: `Compra con tarjeta: ${data.description}`,
        date: data.purchaseDate,
      },
    });

    const transaction = await db.transaction.create({
      data: {
        accountId: creditCard.accountId,
        transactionJournalId: transactionJournal.id,
        amount: data.totalAmount,
        description: data.description,
      },
    });

    // Crear la compra con tarjeta de crédito
    const purchase = await db.creditCardPurchase.create({
      data: {
        creditCardId: data.creditCardId,
        transactionId: transaction.id,
        totalAmount: data.totalAmount,
        installments: data.installments,
        hasInterest: data.hasInterest,
        interestRate: data.interestRate,
        description: data.description,
        purchaseDate: data.purchaseDate,
      },
    });

    // Calcular y crear las cuotas
    const installmentAmount = data.hasInterest && data.interestRate
      ? calculateInstallmentWithInterest(data.totalAmount, data.installments, data.interestRate)
      : data.totalAmount / data.installments;

    const installmentPayments = [];
    for (let i = 1; i <= data.installments; i++) {
      const dueDate = new Date(data.purchaseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Ajustar al día de vencimiento de la tarjeta
      dueDate.setDate(creditCard.dueDay);

      const installment = await db.installmentPayment.create({
        data: {
          creditCardPurchaseId: purchase.id,
          installmentNumber: i,
          amount: installmentAmount,
          dueDate: dueDate,
          status: 'pending',
        },
      });

      installmentPayments.push(installment);
    }

    // Asociar categorías y etiquetas si se proporcionaron
    if (data.categoryIds.length > 0) {
      await db.transactionCategory.createMany({
        data: data.categoryIds.map(categoryId => ({
          transactionId: transaction.id,
          categoryId: categoryId,
        })),
      });
    }

    if (data.tagIds.length > 0) {
      await db.transactionTag.createMany({
        data: data.tagIds.map(tagId => ({
          transactionId: transaction.id,
          tagId: tagId,
        })),
      });
    }

    // Retornar la compra completa
    const completePurchase = await db.creditCardPurchase.findUnique({
      where: { id: purchase.id },
      include: {
        creditCard: true,
        transaction: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
        installmentPayments: {
          orderBy: {
            installmentNumber: 'asc',
          },
        },
      },
    });

    return NextResponse.json(completePurchase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al crear compra:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para calcular cuotas con interés
function calculateInstallmentWithInterest(
  totalAmount: number,
  installments: number,
  monthlyRate: number
): number {
  const r = monthlyRate / 100;
  return (totalAmount * r * Math.pow(1 + r, installments)) / (Math.pow(1 + r, installments) - 1);
}
