import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Verificar que la cuota existe y pertenece al usuario
    const installment = await db.installmentPayment.findFirst({
      where: {
        id: id,
        creditCardPurchase: {
          creditCard: {
            userId: session.user.id,
          },
        },
        status: 'pending',
      },
      include: {
        creditCardPurchase: {
          include: {
            creditCard: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    });

    if (!installment) {
      return NextResponse.json(
        { error: 'Cuota no encontrada o ya pagada' },
        { status: 404 }
      );
    }

    // Crear transacción de pago
    const transactionJournal = await db.transactionJournal.create({
      data: {
        userId: session.user.id,
        description: `Pago cuota ${installment.installmentNumber}/${installment.creditCardPurchase.installments} - ${installment.creditCardPurchase.creditCard.name}`,
        date: new Date(),
      },
    });

    const transaction = await db.transaction.create({
      data: {
        accountId: installment.creditCardPurchase.creditCard.accountId,
        transactionJournalId: transactionJournal.id,
        amount: -Number(installment.amount), // Negativo porque es un pago (salida)
        description: `Pago cuota ${installment.installmentNumber}`,
      },
    });

    // Actualizar la cuota como pagada
    const updatedInstallment = await db.installmentPayment.update({
      where: { id: id },
      data: {
        status: 'paid',
        paidDate: new Date(),
        transactionId: transaction.id,
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
    });

    return NextResponse.json(updatedInstallment);
  } catch (error) {
    console.error('Error al pagar cuota:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
