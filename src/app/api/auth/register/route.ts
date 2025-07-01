import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = registerSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear grupo de usuario por defecto
    const userGroup = await db.userGroup.create({
      data: {
        title: `Grupo de ${name}`,
      },
    });

    // Crear usuario
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userGroupId: userGroup.id,
      },
    });

    // Crear tipos de cuenta por defecto si no existen
    const accountTypes = [
      { type: 'asset', name: 'Activos' },
      { type: 'expense', name: 'Gastos' },
      { type: 'revenue', name: 'Ingresos' },
      { type: 'liability', name: 'Pasivos' },
    ];

    for (const accountType of accountTypes) {
      await db.accountType.upsert({
        where: { type: accountType.type },
        update: {},
        create: accountType,
      });
    }

    // Crear moneda por defecto si no existe
    await db.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: {
        code: 'USD',
        name: 'Dólar Estadounidense',
        symbol: '$',
      },
    });

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
