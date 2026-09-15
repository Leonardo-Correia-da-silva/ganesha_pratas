import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminFirestore } from '../_lib/firebaseAdmin'
import { createOrderInputSchema } from '../_lib/schemas'
import { calculateShippingServer } from '../_lib/shipping'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const parsed = createOrderInputSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do pedido inválidos.', issues: parsed.error.issues })
  }

  const payload = parsed.data

  if (payload.deliveryMethod === 'delivery' && !payload.address) {
    return res.status(400).json({ message: 'Endereço é obrigatório para entrega.' })
  }

  const db = getAdminFirestore()
  const orderRef = db.collection('orders').doc(payload.clientRequestId)

  try {
    const order = await db.runTransaction(async (tx) => {
      const existingOrder = await tx.get(orderRef)
      if (existingOrder.exists) {
        return { id: existingOrder.id, ...existingOrder.data() }
      }

      const productRefs = payload.items.map((item) => db.collection('products').doc(item.productId))
      const productSnapshots = await Promise.all(productRefs.map((ref) => tx.get(ref)))

      const orderItems: Array<{
        productId: string
        name: string
        price: number
        quantity: number
        subtotal: number
        image: string | null
      }> = []

      for (let i = 0; i < payload.items.length; i++) {
        const requestedItem = payload.items[i]
        const snapshot = productSnapshots[i]

        if (!snapshot.exists) {
          const error = new Error('PRODUCT_UNAVAILABLE') as Error & { productName?: string }
          error.productName = 'Produto'
          throw error
        }

        const product = snapshot.data() as {
          name: string
          active: boolean
          stock: number
          price: number
          promotionalPrice: number | null
          images: Array<{ url: string; isMain: boolean; order: number }>
        }

        if (!product.active) {
          const error = new Error('PRODUCT_UNAVAILABLE') as Error & { productName?: string }
          error.productName = product.name
          throw error
        }

        if (product.stock < requestedItem.quantity) {
          const error = new Error('INSUFFICIENT_STOCK') as Error & { productName?: string; available?: number }
          error.productName = product.name
          error.available = product.stock
          throw error
        }

        const effectivePrice = product.promotionalPrice ?? product.price
        const mainImage = product.images.find((img) => img.isMain) ?? product.images[0]

        orderItems.push({
          productId: requestedItem.productId,
          name: product.name,
          price: effectivePrice,
          quantity: requestedItem.quantity,
          subtotal: effectivePrice * requestedItem.quantity,
          image: mainImage?.url ?? null,
        })
      }

      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

      let shipping = 0
      let shippingRegion: string | null = null

      if (payload.deliveryMethod === 'delivery' && payload.address) {
        const shippingResult = await calculateShippingServer(db, payload.address.zipCode)
        if (shippingResult.status === 'out-of-area') {
          throw new Error('OUT_OF_DELIVERY_AREA')
        }
        shipping = shippingResult.price
        shippingRegion = shippingResult.regionName
      }

      const total = subtotal + shipping

      const counterRef = db.collection('settings').doc('orderCounter')
      const counterSnapshot = await tx.get(counterRef)
      const nextOrderNumber = (counterSnapshot.exists ? (counterSnapshot.data()?.value as number) : 0) + 1

      const now = new Date().toISOString()
      const orderData = {
        orderNumber: nextOrderNumber,
        customer: payload.customer,
        items: orderItems,
        subtotal,
        shipping,
        total,
        deliveryMethod: payload.deliveryMethod,
        shippingRegion,
        address: payload.deliveryMethod === 'delivery' ? payload.address : null,
        status: 'pending' as const,
        paymentMethod: 'A combinar' as const,
        createdAt: now,
        updatedAt: now,
      }

      tx.set(counterRef, { value: nextOrderNumber }, { merge: true })
      tx.set(orderRef, orderData)

      for (let i = 0; i < payload.items.length; i++) {
        tx.update(productRefs[i], { stock: productSnapshots[i].data()!.stock - payload.items[i].quantity })
      }

      return { id: orderRef.id, ...orderData }
    })

    return res.status(201).json({ order })
  } catch (error) {
    if (error instanceof Error) {
      const typedError = error as Error & { productName?: string; available?: number }

      if (error.message === 'INSUFFICIENT_STOCK') {
        return res.status(409).json({
          code: 'INSUFFICIENT_STOCK',
          message: `Estoque insuficiente para "${typedError.productName}".`,
          productName: typedError.productName,
          available: typedError.available,
        })
      }

      if (error.message === 'PRODUCT_UNAVAILABLE') {
        return res.status(409).json({
          code: 'PRODUCT_UNAVAILABLE',
          message: `O produto "${typedError.productName}" não está mais disponível.`,
        })
      }

      if (error.message === 'OUT_OF_DELIVERY_AREA') {
        return res.status(409).json({
          code: 'OUT_OF_DELIVERY_AREA',
          message: 'Este CEP está fora da nossa área de entrega.',
        })
      }
    }

    return res.status(500).json({ message: 'Não foi possível finalizar o pedido. Tente novamente.' })
  }
}
