import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthenticated } from './session'

/** Returns true and short-circuits the response with 401 when the request has no valid admin session. */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  if (!isAuthenticated(req)) {
    res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' })
    return true
  }
  return false
}
