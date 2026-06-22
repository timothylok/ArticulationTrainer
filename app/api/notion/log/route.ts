import { NextRequest, NextResponse } from 'next/server'
import { logSession } from '@/lib/notion'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await logSession(body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('/api/notion/log error:', err)
    return NextResponse.json({ error: 'Failed to log session' }, { status: 500 })
  }
}
