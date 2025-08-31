import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getDollarQuotes } from '@/lib/dollar';
import { convertAmount } from '@/lib/currency';

const goalSchema = z.object({
  name: z.string().min(1),
  currency: z.enum(['ARS','USD']),
  targetAmount: z.number().positive(),
  dueDate: z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const goals: any[] = await (db as any).savingGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (goals.length === 0) return NextResponse.json(goals);

  const quotes = await getDollarQuotes();
  const goalIds = goals.map((g: any) => g.id);
  const contributions: any[] = await (db as any).savingContribution.findMany({ where: { goalId: { in: goalIds } } });

  const byGoal: Record<string, number> = {};
  for (const c of contributions) {
    const g = goals.find((gg: any) => gg.id === c.goalId);
    if (!g) continue;
    const amount = convertAmount(Number(c.amount), c.currency as 'ARS' | 'USD', g.currency as 'ARS' | 'USD', quotes as any);
    byGoal[c.goalId] = (byGoal[c.goalId] || 0) + amount;
  }

  const enriched = goals.map((g) => ({
    ...g,
    currentAmount: byGoal[g.id] ? Number(byGoal[g.id]) : 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const json = await req.json();
  const data = goalSchema.parse(json);
  const created = await (db as any).savingGoal.create({
    data: {
      userId: session.user.id,
      name: data.name,
      currency: data.currency,
      targetAmount: data.targetAmount,
      // currentAmount stays 0 until contributions are added
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const json = await req.json();
  const schema = goalSchema.extend({ id: z.string() });
  const data = schema.parse(json);
  const updated = await (db as any).savingGoal.update({
    where: { id: data.id },
    data: {
      name: data.name,
      currency: data.currency,
      targetAmount: data.targetAmount,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  await (db as any).savingGoal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
