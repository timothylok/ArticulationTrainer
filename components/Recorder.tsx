'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  onTranscript: (transcript: string, durationSec: number) => void
}

type RecorderState = 'idle' | 'recording' | 'transcribing' | 'done' | 'manual'

export default function Recorder({ onTranscript }: Props) {
  const [state, setState] = useState<RecorderState>('idle')
  const [error, setError] = useState('')
  const [manualText, setManualText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current = recorder
      startTimeRef.current = Date.now()
      recorder.start()
      setState('recording')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not access microphone')
    }
  }, [])

  const stop = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    setState('transcribing')
    const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000)

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      recorder.stop()
    })

    streamRef.current?.getTracks().forEach((t) => t.stop())

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const form = new FormData()
    form.append('audio', blob)

    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'TRANSCRIBE_API_KEY not set') {
          setState('manual')
          return
        }
        throw new Error(data.error ?? 'Transcription failed')
      }
      const { transcript } = await res.json()
      onTranscript(transcript, durationSec)
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed')
      setState('manual')
    }
  }, [onTranscript])

  const reset = useCallback(() => {
    setState('idle')
    setError('')
    setManualText('')
    chunksRef.current = []
  }, [])

  const submitManual = useCallback(() => {
    if (!manualText.trim()) return
    const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
    onTranscript(manualText.trim(), dur)
    setState('done')
  }, [manualText, onTranscript])

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {state === 'idle' && (
        <Button size="lg" className="w-full" onClick={start}>
          Start Recording
        </Button>
      )}

      {state === 'recording' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording…
          </div>
          <Button size="lg" variant="outline" className="w-full" onClick={stop}>
            Stop &amp; Transcribe
          </Button>
        </div>
      )}

      {state === 'transcribing' && (
        <Button size="lg" className="w-full" disabled>
          Transcribing…
        </Button>
      )}

      {state === 'manual' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No transcription API available — type your response or add{' '}
            <code className="text-xs bg-muted px-1 rounded">TRANSCRIBE_API_KEY</code> (Groq) to{' '}
            <code className="text-xs bg-muted px-1 rounded">.env.local</code>.
          </p>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type your spoken response here…"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={submitManual} disabled={!manualText.trim()}>
              Submit
            </Button>
            <Button variant="outline" onClick={reset}>Cancel</Button>
          </div>
        </div>
      )}

      {state === 'done' && (
        <Button size="sm" variant="ghost" onClick={reset}>Record again</Button>
      )}
    </div>
  )
}
