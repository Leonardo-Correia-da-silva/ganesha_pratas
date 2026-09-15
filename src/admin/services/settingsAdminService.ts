import { adminApi } from './adminApi'
import type { ShippingRegion, ShippingRegionInput, ShippingSettings, StoreSettings } from '@/types'

export async function getAdminStoreSettings(): Promise<StoreSettings | null> {
  const data = await adminApi.get<{ settings: StoreSettings | null }>('/api/admin/settings')
  return data.settings
}

export async function updateStoreSettings(input: Omit<StoreSettings, 'updatedAt'>): Promise<StoreSettings> {
  const data = await adminApi.put<{ settings: StoreSettings }>('/api/admin/settings', input)
  return data.settings
}

export async function getAdminShippingSettings(): Promise<ShippingSettings | null> {
  const data = await adminApi.get<{ settings: ShippingSettings | null }>('/api/admin/settings/shipping')
  return data.settings
}

export async function updateShippingSettings(
  input: Pick<ShippingSettings, 'mode' | 'singlePrice'>,
): Promise<ShippingSettings> {
  const data = await adminApi.put<{ settings: ShippingSettings }>('/api/admin/settings/shipping', input)
  return data.settings
}

export async function listShippingRegions(): Promise<ShippingRegion[]> {
  const data = await adminApi.get<{ regions: ShippingRegion[] }>('/api/admin/settings/shipping/regions')
  return data.regions
}

export async function createShippingRegion(input: ShippingRegionInput): Promise<ShippingRegion> {
  const data = await adminApi.post<{ region: ShippingRegion }>('/api/admin/settings/shipping/regions', input)
  return data.region
}

export async function updateShippingRegion(id: string, input: ShippingRegionInput): Promise<ShippingRegion> {
  const data = await adminApi.put<{ region: ShippingRegion }>(`/api/admin/settings/shipping/regions/${id}`, input)
  return data.region
}

export async function deleteShippingRegion(id: string): Promise<void> {
  await adminApi.delete(`/api/admin/settings/shipping/regions/${id}`)
}
