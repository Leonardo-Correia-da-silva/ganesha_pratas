import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin.js'
import { getAdminFirestore } from '../../_lib/firebaseAdmin.js'
import { shippingRegionInputSchema } from '../../_lib/schemas.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()
  const { id } = req.query

  if (typeof id !== 'string') {
    if (req.method === 'GET') {
      const snapshot = await db.collection('shippingRegions').orderBy('name', 'asc').get()
      const regions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      return res.status(200).json({ regions })
    }

    if (req.method === 'POST') {
      const parsed = shippingRegionInputSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ message: 'Dados da região inválidos.', issues: parsed.error.issues })
      }

      if (parsed.data.zipCodeStart > parsed.data.zipCodeEnd) {
        return res.status(400).json({ message: 'O CEP inicial deve ser menor ou igual ao CEP final.' })
      }

      const now = new Date().toISOString()
      const docRef = await db.collection('shippingRegions').add({ ...parsed.data, createdAt: now, updatedAt: now })
      const created = await docRef.get()
      return res.status(201).json({ region: { id: created.id, ...created.data() } })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const docRef = db.collection('shippingRegions').doc(id)

  if (req.method === 'PUT') {
    const parsed = shippingRegionInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados da região inválidos.', issues: parsed.error.issues })
    }

    if (parsed.data.zipCodeStart > parsed.data.zipCodeEnd) {
      return res.status(400).json({ message: 'O CEP inicial deve ser menor ou igual ao CEP final.' })
    }

    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Região não encontrada.' })
    }

    await docRef.update({ ...parsed.data, updatedAt: new Date().toISOString() })
    const updated = await docRef.get()
    return res.status(200).json({ region: { id: updated.id, ...updated.data() } })
  }

  if (req.method === 'DELETE') {
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Região não encontrada.' })
    }
    await docRef.delete()
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', 'PUT, DELETE')
  return res.status(405).json({ message: 'Método não permitido.' })
}
