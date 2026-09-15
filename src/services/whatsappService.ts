import { formatCurrency } from '@/utils/currency'
import { formatZipCode } from '@/utils/cep'
import { toWhatsAppDigits } from '@/utils/phone'
import type { Order } from '@/types'

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

  return ['🚚 ENTREGA', '', ...addressLines, '', `Frete: ${formatCurrency(order.shipping)}`].join('\n')
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
    `💰 TOTAL: ${formatCurrency(order.total)}`,
    '',
    `💳 Pagamento: ${order.paymentMethod}`,
  ]

  return sections.join('\n')
}

export function getWhatsAppUrl(phoneDigits: string, message: string): string {
  const phone = toWhatsAppDigits(phoneDigits)
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
