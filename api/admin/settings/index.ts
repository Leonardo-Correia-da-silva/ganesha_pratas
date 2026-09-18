import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin } from '../../_lib/requireAdmin.js'
import { getAdminFirestore } from '../../_lib/firebaseAdmin.js'
import { storeSettingsInputSchema } from '../../_lib/schemas.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  const db = getAdminFirestore()
  const docRef = db.collection('settings').doc('store')

  if (req.method === 'GET') {
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return res.status(200).json({ settings: null })
    }

    const data = snapshot.data() as Record<string, unknown> & { heroVideoUrl?: string | null }
    // Migrate the old single-video field for stores that saved a hero video before
    // the multi-video playlist feature existed.
    if (!Array.isArray(data.heroVideoUrls) && data.heroVideoUrl) {
      data.heroVideoUrls = [data.heroVideoUrl]
    }

    return res.status(200).json({ settings: data })
  }

  if (req.method === 'PUT') {
    const parsed = storeSettingsInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados da loja inválidos.', issues: parsed.error.issues })
    }

    const data = { ...parsed.data, logoUrl: parsed.data.logoUrl ?? null, updatedAt: new Date().toISOString() }
    // Purge the legacy single-video field once and for all so it can never resurrect a
    // deleted video on the public site after the multi-video playlist migration (see GET above).
    await docRef.set({ ...data, heroVideoUrl: FieldValue.delete() }, { merge: true })
    return res.status(200).json({ settings: data })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ message: 'Método não permitido.' })
}
