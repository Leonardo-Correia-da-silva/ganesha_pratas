import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/requireAdmin'
import { getAdminStorage } from '../_lib/firebaseAdmin'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024 // 3MB per image (base64 body stays under Vercel's request limit)

interface UploadBody {
  productId?: string
  fileName?: string
  contentType?: string
  base64Data?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  if (req.method === 'DELETE') {
    const { path } = (req.body ?? {}) as { path?: string }
    if (typeof path !== 'string' || !path.startsWith('products/')) {
      return res.status(400).json({ message: 'Caminho de arquivo inválido.' })
    }
    await getAdminStorage().bucket().file(path).delete({ ignoreNotFound: true })
    return res.status(200).json({ success: true })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, DELETE')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const { productId, fileName, contentType, base64Data } = (req.body ?? {}) as UploadBody

  if (!productId || !fileName || !contentType || !base64Data) {
    return res.status(400).json({ message: 'Dados de upload incompletos.' })
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ message: 'Formato de imagem não suportado. Use JPG, PNG ou WEBP.' })
  }

  const buffer = Buffer.from(base64Data, 'base64')

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({ message: 'Imagem muito grande. O tamanho máximo é 3MB.' })
  }

  const extension = fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `products/${productId}/images/${randomUUID()}.${extension}`
  const file = getAdminStorage().bucket().file(path)

  await file.save(buffer, { metadata: { contentType }, public: true })

  const bucketName = getAdminStorage().bucket().name
  const url = `https://storage.googleapis.com/${bucketName}/${path}`

  return res.status(201).json({ url, path })
}
