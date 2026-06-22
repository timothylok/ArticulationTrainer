import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/llm'
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts'
import { calcWPM, fillersPerMinute } from '@/lib/scoring'

function extractJSON(raw: string): string {
  // Strip markdown code fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // Find first { ... } block
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1)
  return raw.trim()
}

export async function POST(request: NextRequest) {
  const { transcript, prompt, durationSec } = await request.json()

  if (!transcript || !prompt) {
    return NextResponse.json({ error: 'transcript and prompt are required' }, { status: 400 })
  }

  const wpm = calcWPM(transcript, durationSec ?? 0)
  const fpm = fillersPerMinute(transcript, durationSec ?? 0)

  const userMessage = `Scenario prompt: "${prompt}"

Speaker's response (${durationSec ?? '?'}s, ~${wpm} WPM, ${fpm} fillers/min):
"${transcript}"

Analyze this response and return the JSON.`

  try {
    const raw = await generateText(ANALYSIS_SYSTEM_PROMPT, userMessage)
    const json = extractJSON(raw)
    const analysis = JSON.parse(json)

    return NextResponse.json({ ...analysis, wpm, fillersPerMinute: fpm })
  } catch (err) {
    console.error('/api/analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
