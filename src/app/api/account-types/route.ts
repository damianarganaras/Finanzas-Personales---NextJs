import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const accountTypes = await db.accountType.findMany({
      orderBy: {
        type: 'asc',
      },
    });

    return NextResponse.json(accountTypes);
  } catch (error) {
    console.error('Error al obtener tipos de cuenta:', error);
    return NextResponse.json(
      { error: 'Error al obtener los tipos de cuenta' },
      { status: 500 }
    );
  }
}
