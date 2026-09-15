import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../../../_lib/requireAdmin'
import { getAdminFirestore } from '../../../../_lib/firebaseAdmin'
import { shippingRegionInputSchema } from '../../../../_lib/schemas'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()

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
