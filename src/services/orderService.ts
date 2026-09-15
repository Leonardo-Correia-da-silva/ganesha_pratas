import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { CreateOrderPayload, CreateOrderResponse, Order } from '@/types'

export class InsufficientStockError extends Error {
  productName: string
  available: number

  constructor(productName: string, available: number) {
    super(`Estoque insuficiente para "${productName}". Disponível: ${available}.`)
    this.name = 'InsufficientStockError'
    this.productName = productName
    this.available = available
  }
}

export class OutOfDeliveryAreaError extends Error {
  constructor() {
    super('Este CEP está fora da nossa área de entrega.')
    this.name = 'OutOfDeliveryAreaError'
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const code = data?.code as string | undefined
    if (code === 'INSUFFICIENT_STOCK') {
      throw new InsufficientStockError(data.productName ?? 'produto', data.available ?? 0)
    }
    if (code === 'OUT_OF_DELIVERY_AREA') {
      throw new OutOfDeliveryAreaError()
    }
    throw new Error(data?.message ?? 'Não foi possível finalizar o pedido. Tente novamente.')
  }

  return (data as CreateOrderResponse).order
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db, 'orders', orderId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...(snapshot.data() as Omit<Order, 'id'>) }
}
