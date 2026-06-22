export const AUTH_COOKIE = 'auth_token'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function isValidPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD
  if (!expected) return false
  return password === expected
}
