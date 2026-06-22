export const MODES = ['SteerCo', 'Team', 'Status', 'CTO-Advisor'] as const
export type Mode = typeof MODES[number]

export const RUBRIC_DIMENSIONS = [
  'Clarity',
  'Conciseness',
  'Structure',
  'Leadership tone',
  'Executive presence',
  'Delivery thinking',
  'Technical translation',
  'Business alignment',
] as const

export const DRILL_DURATION_RANGE = { min: 60, max: 120 } // seconds

// Rotate mode by weekday: Mon=SteerCo, Tue=Team, Wed=Status, Thu=CTO-Advisor, Fri=CTO-Advisor
export function getModeForDate(date: Date): Mode {
  const day = date.getDay() // 0=Sun, 1=Mon...5=Fri
  const weekdayIndex = Math.max(0, Math.min(day - 1, MODES.length - 1))
  return MODES[weekdayIndex]
}
