import { NextResponse, type NextRequest } from 'next/server'

export async function GET(_req: NextRequest) {
	return NextResponse.json({ ok: true, message: 'test-db route active' })
}
