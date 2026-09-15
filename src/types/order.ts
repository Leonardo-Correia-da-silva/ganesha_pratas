export type DeliveryMethod = 'pickup' | 'delivery'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  out_for_delivery: 'Saiu para entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
]

export interface OrderCustomer {
  name: string
  phone: string
}

export interface OrderAddress {
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image: string | null
}

export interface Order {
  id: string
  orderNumber: number
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  deliveryMethod: DeliveryMethod
  shippingRegion: string | null
  address: OrderAddress | null
  status: OrderStatus
  paymentMethod: 'A combinar'
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  clientRequestId: string
  customer: OrderCustomer
  deliveryMethod: DeliveryMethod
  address: OrderAddress | null
  items: Array<{ productId: string; quantity: number }>
}

export interface CreateOrderResponse {
  order: Order
}
