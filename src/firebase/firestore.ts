import { collection, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from './config'

export const COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  shippingRegions: 'shippingRegions',
  settings: 'settings',
} as const

export function collectionRef(name: string) {
  return collection(db, name)
}

export function withId<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T & { id: string } {
  return { id: snapshot.id, ...(snapshot.data() as T) }
}
