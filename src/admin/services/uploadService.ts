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

export function buildProductImage(url: string, path: string, order: number, isMain: boolean): ProductImage {
  return { url, path, order, isMain }
}
