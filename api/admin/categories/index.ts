import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin.js'
import { getAdminFirestore } from '../../_lib/firebaseAdmin.js'
import { categoryInputSchema } from '../../_lib/schemas.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()

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
