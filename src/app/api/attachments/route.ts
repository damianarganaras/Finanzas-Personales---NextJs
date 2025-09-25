import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Minimal attachments API (metadata only; assumes file storage handled elsewhere)
const createAttachmentSchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  transactionId: z.string().optional(),
  billId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('transactionId') || undefined;
  const billId = searchParams.get('billId') || undefined;

  const where: any = { userId: session.user.id };
  if (transactionId) where.transactionId = transactionId;
  if (billId) where.billId = billId;

  const items = await db.attachment.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const json = await request.json();
    const data = createAttachmentSchema.parse(json);

    // validate associations ownership if provided
    if (data.transactionId) {
      const tx = await db.transaction.findFirst({ where: { id: data.transactionId, account: { userId: session.user.id } } });
      if (!tx) return NextResponse.json({ error: 'Transacción inválida' }, { status: 400 });
    }
    if (data.billId) {
      const bill = await db.bill.findFirst({ where: { id: data.billId, userId: session.user.id } });
      if (!bill) return NextResponse.json({ error: 'Factura inválida' }, { status: 400 });
    }

    // For demo: store filename = originalName (in real impl, integrate storage service)
    const createData: any = {
      userId: session.user.id,
      filename: data.originalName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
    };
    if (data.transactionId) createData.transactionId = data.transactionId;
    if (data.billId) createData.billId = data.billId;

  const created = await db.attachment.create({
      data: createData,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Error creating attachment:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
