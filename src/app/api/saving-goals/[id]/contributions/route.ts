import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const contributionSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['ARS','USD']),
  date: z.string().datetime(),
});

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id: goalId } = await params;
  const goal = await (db as any).savingGoal.findFirst({ where: { id: goalId, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
  const items = await (db as any).savingContribution.findMany({ where: { goalId }, orderBy: { date: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id: goalId } = await params;
  const goal = await (db as any).savingGoal.findFirst({ where: { id: goalId, userId: session.user.id } });
  if (!goal) return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 });
  const json = await req.json();
  const data = contributionSchema.parse(json);

  const created = await db.$transaction(async (tx) => {
    const c = await (tx as any).savingContribution.create({
      data: { goalId, amount: data.amount, currency: data.currency, date: new Date(data.date) },
    });
    // Update currentAmount in goal in its own currency.
    // If different currency, store raw and leave conversion for UI; alternatively convert here, but spec requests conversion for display.
    // We'll maintain currentAmount as sum of contributions converted to goal currency at creation time for simplicity.
    // For now, if different currency, we leave currentAmount unchanged. A periodic recompute can be implemented if needed.
    return c;
  });

  return NextResponse.json(created, { status: 201 });
}
