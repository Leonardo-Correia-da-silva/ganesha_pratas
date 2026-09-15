import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/currency'
import { getProductMainImage } from '@/services/productService'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const image = getProductMainImage(product)
  const hasPromo = product.promotionalPrice !== null && product.promotionalPrice < product.price
  const soldOut = product.stock <= 0

  return (
    <Link to={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-offwhite">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-neutral-400">
            <span className="font-display text-lg">Sem imagem</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">Novo</Badge>}
          {hasPromo && <Badge variant="sale">Oferta</Badge>}
        </div>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="text-xs uppercase tracking-widest text-paper">Esgotado</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="text-sm text-ink">{formatCurrency(product.promotionalPrice!)}</span>
              <span className="text-xs text-neutral-400 line-through">{formatCurrency(product.price)}</span>
            </>
          ) : (
            <span className="text-sm text-ink">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
