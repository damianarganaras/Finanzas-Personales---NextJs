import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const tags = await db.tag.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error al obtener tags:', error);
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
  const validation = tagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error?.issues || []
        },
        { status: 400 }
      );
    }

  const { name } = validation.data;

    // Verificar que no existe un tag con el mismo nombre para este usuario
    const existingTag = await db.tag.findFirst({
      where: {
        name,
        userId: session.user.id,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { message: 'Ya existe un tag con ese nombre' },
        { status: 400 }
      );
    }

    const tag = await db.tag.create({
      data: {
        name,
        userId: session.user.id,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error al crear tag:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
