import { Client } from '@notionhq/client'
import type { AnalysisResult } from '@/components/FeedbackCard'
import type { Mode } from './config'

let _client: Client | null = null

function getClient(): Client {
  if (!_client) {
    if (!process.env.NOTION_API_KEY) throw new Error('NOTION_API_KEY not set')
    _client = new Client({ auth: process.env.NOTION_API_KEY })
  }
  return _client
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function query(dbId: string, opts?: Record<string, any>) {
  return (getClient() as any).databases.query({ database_id: dbId, ...opts })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function create(dbId: string, properties: Record<string, any>) {
  return (getClient() as any).pages.create({ parent: { database_id: dbId }, properties })
}

export type CareerGoal = {
  goal: string
  priority: string
  theme: string
}

export type SessionRecord = {
  id: string
  date: string
  prompt: string
  transcript: string
  durationSec: number
  mode: string
  scores: AnalysisResult['scores']
  wins: string[]
  improvements: string[]
  conciseRewrite: string
  microChallenge: string
  wpm: number
  fillersPerMinute: number
}

export async function fetchCareerGoals(): Promise<CareerGoal[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DB_GOALS) return []
  try {
    const response = await query(process.env.NOTION_DB_GOALS, {
      filter: {
        or: [
          { property: 'Priority', select: { equals: 'Now' } },
          { property: 'Priority', select: { equals: 'Next' } },
        ],
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: any) => ({
      goal: page.properties?.Goal?.title?.[0]?.plain_text ?? '',
      priority: page.properties?.Priority?.select?.name ?? '',
      theme: page.properties?.Theme?.select?.name ?? '',
    })).filter((g: CareerGoal) => g.goal)
  } catch {
    return []
  }
}

export async function logSession(params: {
  date: string
  prompt: string
  transcript: string
  durationSec: number
  mode: Mode
  analysis: AnalysisResult
}): Promise<void> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DB_SESSIONS) return
  const { date, prompt, transcript, durationSec, mode, analysis } = params
  const { scores, wins, improvements, conciseRewrite, microChallenge, wpm, fillersPerMinute } = analysis

  await create(process.env.NOTION_DB_SESSIONS, {
    Date: { date: { start: date } },
    Prompt: { rich_text: [{ text: { content: prompt.slice(0, 2000) } }] },
    Transcript: { rich_text: [{ text: { content: transcript.slice(0, 2000) } }] },
    'Duration (sec)': { number: durationSec },
    Mode: { select: { name: mode } },
    Clarity: { number: scores.clarity },
    Conciseness: { number: scores.conciseness },
    Structure: { number: scores.structure },
    'Leadership tone': { number: scores.leadershipTone },
    'Executive presence': { number: scores.executivePresence },
    'Delivery thinking': { number: scores.deliveryThinking },
    'Technical translation': { number: scores.technicalTranslation },
    'Business alignment ': { number: scores.businessAlignment },
    'Fillers per minute': { number: fillersPerMinute },
    WPM: { number: wpm },
    'Key wins': { rich_text: [{ text: { content: wins.join('\n') } }] },
    'Key improvements': { rich_text: [{ text: { content: improvements.join('\n') } }] },
    'Concise rewrite': { rich_text: [{ text: { content: conciseRewrite.slice(0, 2000) } }] },
    'Micro challenge': { rich_text: [{ text: { content: microChallenge.slice(0, 2000) } }] },
  })
}

export type WeeklyReview = {
  id: string
  weekLabel: string
  summary: string
  patterns: string[]
  focusNextWeek: string
  avgScore: number
  createdAt: string
}

export async function logWeeklyReview(params: {
  weekLabel: string
  summary: string
  patterns: string[]
  focusNextWeek: string
  avgScore: number
}): Promise<void> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DB_WEEKLY) return
  const { weekLabel, summary, patterns, focusNextWeek, avgScore } = params

  await (getClient() as any).pages.create({
    parent: { database_id: process.env.NOTION_DB_WEEKLY },
    properties: {
      Summary: { title: [{ text: { content: weekLabel } }] },
      'Focus next week': { rich_text: [{ text: { content: focusNextWeek } }] },
      'Avg scores': { number: avgScore },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: summary } }] },
      },
      ...(patterns.length ? [{
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ text: { content: 'Patterns this week:' } }] },
      }, ...patterns.map(p => ({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ text: { content: p } }] },
      }))] : []),
    ],
  })
}

export async function fetchWeeklyReviews(limit = 10): Promise<WeeklyReview[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DB_WEEKLY) return []
  try {
    const response = await query(process.env.NOTION_DB_WEEKLY, {
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: limit,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: any) => {
      const p = page.properties
      return {
        id: page.id,
        weekLabel: p?.Summary?.title?.[0]?.plain_text ?? '',
        summary: '',
        patterns: [],
        focusNextWeek: p?.['Focus next week']?.rich_text?.[0]?.plain_text ?? '',
        avgScore: p?.['Avg scores']?.number ?? 0,
        createdAt: page.created_time ?? '',
      }
    })
  } catch {
    return []
  }
}

export async function fetchSessions(limit = 20): Promise<SessionRecord[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DB_SESSIONS) return []
  try {
    const response = await query(process.env.NOTION_DB_SESSIONS, {
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: limit,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: any) => {
      const p = page.properties
      return {
        id: page.id,
        date: p?.Date?.date?.start ?? '',
        prompt: p?.Prompt?.rich_text?.[0]?.plain_text ?? '',
        transcript: p?.Transcript?.rich_text?.[0]?.plain_text ?? '',
        durationSec: p?.['Duration (sec)']?.number ?? 0,
        mode: p?.Mode?.select?.name ?? '',
        scores: {
          clarity: p?.Clarity?.number ?? 0,
          conciseness: p?.Conciseness?.number ?? 0,
          structure: p?.Structure?.number ?? 0,
          leadershipTone: p?.['Leadership tone']?.number ?? 0,
          executivePresence: p?.['Executive presence']?.number ?? 0,
          deliveryThinking: p?.['Delivery thinking']?.number ?? 0,
          technicalTranslation: p?.['Technical translation']?.number ?? 0,
          businessAlignment: p?.['Business alignment ']?.number ?? 0,
        },
        wins: (p?.['Key wins']?.rich_text?.[0]?.plain_text ?? '').split('\n').filter(Boolean),
        improvements: (p?.['Key improvements']?.rich_text?.[0]?.plain_text ?? '').split('\n').filter(Boolean),
        conciseRewrite: p?.['Concise rewrite']?.rich_text?.[0]?.plain_text ?? '',
        microChallenge: p?.['Micro challenge']?.rich_text?.[0]?.plain_text ?? '',
        wpm: p?.WPM?.number ?? 0,
        fillersPerMinute: p?.['Fillers per minute']?.number ?? 0,
      }
    })
  } catch {
    return []
  }
}
