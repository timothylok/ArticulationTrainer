import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/weekly-review`, { method: 'POST' })
    const data = await res.json()
    return NextResponse.json({ ok: res.ok, ...data })
  } catch (err) {
    console.error('/api/webhook/weekly error:', err)
    return NextResponse.json({ error: 'Weekly review trigger failed' }, { status: 500 })
  }
}
