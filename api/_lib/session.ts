import { createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

const COOKIE_NAME = 'admin_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 8 // 8 hours

interface SessionPayload {
  admin: true
  exp: number
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET não configurado no ambiente do servidor.')
  }
  return secret
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function createSessionToken(): string {
  const payload: SessionPayload = { admin: true, exp: Date.now() + SESSION_DURATION_SECONDS * 1000 }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return false

  const expectedSignature = sign(encodedPayload)
  const expectedBuffer = Buffer.from(expectedSignature)
  const actualBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== actualBuffer.length) return false
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return false

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload
    return payload.admin === true && payload.exp > Date.now()
  } catch {
    return false
  }
}

export function buildSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (isProduction) parts.push('Secure')
  return parts.join('; ')
}

export function buildLogoutCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const parts = [`${COOKIE_NAME}=`, 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax']
  if (isProduction) parts.push('Secure')
  return parts.join('; ')
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=')
    if (key) acc[key] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

export function isAuthenticated(req: VercelRequest): boolean {
  const cookies = parseCookies(req.headers.cookie)
  return verifySessionToken(cookies[COOKIE_NAME])
}
