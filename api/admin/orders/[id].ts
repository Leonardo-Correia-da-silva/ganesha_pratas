import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin'
import { getAdminFirestore } from '../../_lib/firebaseAdmin'
import { orderStatusInputSchema } from '../../_lib/schemas'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const { id } = req.query
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Pedido inválido.' })
  }

  const db = getAdminFirestore()
  const docRef = db.collection('orders').doc(id)

  if (req.method === 'GET') {
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }
    return res.status(200).json({ order: { id: snapshot.id, ...snapshot.data() } })
  }

  if (req.method === 'PATCH') {
    const parsed = orderStatusInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Status inválido.' })
    }

    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }

    await docRef.update({ status: parsed.data.status, updatedAt: new Date().toISOString() })
    const updated = await docRef.get()
    return res.status(200).json({ order: { id: updated.id, ...updated.data() } })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ message: 'Método não permitido.' })
}
