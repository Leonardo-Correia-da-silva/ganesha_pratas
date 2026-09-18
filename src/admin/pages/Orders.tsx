import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrderStatusBadge } from '@/admin/components/OrderStatusBadge'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { deleteOrder, listAllOrders } from '@/admin/services/orderAdminService'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/utils/currency'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types'

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteOrder(deleteTarget.id)
      setOrders((prev) => prev?.filter((o) => o.id !== deleteTarget.id) ?? null)
      setDeleteTarget(null)
    } catch {
      setError('Não foi possível excluir o pedido.')
    } finally {
      setDeleting(false)
    }
  }

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

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum pedido encontrado." />
      ) : (
        <div className="overflow-x-auto border border-stone bg-paper">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone bg-offwhite text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-offwhite">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="text-ink">
                      #{String(order.orderNumber).padStart(6, '0')}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{order.customer.name}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatCurrency(order.total)}
                    {order.shippingPending && <span className="ml-1 text-xs text-gold">+ frete a combinar</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {order.deliveryMethod === 'pickup' ? 'Retirada' : 'Entrega'}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(order)}
                        className="p-1.5 text-neutral-500 hover:text-red-600"
                        aria-label={`Excluir pedido #${String(order.orderNumber).padStart(6, '0')}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir pedido"
        description={`Tem certeza que deseja excluir o pedido #${String(deleteTarget?.orderNumber ?? 0).padStart(6, '0')}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
