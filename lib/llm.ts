type Provider = { name: string; url: string; model: string; apiKey: string | undefined }

const PROVIDERS: Provider[] = [
  {
    name: 'MiniMax',
    url: 'https://api.minimax.chat/v1/chat/completions',
    model: 'm3',
    apiKey: process.env.MINIMAX_API_KEY,
  },
  {
    name: 'Agnes',
    url: 'https://apihub.agnes-ai.com/v1/chat/completions',
    model: 'agnes-2.0-flash',
    apiKey: process.env.AGNES_API_KEY,
  },
  {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.TRANSCRIBE_API_KEY,
  },
]

async function callProvider(p: Provider, system: string, user: string): Promise<string> {
  if (!p.apiKey) throw new Error(`${p.name}: no API key`)
  const res = await fetch(p.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${p.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: p.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw new Error(`${p.name} error ${res.status}: ${await res.text()}`)
  const content = (await res.json())?.choices?.[0]?.message?.content ?? ''
  if (!content) throw new Error(`${p.name}: empty response`)
  return content
}

export async function generateText(system: string, user: string): Promise<string> {
  for (const provider of PROVIDERS) {
    try {
      return await callProvider(provider, system, user)
    } catch (err) {
      console.error(`LLM fallback — ${provider.name}: ${err}`)
    }
  }
  throw new Error('All LLM providers failed')
}
