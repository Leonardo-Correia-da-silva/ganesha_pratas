import { formatCurrency } from '@/utils/currency'
import { formatZipCode } from '@/utils/cep'
import { toWhatsAppDigits } from '@/utils/phone'
import { PAYMENT_METHOD_LABELS, type Order, type OrderStatus } from '@/types'

const STATUS_UPDATE_PHRASES: Record<OrderStatus, string> = {
  pending: 'Recebemos seu pedido e já vamos confirmar tudo.',
  confirmed: 'Seu pedido foi confirmado e já está sendo preparado com carinho.',
  preparing: 'Seu pedido está sendo preparado.',
  ready: 'Seu pedido está pronto!',
  out_for_delivery: 'Seu pedido saiu para entrega!',
  completed: 'Seu pedido foi concluído. Muito obrigado pela preferência!',
  cancelled: 'Seu pedido foi cancelado. Qualquer dúvida, é só chamar por aqui.',
}

function buildProductsSection(order: Order): string {
  return order.items
    .map((item) => `${item.quantity}x ${item.name}\n${formatCurrency(item.subtotal)}`)
    .join('\n\n')
}

function buildDeliverySection(order: Order): string {
  if (order.deliveryMethod === 'pickup') {
    return ['🏪 RETIRADA NA LOJA', '', 'Local: Jaguariúna - SP', '', `Frete: ${formatCurrency(0)}`].join('\n')
  }

  const address = order.address
  const addressLines = address
    ? [
        `CEP: ${formatZipCode(address.zipCode)}`,
        '',
        `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}`,
        address.neighborhood,
        `${address.city} - ${address.state}`,
      ]
    : []

  const shippingLine = order.shippingPending ? 'Frete: A combinar' : `Frete: ${formatCurrency(order.shipping)}`

  return ['🚚 ENTREGA', '', ...addressLines, '', shippingLine].join('\n')
}

export function generateWhatsAppMessage(order: Order): string {
  const sections = [
    '🛍️ NOVO PEDIDO',
    '',
    `Pedido: #${String(order.orderNumber).padStart(6, '0')}`,
    '',
    '👤 CLIENTE',
    '',
    `Nome: ${order.customer.name}`,
    `WhatsApp: ${order.customer.phone}`,
    '',
    '🛒 PRODUTOS',
    '',
    buildProductsSection(order),
    '',
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    '',
    buildDeliverySection(order),
    '',
    `💰 TOTAL: ${formatCurrency(order.total)}${order.shippingPending ? ' + frete (a combinar)' : ''}`,
    '',
    `💳 Pagamento: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`,
  ]

  if (order.deliveryMethod === 'delivery' && order.paymentMethod === 'credit') {
    sections.push('', '⚠️ Cartão de crédito na entrega tem taxa adicional — combine o valor com o cliente.')
  }

  return sections.join('\n')
}

export function generateStatusUpdateMessage(order: Order): string {
  const orderNumber = `#${String(order.orderNumber).padStart(6, '0')}`
  const phrase = STATUS_UPDATE_PHRASES[order.status]

  if (order.status === 'ready' && order.deliveryMethod === 'pickup') {
    return `Olá, ${order.customer.name}! Seu pedido ${orderNumber} está pronto para retirada na loja. Te esperamos! 😊`
  }

  return `Olá, ${order.customer.name}! Sobre seu pedido ${orderNumber}: ${phrase}`
}

export function getWhatsAppUrl(phoneDigits: string, message: string): string {
  const phone = toWhatsAppDigits(phoneDigits)
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
