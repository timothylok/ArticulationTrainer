'use client'

import { useState } from 'react'
import Recorder from './Recorder'
import FeedbackCard, { type AnalysisResult } from './FeedbackCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { PromptResult } from '@/lib/getPrompt'

type Props = {
  promptData: PromptResult
}

type SessionState = 'ready' | 'recorded' | 'analyzing' | 'done'

export default function DrillSession({ promptData }: Props) {
  const [sessionState, setSessionState] = useState<SessionState>('ready')
  const [transcript, setTranscript] = useState('')
  const [durationSec, setDurationSec] = useState(0)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')

  function handleTranscript(text: string, dur: number) {
    setTranscript(text)
    setDurationSec(dur)
    setSessionState('recorded')
  }

  async function handleAnalyze() {
    setAnalyzeError('')
    setSessionState('analyzing')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, prompt: promptData.prompt, durationSec }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Analysis failed')
      }
      const result: AnalysisResult = await res.json()
      setAnalysis(result)
      setSessionState('done')
      // Fire-and-forget Notion log — don't block UI
      fetch('/api/notion/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: promptData.date,
          prompt: promptData.prompt,
          transcript,
          durationSec,
          mode: promptData.mode,
          analysis: result,
        }),
      }).then(async (r) => {
        if (!r.ok) console.error('Notion log failed:', await r.text())
      }).catch((err) => console.error('Notion log error:', err))
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed')
      setSessionState('recorded')
    }
  }

  function handleReset() {
    setTranscript('')
    setDurationSec(0)
    setAnalysis(null)
    setAnalyzeError('')
    setSessionState('ready')
  }

  return (
    <div className="space-y-4">
      {sessionState === 'ready' && (
        <Recorder onTranscript={handleTranscript} />
      )}

      {(sessionState === 'recorded' || sessionState === 'analyzing') && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your response · {durationSec}s
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{transcript}</p>
            </CardContent>
          </Card>
          {analyzeError && <p className="text-sm text-destructive">{analyzeError}</p>}
          <div className="flex gap-2">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAnalyze}
              disabled={sessionState === 'analyzing'}
            >
              {sessionState === 'analyzing' ? 'Analyzing…' : 'Analyze'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleReset} disabled={sessionState === 'analyzing'}>
              Re-record
            </Button>
          </div>
        </div>
      )}

      {sessionState === 'done' && analysis && (
        <div className="space-y-4">
          <FeedbackCard result={analysis} />
          <Button variant="outline" className="w-full" onClick={handleReset}>
            Start new drill
          </Button>
        </div>
      )}
    </div>
  )
}
