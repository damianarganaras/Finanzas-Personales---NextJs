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
  active: true,
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

    // Verificar que la moneda existe, si no se proporciona usar peso argentino por defecto
    let currency;
    
    if (currencyId) {
      currency = await db.currency.findUnique({
        where: { id: currencyId },
      });
    }

    if (!currency) {
      // Buscar peso argentino o crearlo si no existe
      currency = await db.currency.upsert({
        where: { code: 'ARS' },
        update: {},
        create: {
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$',
        },
      });
    }

    // Obtener o crear el tipo de cuenta
    let accountType = await db.accountType.findFirst({
      where: {
        OR: [
          { id: accountTypeId }, // Buscar por ID
          { type: accountTypeId }, // Buscar por tipo exacto
          { type: accountTypeId.toUpperCase() }, // Buscar por tipo en mayúsculas
          { type: accountTypeId.toLowerCase() }, // Buscar por tipo en minúsculas
        ],
      },
    });

    if (!accountType) {
      return NextResponse.json(
        { message: `Tipo de cuenta "${accountTypeId}" no encontrado` },
        { status: 400 }
      );
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
        currencyId: currency.id, // Usar el ID de la moneda verificada
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
