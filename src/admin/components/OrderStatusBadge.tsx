import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'
import { cn } from '@/utils/cn'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-neutral-200 text-ink',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-amber-100 text-amber-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-medium', STATUS_COLORS[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
