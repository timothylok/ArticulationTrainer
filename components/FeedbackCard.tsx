'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

type Scores = {
  clarity: number
  conciseness: number
  structure: number
  leadershipTone: number
  executivePresence: number
  deliveryThinking: number
  technicalTranslation: number
  businessAlignment: number
}

export type AnalysisResult = {
  scores: Scores
  wins: string[]
  improvements: string[]
  conciseRewrite: string
  microChallenge: string
  wpm: number
  fillersPerMinute: number
}

const SCORE_LABELS: Record<keyof Scores, string> = {
  clarity: 'Clarity',
  conciseness: 'Conciseness',
  structure: 'Structure',
  leadershipTone: 'Leadership tone',
  executivePresence: 'Executive presence',
  deliveryThinking: 'Delivery thinking',
  technicalTranslation: 'Technical translation',
  businessAlignment: 'Business alignment',
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(1, Math.min(10, value))
  const color = clamped >= 7 ? 'bg-green-500' : clamped >= 5 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{clamped}/10</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${clamped * 10}%` }} />
      </div>
    </div>
  )
}

function avg(scores: Scores): number {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
}

export default function FeedbackCard({ result }: { result: AnalysisResult }) {
  const overall = avg(result.scores)
  const overallColor = overall >= 7 ? 'text-green-600' : overall >= 5 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="space-y-4">
      {/* Overall + delivery stats */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Overall score</span>
            <span className={`text-2xl font-bold ${overallColor}`}>{overall}/10</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-4">
            <div><span className="font-semibold text-foreground">{result.wpm}</span> WPM</div>
            <div><span className="font-semibold text-foreground">{result.fillersPerMinute}</span> fillers/min</div>
          </div>
          <div className="space-y-2.5">
            {(Object.keys(SCORE_LABELS) as (keyof Scores)[]).map((key) => (
              <ScoreBar key={key} label={SCORE_LABELS[key]} value={result.scores[key]} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wins */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">What worked</p>
        </CardHeader>
        <CardContent className="pb-4">
          <ul className="space-y-1.5">
            {result.wins.map((w, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-700">To improve</p>
        </CardHeader>
        <CardContent className="pb-4">
          <ul className="space-y-1.5">
            {result.improvements.map((imp, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-orange-400 mt-0.5">→</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Concise rewrite */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-2 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Concise rewrite</p>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm leading-relaxed italic">&ldquo;{result.conciseRewrite}&rdquo;</p>
        </CardContent>
      </Card>

      {/* Micro challenge */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-700 mb-1.5">Tomorrow&apos;s challenge</p>
          <p className="text-sm font-medium">{result.microChallenge}</p>
        </CardContent>
      </Card>
    </div>
  )
}
