import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export function CartIcon() {
  const { totalItems } = useCart()

  return (
    <Link to="/carrinho" className="relative flex items-center justify-center p-2" aria-label="Ver carrinho">
      <ShoppingBag className="size-5 text-ink" strokeWidth={1.5} />
      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-ink">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
