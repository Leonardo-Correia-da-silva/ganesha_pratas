import { z } from 'zod'

export const productImageSchema = z.object({
  url: z.string().url(),
  path: z.string().min(1),
  isMain: z.boolean(),
  order: z.number().int().min(0),
})

export const productInputSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug é obrigatório.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido.'),
  description: z.string().trim().min(1, 'Descrição é obrigatória.'),
  categoryId: z.string().min(1, 'Categoria é obrigatória.'),
  price: z.number().positive('Preço deve ser maior que zero.'),
  promotionalPrice: z.number().positive().nullable(),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo.'),
  images: z.array(productImageSchema),
  videoUrl: z.string().url().nullable().or(z.literal('').transform(() => null)),
  featured: z.boolean(),
  isNew: z.boolean(),
  active: z.boolean(),
})

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug é obrigatório.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido.'),
  description: z.string().trim().optional().default(''),
  imageUrl: z.string().url().nullable().or(z.literal('').transform(() => null)).optional(),
  active: z.boolean(),
  order: z.number().int().min(0),
})

export const shippingRegionInputSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.'),
  zipCodeStart: z.string().regex(/^\d{8}$/, 'CEP inicial inválido.'),
  zipCodeEnd: z.string().regex(/^\d{8}$/, 'CEP final inválido.'),
  price: z.number().min(0, 'Valor não pode ser negativo.'),
  active: z.boolean(),
})

export const shippingSettingsInputSchema = z.object({
  mode: z.enum(['single', 'region']),
  singlePrice: z.number().min(0),
})

export const storeSettingsInputSchema = z.object({
  storeName: z.string().trim().min(1),
  logoUrl: z.string().url().nullable().or(z.literal('').transform(() => null)),
  whatsapp: z.string().trim().min(8, 'Informe um número de WhatsApp válido.'),
  instagram: z.string().trim().optional().default(''),
  email: z.string().trim().email().or(z.literal('')).optional().default(''),
  address: z.string().trim().optional().default(''),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2).max(2),
  zipCode: z.string().trim().optional().default(''),
})

export const orderAddressInputSchema = z.object({
  zipCode: z.string().regex(/^\d{8}$/, 'CEP inválido.'),
  street: z.string().trim().min(1, 'Rua é obrigatória.'),
  number: z.string().trim().min(1, 'Número é obrigatório.'),
  complement: z.string().trim().optional().default(''),
  neighborhood: z.string().trim().min(1, 'Bairro é obrigatório.'),
  city: z.string().trim().min(1, 'Cidade é obrigatória.'),
  state: z.string().trim().min(2).max(2),
})

export const createOrderInputSchema = z.object({
  clientRequestId: z.string().uuid('Requisição inválida.'),
  customer: z.object({
    name: z.string().trim().min(3, 'Nome é obrigatório.'),
    phone: z.string().trim().min(10, 'WhatsApp inválido.'),
  }),
  deliveryMethod: z.enum(['pickup', 'delivery']),
  address: orderAddressInputSchema.nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive('Quantidade deve ser maior que zero.'),
      }),
    )
    .min(1, 'O carrinho está vazio.'),
})

export const orderStatusInputSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']),
})
