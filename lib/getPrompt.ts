import { fetchCareerGoals } from './notion'
import { buildPromptGenerationSystemPrompt } from './prompts'
import { generateText } from './llm'
import { getModeForDate, type Mode } from './config'

export type PromptResult = {
  prompt: string
  mode: Mode
  date: string
}

export async function getPrompt(): Promise<PromptResult> {
  const today = new Date()
  const mode = getModeForDate(today)

  const goals = await fetchCareerGoals()
  const goalsText = goals.length
    ? goals.map((g) => `- [${g.priority}] ${g.goal}${g.theme ? ` (${g.theme})` : ''}`).join('\n')
    : ''

  const systemPrompt = buildPromptGenerationSystemPrompt(mode, goalsText)
  const prompt = await generateText(systemPrompt, `Generate a ${mode} scenario for today.`)

  return { prompt, mode, date: today.toISOString().split('T')[0] }
}
