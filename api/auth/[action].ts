import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildLogoutCookie, buildSessionCookie, createSessionToken, isAuthenticated } from '../_lib/session.js'

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ message: 'Login administrativo não configurado.' })
  }

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string }

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ message: 'Email ou senha inválidos.' })
  }

  const emailMatches = safeCompare(email.trim().toLowerCase(), adminEmail.trim().toLowerCase())
  const passwordMatches = safeCompare(password, adminPassword)

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ message: 'Email ou senha inválidos.' })
  }

  const token = createSessionToken()
  res.setHeader('Set-Cookie', buildSessionCookie(token))
  return res.status(200).json({ success: true })
}

function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  res.setHeader('Set-Cookie', buildLogoutCookie())
  return res.status(200).json({ success: true })
}

function handleSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  return res.status(200).json({ authenticated: isAuthenticated(req) })
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query

  if (action === 'login') return handleLogin(req, res)
  if (action === 'logout') return handleLogout(req, res)
  if (action === 'session') return handleSession(req, res)

  return res.status(404).json({ message: 'Não encontrado.' })
}
