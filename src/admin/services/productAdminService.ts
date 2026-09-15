import { adminApi } from './adminApi'
import type { Product, ProductInput } from '@/types'

export async function listAllProducts(): Promise<Product[]> {
  const data = await adminApi.get<{ products: Product[] }>('/api/admin/products')
  return data.products
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const data = await adminApi.post<{ product: Product }>('/api/admin/products', input)
  return data.product
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const data = await adminApi.put<{ product: Product }>(`/api/admin/products/${id}`, input)
  return data.product
}

export async function deleteProduct(id: string): Promise<void> {
  await adminApi.delete(`/api/admin/products/${id}`)
}
