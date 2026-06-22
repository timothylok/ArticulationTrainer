const FILLERS = /\b(um+|uh+|er+|like|you know|sort of|kind of|basically|literally|actually|right\?|so+|well+)\b/gi

export function countFillers(transcript: string): number {
  return (transcript.match(FILLERS) ?? []).length
}

export function calcWPM(transcript: string, durationSec: number): number {
  if (durationSec <= 0) return 0
  const words = transcript.trim().split(/\s+/).filter(Boolean).length
  return Math.round((words / durationSec) * 60)
}

export function fillersPerMinute(transcript: string, durationSec: number): number {
  if (durationSec <= 0) return 0
  return Math.round((countFillers(transcript) / durationSec) * 60 * 10) / 10
}
