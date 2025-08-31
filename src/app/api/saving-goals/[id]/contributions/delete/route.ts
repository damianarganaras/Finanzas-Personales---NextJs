import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const contributionId = searchParams.get('contributionId');
  if (!contributionId) return NextResponse.json({ error: 'Falta contributionId' }, { status: 400 });

  // Ensure contribution belongs to user's goal
  const { id: goalId } = await params;
  const contribution = await (db as any).savingContribution.findUnique({ where: { id: contributionId }, include: { goal: true } });
  if (!contribution || contribution.goal.userId !== session.user.id || contribution.goal.id !== goalId) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }

  await (db as any).savingContribution.delete({ where: { id: contributionId } });
  return NextResponse.json({ ok: true });
}
