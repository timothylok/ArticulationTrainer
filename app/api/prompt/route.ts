import { NextResponse } from 'next/server'
import { getPrompt } from '@/lib/getPrompt'

export async function GET() {
  try {
    const result = await getPrompt()
    return NextResponse.json(result)
  } catch (err) {
    console.error('/api/prompt error:', err)
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
  }
}
