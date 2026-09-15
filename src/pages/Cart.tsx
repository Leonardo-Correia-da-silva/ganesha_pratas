import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/currency'

export function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container-luxe py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Seu carrinho está vazio."
          description="Explore nossa coleção e encontre a peça perfeita."
          action={
            <Button onClick={() => navigate('/produtos')} className="mt-2">
              Explorar coleção
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <h1 className="mb-8 font-display text-3xl text-ink md:text-4xl">Carrinho</h1>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="h-fit border border-stone p-6">
          <h2 className="font-display text-lg text-ink">Resumo</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>
          </div>

          <div className="mt-5 flex justify-between border-t border-stone pt-5 text-base font-medium text-ink">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <Button onClick={() => navigate('/checkout')} className="mt-6 w-full">
            Finalizar compra
          </Button>

          <Link
            to="/produtos"
            className="mt-4 block text-center text-xs uppercase tracking-widest text-neutral-500 hover:text-ink"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
