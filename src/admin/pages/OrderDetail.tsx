import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrderStatusBadge } from '@/admin/components/OrderStatusBadge'
import { getAdminOrder, updateOrderStatus } from '@/admin/services/orderAdminService'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/utils/currency'
import { formatZipCode } from '@/utils/cep'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types'

export function OrderDetail() {
  const { id = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

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
      <PageHeader title={`Pedido #${String(order.orderNumber).padStart(6, '0')}`} action={<OrderStatusBadge status={order.status} />} />

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
        </div>
      </div>

      <div className="mt-6 border border-stone bg-paper p-5">
        <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Produtos</h2>
        <ul className="divide-y divide-stone">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between py-2.5 text-sm">
              <span className="text-neutral-600">
                {item.quantity}x {item.name}
              </span>
              <span className="text-ink">{formatCurrency(item.subtotal)}</span>
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
            <span>{formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-medium text-ink">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-xs">
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
    </div>
  )
}
