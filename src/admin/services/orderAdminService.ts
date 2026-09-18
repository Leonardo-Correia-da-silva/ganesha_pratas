import { adminApi } from './adminApi'
import type { Order, OrderStatus } from '@/types'

export async function listAllOrders(): Promise<Order[]> {
  const data = await adminApi.get<{ orders: Order[] }>('/api/admin/orders')
  return data.orders
}

export async function getAdminOrder(id: string): Promise<Order> {
  const data = await adminApi.get<{ order: Order }>(`/api/admin/orders?id=${encodeURIComponent(id)}`)
  return data.order
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const data = await adminApi.patch<{ order: Order }>(`/api/admin/orders?id=${encodeURIComponent(id)}`, { status })
  return data.order
}

export async function deleteOrder(id: string): Promise<void> {
  await adminApi.delete(`/api/admin/orders?id=${encodeURIComponent(id)}`)
}
