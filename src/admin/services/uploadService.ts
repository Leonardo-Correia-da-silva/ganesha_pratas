import { adminApi } from './adminApi'
import type { ProductImage } from '@/types'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.readAsDataURL(file)
  })
}

export async function uploadProductImage(productId: string, file: File): Promise<{ url: string; path: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato não suportado. Use JPG, PNG ou WEBP.')
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Imagem muito grande. O tamanho máximo é 3MB.')
  }

  const base64Data = await fileToBase64(file)

  return adminApi.post('/api/admin/upload', {
    productId,
    fileName: file.name,
    contentType: file.type,
    base64Data,
  })
}

export async function deleteProductImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

type ImageScope = 'logo' | 'footer-logo' | 'footer-background' | 'category' | 'hero' | 'about'

async function uploadScopedImage(file: File, scope: ImageScope): Promise<{ url: string; path: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato não suportado. Use JPG, PNG ou WEBP.')
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Imagem muito grande. O tamanho máximo é 3MB.')
  }

  const base64Data = await fileToBase64(file)

  return adminApi.post('/api/admin/upload', {
    scope,
    fileName: file.name,
    contentType: file.type,
    base64Data,
  })
}

export async function uploadLogo(file: File): Promise<{ url: string; path: string }> {
  return uploadScopedImage(file, 'logo')
}

export async function deleteLogoImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

export async function uploadFooterLogo(file: File): Promise<{ url: string; path: string }> {
  return uploadScopedImage(file, 'footer-logo')
}

export async function deleteFooterLogoImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

export async function uploadFooterBackground(file: File): Promise<{ url: string; path: string }> {
  return uploadScopedImage(file, 'footer-background')
}

export async function deleteFooterBackgroundImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

export async function uploadCategoryImage(file: File): Promise<{ url: string; path: string }> {
  return uploadScopedImage(file, 'category')
}

export async function deleteCategoryImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

export async function uploadHeroImage(file: File): Promise<{ url: string; path: string }> {
  return uploadScopedImage(file, 'hero')
}

export async function deleteHeroImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

export async function uploadAboutImage(file: File): Promise<{ url: string; path: string }> {
  return uploadScopedImage(file, 'about')
}

export async function deleteAboutImage(path: string): Promise<void> {
  await adminApi.delete('/api/admin/upload', { path })
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024

async function uploadVideoFile(
  file: File,
  requestBody: { productId: string } | { scope: 'hero' },
): Promise<{ url: string; path: string }> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Formato não suportado. Use MP4, WEBM ou MOV.')
  }
  if (!('scope' in requestBody) && file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error('Vídeo muito grande. O tamanho máximo é 20MB.')
  }

  const { uploadUrl, path, maxSizeBytes } = await adminApi.post<{
    uploadUrl: string
    path: string
    maxSizeBytes: number | null
  }>('/api/admin/product-video', { ...requestBody, fileName: file.name, contentType: file.type })

  const putResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      ...(maxSizeBytes != null ? { 'x-goog-content-length-range': `0,${maxSizeBytes}` } : {}),
    },
    body: file,
  })
  if (!putResponse.ok) {
    throw new Error('Não foi possível enviar o vídeo.')
  }

  return adminApi.put<{ url: string }>('/api/admin/product-video', { path }).then((res) => ({ url: res.url, path }))
}

export async function uploadProductVideo(productId: string, file: File): Promise<{ url: string; path: string }> {
  return uploadVideoFile(file, { productId })
}

export async function uploadHeroVideo(file: File): Promise<{ url: string; path: string }> {
  return uploadVideoFile(file, { scope: 'hero' })
}

export async function deleteProductVideo(path: string): Promise<void> {
  await adminApi.delete('/api/admin/product-video', { path })
}

export function buildProductImage(url: string, path: string, order: number, isMain: boolean): ProductImage {
  return { url, path, order, isMain }
}
