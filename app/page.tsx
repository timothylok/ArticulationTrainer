import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getPrompt, type PromptResult } from '@/lib/getPrompt'
import DrillSession from '@/components/DrillSession'

async function fetchPrompt(): Promise<PromptResult | null> {
  try {
    return await getPrompt()
  } catch (err) {
    console.error('[fetchPrompt]', err)
    return null
  }
}

const modeColors: Record<string, string> = {
  SteerCo: 'bg-blue-100 text-blue-800',
  Team: 'bg-green-100 text-green-800',
  Status: 'bg-yellow-100 text-yellow-800',
  'CTO-Advisor': 'bg-purple-100 text-purple-800',
}

export default async function HomePage() {
  const data = await fetchPrompt()

  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Articulation Trainer</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/history" className="hover:text-foreground transition-colors">History</Link>
            <Link href="/weekly" className="hover:text-foreground transition-colors">Weekly</Link>
            <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </nav>
        </div>

        {data ? (
          <>
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today&apos;s drill</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${modeColors[data.mode] ?? 'bg-muted text-muted-foreground'}`}>
                    {data.mode}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed font-medium">{data.prompt}</p>
              </CardContent>
            </Card>
            <DrillSession promptData={data} />
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Could not load today&apos;s prompt. Check that Ollama is running.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
