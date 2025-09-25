import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const ruleSchema = z.object({
  title: z.string().min(1),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const items = await db.rule.findMany({ where: { userId: session.user.id }, include: { triggers: true, actions: true }, orderBy: { title: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const json = await request.json();
    const data = ruleSchema.parse(json);
    const created = await db.rule.create({ data: { userId: session.user.id, title: data.title, active: data.active } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    console.error('Error creating rule:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
