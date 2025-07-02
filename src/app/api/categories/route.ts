import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { categorySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const categories = await db.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
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
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.issues 
        },
        { status: 400 }
      );
    }

    // Verificar que no existe una categoría con el mismo nombre para este usuario
    const existingCategory = await db.category.findFirst({
      where: {
        name: validation.data.name,
        userId: session.user.id,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name: validation.data.name,
        userId: session.user.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
