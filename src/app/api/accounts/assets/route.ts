import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // Devuelve solo cuentas activas cuyo tipo se corresponde con 'asset' (normalizado)
  const accounts = await db.account.findMany({
    where: { userId: session.user.id, active: true },
    include: { accountType: true, currency: true },
    orderBy: { createdAt: 'desc' },
  })

  const filtered = accounts.filter((a) => String(a.accountType.type).toLowerCase() === 'asset')
  return NextResponse.json(filtered)
}
