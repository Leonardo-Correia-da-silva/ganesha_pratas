import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { formatCurrency } from '@/utils/currency'
import type { CartItem } from '@/types'

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  onRemove: (productId: string, size: string | undefined) => void
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-4 border-b border-stone py-6 sm:gap-6">
      <Link to={`/produto/${item.slug}`} className="size-20 shrink-0 overflow-hidden bg-offwhite sm:size-28">
        {item.image ? (
          <img src={item.image} alt={item.name} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-neutral-400">
            <span className="text-[10px]">Sem imagem</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/produto/${item.slug}`} className="font-display text-base text-ink sm:text-lg">
            {item.name}
          </Link>
          <button
            onClick={() => onRemove(item.productId, item.size)}
            aria-label={`Remover ${item.name}`}
            className="p-1 text-neutral-400 transition-colors hover:text-ink"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <p className="text-sm text-neutral-500">{formatCurrency(item.price)}</p>
        {item.size && <p className="text-sm text-neutral-500">Tamanho: {item.size}</p>}

        <div className="mt-2 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            max={item.stock}
            onChange={(quantity) => onUpdateQuantity(item.productId, item.size, quantity)}
            size="sm"
          />
          <p className="text-sm font-medium text-ink">{formatCurrency(item.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  )
}
