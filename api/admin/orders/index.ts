import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin'
import { getAdminFirestore } from '../../_lib/firebaseAdmin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const db = getAdminFirestore()
  const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
  const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return res.status(200).json({ orders })
}
