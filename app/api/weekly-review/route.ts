import { NextResponse } from 'next/server'
import { fetchSessions, logWeeklyReview } from '@/lib/notion'
import { generateText } from '@/lib/llm'
import { WEEKLY_SUMMARY_SYSTEM_PROMPT, buildWeeklySummaryMessage } from '@/lib/prompts'

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1)
  return raw.trim()
}

function weekLabel(date: Date): string {
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return `Week of ${monday.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export async function POST() {
  const sessions = await fetchSessions(5)

  if (sessions.length === 0) {
    return NextResponse.json({ error: 'No sessions found for this week' }, { status: 404 })
  }

  const sessionData = sessions.map(s => ({
    date: s.date,
    mode: s.mode,
    prompt: s.prompt,
    scores: s.scores as Record<string, number>,
    wins: s.wins,
    improvements: s.improvements,
  }))

  const allScores = sessions.flatMap(s => Object.values(s.scores))
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length * 10) / 10

  const userMessage = buildWeeklySummaryMessage(sessionData)

  try {
    const raw = await generateText(WEEKLY_SUMMARY_SYSTEM_PROMPT, userMessage)
    const json = extractJSON(raw)
    const review = JSON.parse(json)

    const label = weekLabel(new Date())
    await logWeeklyReview({
      weekLabel: label,
      summary: review.summary ?? '',
      patterns: review.patterns ?? [],
      focusNextWeek: review.focusNextWeek ?? '',
      avgScore,
    })

    return NextResponse.json({ ok: true, label, ...review, avgScore })
  } catch (err) {
    console.error('/api/weekly-review error:', err)
    return NextResponse.json({ error: 'Weekly review generation failed' }, { status: 500 })
  }
}
