import { z } from 'zod'
import { isValidPhone } from '@/utils/phone'
import { isValidZipCodeFormat } from '@/utils/cep'

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(3, 'Informe seu nome completo.'),
    phone: z.string().refine(isValidPhone, 'Informe um WhatsApp válido com DDD.'),
    deliveryMethod: z.enum(['pickup', 'delivery']),
    paymentMethod: z.enum(['cash', 'debit', 'credit', 'pix']),
    zipCode: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === 'delivery' && data.paymentMethod === 'cash') {
      ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: 'Pagamento em dinheiro só está disponível para retirada na loja.' })
    }

    if (data.deliveryMethod !== 'delivery') return

    if (!isValidZipCodeFormat(data.zipCode)) {
      ctx.addIssue({ code: 'custom', path: ['zipCode'], message: 'Informe um CEP válido.' })
    }
    if (!data.street.trim()) {
      ctx.addIssue({ code: 'custom', path: ['street'], message: 'Rua é obrigatória.' })
    }
    if (!data.number.trim()) {
      ctx.addIssue({ code: 'custom', path: ['number'], message: 'Número é obrigatório.' })
    }
    if (!data.neighborhood.trim()) {
      ctx.addIssue({ code: 'custom', path: ['neighborhood'], message: 'Bairro é obrigatório.' })
    }
    if (!data.city.trim()) {
      ctx.addIssue({ code: 'custom', path: ['city'], message: 'Cidade é obrigatória.' })
    }
    if (!data.state.trim()) {
      ctx.addIssue({ code: 'custom', path: ['state'], message: 'Estado é obrigatório.' })
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
