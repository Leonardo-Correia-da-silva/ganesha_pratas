import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildLogoutCookie } from '../_lib/session.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  res.setHeader('Set-Cookie', buildLogoutCookie())
  return res.status(200).json({ success: true })
}
