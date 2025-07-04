import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const currencies = await db.currency.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json(currencies);
  } catch (error) {
    console.error('Error al obtener monedas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las monedas' },
      { status: 500 }
    );
  }
}
