import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin.js'
import { getAdminFirestore } from '../../_lib/firebaseAdmin.js'
import { categoryInputSchema } from '../../_lib/schemas.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()
  const { id } = req.query

  if (typeof id !== 'string') {
    if (req.method === 'GET') {
      const snapshot = await db.collection('categories').orderBy('order', 'asc').get()
      const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      return res.status(200).json({ categories })
    }

    if (req.method === 'POST') {
      const parsed = categoryInputSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ message: 'Dados da categoria inválidos.', issues: parsed.error.issues })
      }

      const existingSlug = await db.collection('categories').where('slug', '==', parsed.data.slug).limit(1).get()
      if (!existingSlug.empty) {
        return res.status(409).json({ message: 'Já existe uma categoria com este slug.' })
      }

      const now = new Date().toISOString()
      const docRef = await db.collection('categories').add({
        ...parsed.data,
        imageUrl: parsed.data.imageUrl ?? null,
        createdAt: now,
        updatedAt: now,
      })

      const created = await docRef.get()
      return res.status(201).json({ category: { id: created.id, ...created.data() } })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const docRef = db.collection('categories').doc(id)

  if (req.method === 'PUT') {
    const parsed = categoryInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados da categoria inválidos.', issues: parsed.error.issues })
    }

    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Categoria não encontrada.' })
    }

    const conflictingSlug = await db
      .collection('categories')
      .where('slug', '==', parsed.data.slug)
      .limit(2)
      .get()
    const hasConflict = conflictingSlug.docs.some((doc) => doc.id !== id)
    if (hasConflict) {
      return res.status(409).json({ message: 'Já existe uma categoria com este slug.' })
    }

    await docRef.update({ ...parsed.data, imageUrl: parsed.data.imageUrl ?? null, updatedAt: new Date().toISOString() })
    const updated = await docRef.get()
    return res.status(200).json({ category: { id: updated.id, ...updated.data() } })
  }

  if (req.method === 'DELETE') {
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ message: 'Categoria não encontrada.' })
    }

    const linkedProducts = await db.collection('products').where('categoryId', '==', id).limit(1).get()
    if (!linkedProducts.empty) {
      return res.status(409).json({
        message: 'Não é possível excluir: existem produtos vinculados a esta categoria.',
      })
    }

    await docRef.delete()
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', 'PUT, DELETE')
  return res.status(405).json({ message: 'Método não permitido.' })
}
