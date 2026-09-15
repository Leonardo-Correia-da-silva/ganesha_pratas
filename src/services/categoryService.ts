import { getDocs, orderBy, query, where } from 'firebase/firestore'
import { collectionRef, withId } from '@/firebase/firestore'
import type { Category } from '@/types'

const categoriesRef = collectionRef('categories')

export async function getActiveCategories(): Promise<Category[]> {
  const q = query(categoriesRef, where('active', '==', true), orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => withId<Category>(doc))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getActiveCategories()
  return categories.find((category) => category.slug === slug) ?? null
}
