import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { accountSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const account = await db.account.findFirst({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
      include: {
        accountType: true,
        currency: true,
        _count: {
          select: {
            transactions: true,
          }
        }
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error al obtener cuenta:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = accountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.issues 
        },
        { status: 400 }
      );
    }

    // Verificar que la cuenta existe y pertenece al usuario
    const existingAccount = await db.account.findFirst({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el tipo de cuenta existe
    const accountType = await db.accountType.findUnique({
      where: { id: validation.data.accountTypeId },
    });

    if (!accountType) {
      return NextResponse.json(
        { message: 'Tipo de cuenta no válido' },
        { status: 400 }
      );
    }

    // Verificar que la moneda existe
    const currency = await db.currency.findUnique({
      where: { id: validation.data.currencyId },
    });

    if (!currency) {
      return NextResponse.json(
        { message: 'Moneda no válida' },
        { status: 400 }
      );
    }

    const updatedAccount = await db.account.update({
      where: { id: resolvedParams.id },
      data: {
        name: validation.data.name,
        accountTypeId: validation.data.accountTypeId,
        virtualBalance: validation.data.virtualBalance,
        iban: validation.data.iban,
        active: validation.data.active,
        currencyId: validation.data.currencyId,
      },
      include: {
        accountType: true,
        currency: true,
      },
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error al actualizar cuenta:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que la cuenta existe y pertenece al usuario
    const existingAccount = await db.account.findFirst({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          }
        }
      }
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no tenga transacciones asociadas
    const totalTransactions = existingAccount._count.transactions;
    if (totalTransactions > 0) {
      return NextResponse.json(
        { message: 'No se puede eliminar una cuenta con transacciones asociadas' },
        { status: 400 }
      );
    }

    await db.account.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
