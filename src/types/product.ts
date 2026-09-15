export interface ProductImage {
  url: string
  path: string
  isMain: boolean
  order: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  price: number
  promotionalPrice: number | null
  stock: number
  images: ProductImage[]
  videoUrl: string | null
  featured: boolean
  isNew: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export interface ProductFilters {
  categorySlug?: string
  search?: string
  sortBy?: 'price-asc' | 'price-desc' | 'newest'
  minPrice?: number
  maxPrice?: number
}
