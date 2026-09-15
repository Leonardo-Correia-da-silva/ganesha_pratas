import { Link } from 'react-router-dom'
import { PageHeader } from '@/admin/components/PageHeader'
import { OrderStatusBadge } from '@/admin/components/OrderStatusBadge'
import { listAllProducts } from '@/admin/services/productAdminService'
import { listAllOrders } from '@/admin/services/orderAdminService'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { formatCurrency } from '@/utils/currency'

export function Dashboard() {
  const { data: products, loading: loadingProducts } = useAsync(() => listAllProducts(), [])
  const { data: orders, loading: loadingOrders } = useAsync(() => listAllOrders(), [])

  const loading = loadingProducts || loadingOrders

  const stats = [
    { label: 'Produtos cadastrados', value: products?.length ?? 0 },
    { label: 'Produtos ativos', value: products?.filter((p) => p.active).length ?? 0 },
    { label: 'Pedidos pendentes', value: orders?.filter((o) => o.status === 'pending').length ?? 0 },
    { label: 'Pedidos concluídos', value: orders?.filter((o) => o.status === 'completed').length ?? 0 },
  ]

  const recentOrders = (orders ?? []).slice(0, 5)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-stone bg-paper p-5">
            <p className="text-2xl font-medium text-ink">{stat.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-stone bg-paper">
        <div className="flex items-center justify-between border-b border-stone px-5 py-4">
          <h2 className="font-display text-lg text-ink">Pedidos recentes</h2>
          <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-ink">
            Ver todos
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">Nenhum pedido encontrado.</p>
        ) : (
          <ul className="divide-y divide-stone">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-offwhite"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      #{String(order.orderNumber).padStart(6, '0')} · {order.customer.name}
                    </p>
                    <p className="text-xs text-neutral-500">{formatCurrency(order.total)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
