import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const all = await db.accountType.findMany({ orderBy: { type: 'asc' } });
    // Normalizar por tipo (minúsculas) y preferir el registro canónico en minúsculas si hay duplicados
    const map = new Map<string, typeof all[number]>();
    for (const t of all) {
      const key = t.type.toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, t);
      } else if (t.type === key) {
        // Prefiere el registro cuyo type ya está en minúsculas
        map.set(key, t);
      }
    }
    const normalized = Array.from(map.values());
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error al obtener tipos de cuenta:', error);
    return NextResponse.json(
      { error: 'Error al obtener los tipos de cuenta' },
      { status: 500 }
    );
  }
}
