import { formatCurrency } from '@/utils/currency'
import type { CartItem } from '@/types'

interface CheckoutSummaryProps {
  items: CartItem[]
  subtotal: number
  shipping: number | null
  shippingPending?: boolean
}

export function CheckoutSummary({ items, subtotal, shipping, shippingPending }: CheckoutSummaryProps) {
  const total = subtotal + (shipping ?? 0)

  return (
    <div className="border border-stone p-6">
      <h2 className="font-display text-lg text-ink">Seu pedido</h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3 text-sm">
            <span className="text-neutral-600">
              {item.quantity}x {item.name}
            </span>
            <span className="shrink-0 text-ink">{formatCurrency(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-stone pt-5 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Frete</span>
          <span>{shippingPending ? 'A combinar' : shipping === null ? '—' : formatCurrency(shipping)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-stone pt-4 text-base font-medium text-ink">
        <span>Total</span>
        <span>{formatCurrency(total)}{shippingPending && ' + frete'}</span>
      </div>

      {shippingPending && (
        <p className="mt-3 text-xs text-neutral-500">
          O valor do frete pra sua região será combinado com a loja pelo WhatsApp após o pedido.
        </p>
      )}
    </div>
  )
}
