export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string | null
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
