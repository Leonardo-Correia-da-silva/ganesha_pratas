import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../../_lib/requireAdmin'
import { getAdminFirestore } from '../../_lib/firebaseAdmin'
import { storeSettingsInputSchema } from '../../_lib/schemas'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()
  const docRef = db.collection('settings').doc('store')

  if (req.method === 'GET') {
    const snapshot = await docRef.get()
    return res.status(200).json({ settings: snapshot.exists ? snapshot.data() : null })
  }

  if (req.method === 'PUT') {
    const parsed = storeSettingsInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados da loja inválidos.', issues: parsed.error.issues })
    }

    const data = { ...parsed.data, logoUrl: parsed.data.logoUrl ?? null, updatedAt: new Date().toISOString() }
    await docRef.set(data, { merge: true })
    return res.status(200).json({ settings: data })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ message: 'Método não permitido.' })
}
