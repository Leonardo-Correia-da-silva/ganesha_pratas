import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '@/types'

const STORAGE_KEY = 'joias:cart:v1'

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  removeItem: (productId: string, size: string | undefined) => void
  clearCart: () => void
}

function isSameLine(item: CartItem, productId: string, size: string | undefined): boolean {
  return item.productId === productId && item.size === size
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage unavailable (private browsing, quota) — cart stays in-memory for this session.
    }
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems((current) => {
      const existing = current.find((cartItem) => isSameLine(cartItem, item.productId, item.size))
      const maxQuantity = item.stock

      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, maxQuantity)
        return current.map((cartItem) =>
          isSameLine(cartItem, item.productId, item.size) ? { ...cartItem, quantity: nextQuantity } : cartItem,
        )
      }

      return [...current, { ...item, quantity: Math.min(quantity, maxQuantity) }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, size: string | undefined, quantity: number) => {
    setItems((current) =>
      current.map((item) => {
        if (!isSameLine(item, productId, size)) return item
        const clamped = Math.max(1, Math.min(quantity, item.stock))
        return { ...item, quantity: clamped }
      }),
    )
  }, [])

  const removeItem = useCallback((productId: string, size: string | undefined) => {
    setItems((current) => current.filter((item) => !isSameLine(item, productId, size)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const value = useMemo(
    () => ({ items, totalItems, subtotal, addItem, updateQuantity, removeItem, clearCart }),
    [items, totalItems, subtotal, addItem, updateQuantity, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
