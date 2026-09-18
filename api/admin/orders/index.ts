import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin.js'
import { getAdminFirestore } from '../../_lib/firebaseAdmin.js'
import { orderStatusInputSchema } from '../../_lib/schemas.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()
  const { id } = req.query

  if (typeof id !== 'string') {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ message: 'Método não permitido.' })
    }

    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return res.status(200).json({ orders })
  }

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

  if (req.method === 'DELETE') {
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }
    await docRef.delete()
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE')
  return res.status(405).json({ message: 'Método não permitido.' })
}
