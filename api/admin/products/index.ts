import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin.js'
import { getAdminFirestore } from '../../_lib/firebaseAdmin.js'
import { productInputSchema } from '../../_lib/schemas.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()
  const { id } = req.query

  if (typeof id !== 'string') {
    if (req.method === 'GET') {
      const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get()
      const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      return res.status(200).json({ products })
    }

    if (req.method === 'POST') {
      const parsed = productInputSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ message: 'Dados do produto inválidos.', issues: parsed.error.issues })
      }

      const existingSlug = await db.collection('products').where('slug', '==', parsed.data.slug).limit(1).get()
      if (!existingSlug.empty) {
        return res.status(409).json({ message: 'Já existe um produto com este slug.' })
      }

      const now = new Date().toISOString()
      const docRef = await db.collection('products').add({
        ...parsed.data,
        createdAt: now,
        updatedAt: now,
      })

      const created = await docRef.get()
      return res.status(201).json({ product: { id: created.id, ...created.data() } })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const docRef = db.collection('products').doc(id)

  if (req.method === 'PUT') {
    const parsed = productInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados do produto inválidos.', issues: parsed.error.issues })
    }

    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Produto não encontrado.' })
    }

    const conflictingSlug = await db
      .collection('products')
      .where('slug', '==', parsed.data.slug)
      .limit(2)
      .get()
    const hasConflict = conflictingSlug.docs.some((doc) => doc.id !== id)
    if (hasConflict) {
      return res.status(409).json({ message: 'Já existe um produto com este slug.' })
    }

    await docRef.update({ ...parsed.data, updatedAt: new Date().toISOString() })
    const updated = await docRef.get()
    return res.status(200).json({ product: { id: updated.id, ...updated.data() } })
  }

  if (req.method === 'DELETE') {
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Produto não encontrado.' })
    }
    await docRef.delete()
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', 'PUT, DELETE')
  return res.status(405).json({ message: 'Método não permitido.' })
}
