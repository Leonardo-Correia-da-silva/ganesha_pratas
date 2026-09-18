import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/requireAdmin'
import { getAdminStorage } from '../_lib/firebaseAdmin'

const ALLOWED_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 // 20MB — uploaded directly to Storage via signed URL, bypassing Vercel's request body limit

function isAllowedVideoPath(path: string): boolean {
  return (path.startsWith('products/') && path.includes('/video/')) || path.startsWith('settings/hero-video/')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (requireAdmin(req, res)) return

  if (req.method === 'POST') {
    const { productId, scope, fileName, contentType } = (req.body ?? {}) as {
      productId?: string
      scope?: 'hero'
      fileName?: string
      contentType?: string
    }

    if (!fileName || !contentType || (scope !== 'hero' && !productId)) {
      return res.status(400).json({ message: 'Dados de upload incompletos.' })
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return res.status(400).json({ message: 'Formato de vídeo não suportado. Use MP4, WEBM ou MOV.' })
    }

    const extension = fileName.split('.').pop()?.toLowerCase() ?? 'mp4'
    const path =
      scope === 'hero'
        ? `settings/hero-video/${randomUUID()}.${extension}`
        : `products/${productId}/video/${randomUUID()}.${extension}`

    // Hero video is a single, large, occasionally-uploaded asset with no size cap — give it a longer
    // signed-URL window for slow connections. Product videos keep a modest cap since there can be many of them.
    const [uploadUrl] = await getAdminStorage()
      .bucket()
      .file(path)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + (scope === 'hero' ? 60 : 10) * 60 * 1000,
        contentType,
        ...(scope === 'hero'
          ? {}
          : { extensionHeaders: { 'x-goog-content-length-range': `0,${MAX_FILE_SIZE_BYTES}` } }),
      })

    return res.status(200).json({ uploadUrl, path, maxSizeBytes: scope === 'hero' ? null : MAX_FILE_SIZE_BYTES })
  }

  if (req.method === 'PUT') {
    const { path } = (req.body ?? {}) as { path?: string }
    if (typeof path !== 'string' || !isAllowedVideoPath(path)) {
      return res.status(400).json({ message: 'Caminho de arquivo inválido.' })
    }

    const file = getAdminStorage().bucket().file(path)
    await file.makePublic()
    const bucketName = getAdminStorage().bucket().name
    return res.status(200).json({ url: `https://storage.googleapis.com/${bucketName}/${path}` })
  }

  if (req.method === 'DELETE') {
    const { path } = (req.body ?? {}) as { path?: string }
    if (typeof path !== 'string' || !isAllowedVideoPath(path)) {
      return res.status(400).json({ message: 'Caminho de arquivo inválido.' })
    }
    await getAdminStorage().bucket().file(path).delete({ ignoreNotFound: true })
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', 'POST, PUT, DELETE')
  return res.status(405).json({ message: 'Método não permitido.' })
}
