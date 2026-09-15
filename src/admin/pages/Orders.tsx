import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrderStatusBadge } from '@/admin/components/OrderStatusBadge'
import { listAllOrders } from '@/admin/services/orderAdminService'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/currency'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types'

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  useEffect(() => {
    listAllOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!orders) return []
    if (!statusFilter) return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  return (
    <div>
      <PageHeader title="Pedidos" />

      <div className="mb-6 w-full sm:w-56">
        <Select
          label="Filtrar por status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | '')}
        >
          <option value="">Todos os status</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum pedido encontrado." />
      ) : (
        <div className="overflow-x-auto border border-stone bg-paper">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone bg-offwhite text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {filtered.map((order) => (
                <tr key={order.id} className="cursor-pointer hover:bg-offwhite">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="text-ink">
                      #{String(order.orderNumber).padStart(6, '0')}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{order.customer.name}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {order.deliveryMethod === 'pickup' ? 'Retirada' : 'Entrega'}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
