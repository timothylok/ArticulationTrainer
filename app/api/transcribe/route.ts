import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const apiKey = process.env.TRANSCRIBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TRANSCRIBE_API_KEY not set' }, { status: 503 })
  }

  const formData = await request.formData()
  const audio = formData.get('audio') as Blob | null
  if (!audio) {
    return NextResponse.json({ error: 'No audio file' }, { status: 400 })
  }

  const groqForm = new FormData()
  groqForm.append('file', audio, 'recording.webm')
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('response_format', 'json')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: groqForm,
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Groq transcription error:', text)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ transcript: data.text ?? '' })
}
