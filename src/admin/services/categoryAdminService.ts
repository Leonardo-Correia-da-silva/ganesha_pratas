import { adminApi } from './adminApi'
import type { Category, CategoryInput } from '@/types'

export async function listAllCategories(): Promise<Category[]> {
  const data = await adminApi.get<{ categories: Category[] }>('/api/admin/categories')
  return data.categories
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const data = await adminApi.post<{ category: Category }>('/api/admin/categories', input)
  return data.category
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const data = await adminApi.put<{ category: Category }>(`/api/admin/categories?id=${encodeURIComponent(id)}`, input)
  return data.category
}

export async function deleteCategory(id: string): Promise<void> {
  await adminApi.delete(`/api/admin/categories?id=${encodeURIComponent(id)}`)
}
