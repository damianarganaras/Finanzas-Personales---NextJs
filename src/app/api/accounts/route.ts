import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { accountSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const accounts = await db.account.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        accountType: true,
        currency: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedFields = accountSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { name, accountTypeId, virtualBalance, iban, active, currencyId } = validatedFields.data;

    // Obtener o crear el tipo de cuenta
    let accountType = await db.accountType.findFirst({
      where: {
        type: accountTypeId,
      },
    });

    if (!accountType) {
      const accountTypeNames = {
        asset: 'Activos',
        liability: 'Pasivos',
        expense: 'Gastos',
        revenue: 'Ingresos',
      };
      
      accountType = await db.accountType.create({
        data: {
          type: accountTypeId,
          name: accountTypeNames[accountTypeId as keyof typeof accountTypeNames] || accountTypeId,
        },
      });
    }

    // Obtener el usuario con su grupo
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { userGroup: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const account = await db.account.create({
      data: {
        name,
        accountTypeId: accountType.id,
        virtualBalance: virtualBalance ? virtualBalance : null,
        iban: iban || null,
        active,
        userId: session.user.id,
        userGroupId: user.userGroupId,
        currencyId,
      },
      include: {
        accountType: true,
        currency: true,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
