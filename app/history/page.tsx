import Link from 'next/link'
import { fetchSessions } from '@/lib/notion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function avgScore(scores: Record<string, number>): number {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
}

const modeColors: Record<string, string> = {
  SteerCo: 'bg-blue-100 text-blue-800',
  Team: 'bg-green-100 text-green-800',
  Status: 'bg-yellow-100 text-yellow-800',
  'CTO-Advisor': 'bg-purple-100 text-purple-800',
}

export default async function HistoryPage() {
  const sessions = await fetchSessions(20)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold tracking-tight">Session History</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Today
          </Link>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                No sessions yet.{' '}
                {!process.env.NOTION_API_KEY
                  ? 'Add Notion credentials to .env.local to enable history.'
                  : 'Complete a drill on the home page to see it here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const overall = avgScore(session.scores)
              const scoreColor = overall >= 7 ? 'text-green-600' : overall >= 5 ? 'text-yellow-600' : 'text-red-500'
              return (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('en-AU', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          })}
                        </span>
                        {session.mode && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${modeColors[session.mode] ?? 'bg-muted text-muted-foreground'}`}>
                            {session.mode}
                          </span>
                        )}
                      </div>
                      <span className={`text-lg font-bold ${scoreColor}`}>{overall}/10</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-2">
                    <p className="text-sm font-medium leading-snug">{session.prompt}</p>
                    {session.transcript && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{session.transcript}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                      {session.durationSec > 0 && <span>{session.durationSec}s</span>}
                      {session.wpm > 0 && <span>{session.wpm} WPM</span>}
                      {session.fillersPerMinute > 0 && <span>{session.fillersPerMinute} fillers/min</span>}
                    </div>
                    {session.microChallenge && (
                      <p className="text-xs text-purple-700 border-l-2 border-purple-300 pl-2 mt-1">
                        {session.microChallenge}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
