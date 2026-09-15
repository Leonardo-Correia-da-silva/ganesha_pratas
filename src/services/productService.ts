import { getDocs, limit as fbLimit, query, where } from 'firebase/firestore'
import { collectionRef, withId } from '@/firebase/firestore'
import type { Product, ProductFilters } from '@/types'

const productsRef = collectionRef('products')

export async function getActiveProducts(): Promise<Product[]> {
  const q = query(productsRef, where('active', '==', true))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => withId<Product>(doc))
}

export async function getFeaturedProducts(max = 8): Promise<Product[]> {
  const q = query(productsRef, where('active', '==', true), where('featured', '==', true), fbLimit(max))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => withId<Product>(doc))
}

export async function getNewProducts(max = 8): Promise<Product[]> {
  const q = query(productsRef, where('active', '==', true), where('isNew', '==', true), fbLimit(max))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => withId<Product>(doc))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(productsRef, where('active', '==', true), where('slug', '==', slug), fbLimit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return withId<Product>(snapshot.docs[0])
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const q = query(productsRef, where('active', '==', true), where('categoryId', '==', categoryId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => withId<Product>(doc))
}

function matchesSearch(product: Product, term: string): boolean {
  const normalized = term.toLowerCase().trim()
  return (
    product.name.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized)
  )
}

export function filterAndSortProducts(products: Product[], filters: ProductFilters): Product[] {
  let result = [...products]

  if (filters.search) {
    result = result.filter((product) => matchesSearch(product, filters.search!))
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((product) => (product.promotionalPrice ?? product.price) >= filters.minPrice!)
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((product) => (product.promotionalPrice ?? product.price) <= filters.maxPrice!)
  }

  switch (filters.sortBy) {
    case 'price-asc':
      result.sort((a, b) => (a.promotionalPrice ?? a.price) - (b.promotionalPrice ?? b.price))
      break
    case 'price-desc':
      result.sort((a, b) => (b.promotionalPrice ?? b.price) - (a.promotionalPrice ?? a.price))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    default:
      break
  }

  return result
}

export async function searchProducts(term: string): Promise<Product[]> {
  const products = await getActiveProducts()
  return filterAndSortProducts(products, { search: term })
}

export function getProductMainImage(product: Pick<Product, 'images'>): string | null {
  if (product.images.length === 0) return null
  const main = product.images.find((image) => image.isMain)
  return (main ?? product.images[0]).url
}

export function getEffectivePrice(product: Pick<Product, 'price' | 'promotionalPrice'>): number {
  return product.promotionalPrice ?? product.price
}
