import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { getOrderById } from '@/services/orderService'
import { getStoreSettings } from '@/services/storeSettingsService'
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/services/whatsappService'
import { formatCurrency } from '@/utils/currency'
import { formatZipCode } from '@/utils/cep'

export function OrderConfirmation() {
  const { id = '' } = useParams()
  const { data: order, loading } = useAsync(() => getOrderById(id), [id])
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  if (loading) {
    return (
      <div className="container-luxe flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-luxe py-16">
        <EmptyState
          title="Pedido não encontrado."
          action={
            <Link to="/produtos">
              <Button className="mt-2">Ver catálogo</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const whatsappUrl = settings?.whatsapp
    ? getWhatsAppUrl(settings.whatsapp, generateWhatsAppMessage(order))
    : null

  return (
    <div className="container-luxe py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto mb-5 size-12 text-gold" strokeWidth={1.25} />
        <h1 className="font-display text-3xl text-ink md:text-4xl">Pedido recebido!</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Número do pedido: <span className="font-medium text-ink">#{String(order.orderNumber).padStart(6, '0')}</span>
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl border border-stone p-6">
        <ul className="space-y-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span className="text-neutral-600">
                {item.quantity}x {item.name}
              </span>
              <span className="text-ink">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-stone pt-5 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Frete</span>
            <span>{formatCurrency(order.shipping)}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-stone pt-4 text-base font-medium text-ink">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>

        <div className="mt-6 border-t border-stone pt-6 text-sm text-neutral-600">
          {order.deliveryMethod === 'pickup' ? (
            <p>Retirada na loja — Jaguariúna - SP</p>
          ) : (
            order.address && (
              <p>
                Entrega para {order.address.street}, {order.address.number}
                {order.address.complement ? ` - ${order.address.complement}` : ''} — {order.address.neighborhood},{' '}
                {order.address.city} - {order.address.state}, CEP {formatZipCode(order.address.zipCode)}
              </p>
            )
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="secondary" className="w-full">
              <MessageCircle className="size-4" /> Falar com a loja pelo WhatsApp
            </Button>
          </a>
        )}
        <Link to="/produtos" className="flex-1">
          <Button variant="outline" className="w-full">
            Continuar comprando
          </Button>
        </Link>
      </div>
    </div>
  )
}
