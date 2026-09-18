import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageCircle, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrderStatusBadge } from '@/admin/components/OrderStatusBadge'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { deleteOrder, getAdminOrder, updateOrderStatus } from '@/admin/services/orderAdminService'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/utils/currency'
import { formatZipCode } from '@/utils/cep'
import { generateStatusUpdateMessage, getWhatsAppUrl } from '@/services/whatsappService'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order, type OrderStatus } from '@/types'

export function OrderDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getAdminOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(status: OrderStatus) {
    setUpdating(true)
    try {
      const updated = await updateOrderStatus(id, status)
      setOrder(updated)
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteOrder(id)
      navigate('/admin/orders')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!order) {
    return <EmptyState title="Pedido não encontrado." />
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Pedido #${String(order.orderNumber).padStart(6, '0')}`}
        action={
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={() => setConfirmingDelete(true)}
              className="p-1.5 text-neutral-500 hover:text-red-600"
              aria-label="Excluir pedido"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        }
      />

      <p className="mb-6 text-xs text-neutral-500">
        {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-stone bg-paper p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Cliente</h2>
          <p className="text-sm text-ink">{order.customer.name}</p>
          <p className="text-sm text-neutral-500">{order.customer.phone}</p>
        </div>

        <div className="border border-stone bg-paper p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Entrega</h2>
          {order.deliveryMethod === 'pickup' ? (
            <p className="text-sm text-ink">Retirada na loja — Jaguariúna - SP</p>
          ) : (
            order.address && (
              <p className="text-sm text-ink">
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` - ${order.address.complement}` : ''}
                <br />
                {order.address.neighborhood}, {order.address.city} - {order.address.state}
                <br />
                CEP {formatZipCode(order.address.zipCode)}
                {order.shippingRegion && ` · Região: ${order.shippingRegion}`}
              </p>
            )
          )}
          {order.shippingPending && (
            <p className="mt-2 border border-gold-light bg-gold-light/40 px-3 py-2 text-xs text-ink">
              Sem faixa de frete cadastrada pra esse CEP — combine o valor com o cliente pelo WhatsApp.
            </p>
          )}
          <p className="mt-3 text-sm text-ink">Pagamento: {PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          {order.deliveryMethod === 'delivery' && order.paymentMethod === 'credit' && (
            <p className="mt-2 border border-gold-light bg-gold-light/40 px-3 py-2 text-xs text-ink">
              Cartão de crédito na entrega tem taxa adicional — combine o valor com o cliente pelo WhatsApp.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 border border-stone bg-paper p-5">
        <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Produtos</h2>
        <ul className="divide-y divide-stone">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="size-12 shrink-0 border border-stone object-cover" />
                ) : (
                  <div className="size-12 shrink-0 border border-stone bg-offwhite" />
                )}
                <span className="text-neutral-600">
                  {item.quantity}x {item.name}
                </span>
              </div>
              <span className="shrink-0 text-ink">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t border-stone pt-4 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Frete</span>
            <span>{order.shippingPending ? 'A combinar' : formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-medium text-ink">
            <span>Total</span>
            <span>
              {formatCurrency(order.total)}
              {order.shippingPending && ' + frete'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="max-w-xs flex-1">
          <Select
            label="Status do pedido"
            value={order.status}
            disabled={updating}
            onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
          >
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <a
          href={getWhatsAppUrl(order.customer.phone, generateStatusUpdateMessage(order))}
          target="_blank"
          rel="noreferrer"
        >
          <Button type="button" variant="outline">
            <MessageCircle className="size-4" />
            Notificar cliente
          </Button>
        </a>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir pedido"
        description={`Tem certeza que deseja excluir o pedido #${String(order.orderNumber).padStart(6, '0')}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
