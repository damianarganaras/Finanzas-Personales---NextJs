import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todas las cuotas pendientes del usuario
    const pendingInstallments = await db.installmentPayment.findMany({
      where: {
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
            creditCard: true,
          },
        },
      },
    });

    // Calcular estadísticas
    const totalPending = pendingInstallments.reduce((sum, installment) => 
      sum + Number(installment.amount), 0
    );

    const overdueInstallments = pendingInstallments.filter(
      installment => installment.dueDate < new Date()
    );

    const totalOverdue = overdueInstallments.reduce((sum, installment) => 
      sum + Number(installment.amount), 0
    );

    // Próximos pagos (siguiente mes)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const nextPayments = pendingInstallments
      .filter(installment => installment.dueDate <= nextMonth)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 10); // Limitar a 10 próximos pagos

    // Total mensual estimado
    const monthlyTotal = pendingInstallments
      .filter(installment => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return installment.dueDate.getMonth() === currentMonth && 
               installment.dueDate.getFullYear() === currentYear;
      })
      .reduce((sum, installment) => sum + Number(installment.amount), 0);

    const summary = {
      totalPending,
      totalOverdue,
      nextPayments,
      monthlyTotal,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen de cuotas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
