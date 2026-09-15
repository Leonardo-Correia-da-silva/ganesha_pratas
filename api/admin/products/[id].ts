import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin'
import { getAdminFirestore } from '../../_lib/firebaseAdmin'
import { productInputSchema } from '../../_lib/schemas'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const { id } = req.query
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Produto inválido.' })
  }

  const db = getAdminFirestore()
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
