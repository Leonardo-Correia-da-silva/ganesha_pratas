import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Star, Trash2, Upload } from 'lucide-react'
import { deleteProductImage, uploadProductImage } from '@/admin/services/uploadService'
import { cn } from '@/utils/cn'
import type { ProductImage } from '@/types'

interface ImageUploaderProps {
  productId: string
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export function ImageUploader({ productId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    try {
      const uploaded: ProductImage[] = []
      for (const file of Array.from(files)) {
        const { url, path } = await uploadProductImage(productId, file)
        uploaded.push({ url, path, isMain: false, order: images.length + uploaded.length })
      }

      const next = [...images, ...uploaded]
      if (!next.some((img) => img.isMain) && next.length > 0) {
        next[0] = { ...next[0], isMain: true }
      }
      onChange(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(image: ProductImage) {
    onChange(reorder(images.filter((img) => img.path !== image.path)))
    deleteProductImage(image.path).catch(() => {
      // Best-effort cleanup — the reference is already removed from the product either way.
    })
  }

  function handleSetMain(image: ProductImage) {
    onChange(images.map((img) => ({ ...img, isMain: img.path === image.path })))
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(reorder(next))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={image.path} className="relative w-28">
            <div
              className={cn(
                'aspect-square overflow-hidden border-2',
                image.isMain ? 'border-gold' : 'border-stone',
              )}
            >
              <img src={image.url} alt="" className="size-full object-cover" />
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => handleMove(index, -1)}
                disabled={index === 0}
                className="p-1 text-neutral-500 hover:text-ink disabled:opacity-30"
                aria-label="Mover para a esquerda"
              >
                <ArrowLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetMain(image)}
                aria-label="Definir como imagem principal"
                aria-pressed={image.isMain}
              >
                <Star className={cn('size-3.5', image.isMain ? 'fill-gold text-gold' : 'text-neutral-400')} />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(image)}
                className="p-1 text-neutral-500 hover:text-red-600"
                aria-label="Remover imagem"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 1)}
                disabled={index === images.length - 1}
                className="p-1 text-neutral-500 hover:text-ink disabled:opacity-30"
                aria-label="Mover para a direita"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex aspect-square w-28 cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-stone text-neutral-400 transition-colors hover:border-gold hover:text-gold">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          <span className="text-[10px] uppercase tracking-wide">Adicionar</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-neutral-500">JPG, PNG ou WEBP · até 3MB por imagem</p>
    </div>
  )
}

function reorder(images: ProductImage[]): ProductImage[] {
  return images.map((image, index) => ({ ...image, order: index }))
}
