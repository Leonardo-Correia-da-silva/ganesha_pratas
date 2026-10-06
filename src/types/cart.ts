export interface CartItem {
  productId: string
  slug: string
  name: string
  image: string | null
  price: number
  stock: number
  quantity: number
  size?: string
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  totalItems: number
}
