import { NextRequest, NextResponse } from 'next/server'
import { isValidPassword, AUTH_COOKIE, COOKIE_MAX_AGE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return response
}
