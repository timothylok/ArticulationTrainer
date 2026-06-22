import { NextRequest, NextResponse } from 'next/server'
import { getPrompt } from '@/lib/getPrompt'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await getPrompt()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('/api/webhook/daily error:', err)
    return NextResponse.json({ error: 'Prompt generation failed' }, { status: 500 })
  }
}
