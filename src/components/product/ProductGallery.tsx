import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  videoUrl?: string | null
}

export function ProductGallery({ images, productName, videoUrl }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.order - b.order)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  const activeImage = sorted[activeIndex]

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square w-full overflow-hidden bg-offwhite">
        {showVideo && videoUrl ? (
          <video src={videoUrl} controls preload="metadata" className="size-full object-cover" />
        ) : activeImage ? (
          <img src={activeImage.url} alt={productName} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-neutral-400">
            <span className="font-display text-lg">Sem imagem</span>
          </div>
        )}
      </div>

      {(sorted.length > 1 || videoUrl) && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {sorted.map((image, index) => (
            <button
              key={image.path}
              type="button"
              onClick={() => {
                setShowVideo(false)
                setActiveIndex(index)
              }}
              className={cn(
                'size-16 shrink-0 overflow-hidden border-2 transition-colors sm:size-20',
                !showVideo && index === activeIndex ? 'border-gold' : 'border-transparent',
              )}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <img src={image.url} alt="" className="size-full object-cover" />
            </button>
          ))}

          {videoUrl && (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className={cn(
                'flex size-16 shrink-0 items-center justify-center border-2 bg-ink text-paper transition-colors sm:size-20',
                showVideo ? 'border-gold' : 'border-transparent',
              )}
              aria-label="Ver vídeo do produto"
            >
              <span className="text-[10px] uppercase tracking-wide">Vídeo</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
