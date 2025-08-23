import { NextResponse } from 'next/server';
import { getDollarQuotes } from '@/lib/dollar';

export const revalidate = 600; // 10 minutes

export async function GET() {
  try {
    const data = await getDollarQuotes();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Error al obtener cotizaciones' }, { status: 500 });
  }
}
